import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
const { authenticator } = require('otplib');
import { randomUUID } from 'crypto';
import { UserStatus } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyTotpDto } from './dto/verify-totp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MINUTES = 30;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ─── LOGIN ──────────────────────────────────────────────────
  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.prisma.userAccount.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { username: dto.identifier }],
        isDeleted: false,
      },
      include: { org: { select: { id: true, orgCode: true, status: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check account lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`Account locked. Try again in ${minutes} minutes.`);
    }

    // Verify password
    let passwordValid = false;
    try {
      passwordValid = await argon2.verify(user.passwordHash, dto.password);
    } catch {
      passwordValid = false;
    }

    if (!passwordValid) {
      await this.handleFailedLogin(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user status
    if (user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException('Account is inactive. Contact your administrator.');
    }
    if (user.status === UserStatus.PENDING_ACTIVATION) {
      throw new ForbiddenException('Please complete email verification before logging in.');
    }

    // Check org status
    if (user.org && !['ACTIVE', 'TRIAL'].includes(user.org.status)) {
      throw new ForbiddenException('Your organization account is suspended. Contact support.');
    }

    // Reset failed login count
    await this.prisma.userAccount.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    // If 2FA is enabled, return a pre-auth token
    if (user.totpEnabled) {
      const preAuthToken = await this.generatePreAuthToken(user.id);
      return {
        requiresTwoFactor: true,
        preAuthToken,
      };
    }

    // Generate tokens
    return this.generateAuthResponse(user, ipAddress, userAgent);
  }

  // ─── 2FA VERIFY ─────────────────────────────────────────────
  async verifyTotp(dto: VerifyTotpDto, ipAddress: string, userAgent: string) {
    // Verify pre-auth token
    let payload: any;
    try {
      payload = this.jwt.verify(dto.preAuthToken, { secret: 'pre-auth-secret' });
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    if (payload.type !== 'PRE_AUTH') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.userAccount.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.totpSecret) {
      throw new UnauthorizedException('Invalid authentication state');
    }

    // Verify TOTP
    const isValid = authenticator.verify({
      token: dto.code,
      secret: user.totpSecret,
    });

    if (!isValid) {
      // Check backup codes
      const backupCodes = (user.backupCodes as string[]) || [];
      const hashedCode = crypto.createHash('sha256').update(dto.code).digest('hex');
      const codeIndex = backupCodes.indexOf(hashedCode);

      if (codeIndex === -1) {
        throw new UnauthorizedException('Invalid authentication code');
      }

      // Remove used backup code
      backupCodes.splice(codeIndex, 1);
      await this.prisma.userAccount.update({
        where: { id: user.id },
        data: { backupCodes },
      });
    }

    return this.generateAuthResponse(user, ipAddress, userAgent);
  }

  // ─── REFRESH TOKEN ───────────────────────────────────────────
  async refreshToken(dto: RefreshTokenDto) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.refreshToken)
      .digest('hex');

    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash: tokenHash,
        isActive: true,
        expiresAt: { gt: new Date() },
        revokedAt: null,
      },
      include: {
        user: {
          include: { org: { select: { id: true, orgCode: true, status: true } } },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Update session last active
    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() },
    });

    // Issue new access token (refresh token stays the same)
    const accessToken = await this.generateAccessToken(session.user);

    return { accessToken };
  }

  // ─── LOGOUT ──────────────────────────────────────────────────
  async logout(sessionId: string) {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false, revokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }

  // ─── LOGOUT ALL DEVICES ──────────────────────────────────────
  async logoutAllDevices(userId: string, currentSessionId?: string) {
    await this.prisma.session.updateMany({
      where: {
        userId,
        isActive: true,
        ...(currentSessionId ? { id: { not: currentSessionId } } : {}),
      },
      data: { isActive: false, revokedAt: new Date() },
    });
    return { message: 'All other sessions terminated' };
  }

  // ─── FORGOT PASSWORD ─────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.userAccount.findFirst({
      where: { email: dto.email, isDeleted: false },
    });

    // Always return success (don't leak if email exists)
    if (!user) {
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    // Invalidate existing tokens
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Generate secure token
    const rawToken = randomUUID();
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        type: 'PASSWORD_RESET',
        expiresAt,
      },
    });

    // TODO: Send email with reset link
    this.logger.log(`Password reset token generated for ${user.email}`);

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  // ─── RESET PASSWORD ──────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    const tokenRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        type: 'PASSWORD_RESET',
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Validate new password strength
    if (dto.newPassword.length < 12) {
      throw new BadRequestException('Password must be at least 12 characters');
    }

    // Check password history
    const passwordHistory = (tokenRecord.user.passwordHistory as string[]) || [];
    for (const oldHash of passwordHistory.slice(-5)) {
      const isReused = await argon2.verify(oldHash, dto.newPassword);
      if (isReused) {
        throw new BadRequestException('Cannot reuse your last 5 passwords');
      }
    }

    const newHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Update password and history
    await this.prisma.$transaction([
      this.prisma.userAccount.update({
        where: { id: tokenRecord.userId },
        data: {
          passwordHash: newHash,
          passwordChangedAt: new Date(),
          passwordHistory: [...passwordHistory.slice(-4), newHash],
          failedLoginCount: 0,
          lockedUntil: null,
        },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all sessions
      this.prisma.session.updateMany({
        where: { userId: tokenRecord.userId },
        data: { isActive: false, revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password reset successfully. Please log in.' };
  }

  // ─── SETUP 2FA ───────────────────────────────────────────────
  async setupTotp(userId: string) {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(
      user.email,
      'Symbiosis HRMS',
      secret,
    );

    // Store secret temporarily (not enabled yet)
    await this.prisma.userAccount.update({
      where: { id: userId },
      data: { totpSecret: secret },
    });

    return { secret, otpAuthUrl };
  }

  // ─── ENABLE 2FA ──────────────────────────────────────────────
  async enableTotp(userId: string, code: string) {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
    });
    if (!user || !user.totpSecret) {
      throw new BadRequestException('2FA setup not initiated');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.totpSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase(),
    );
    const hashedCodes = backupCodes.map((code) =>
      crypto.createHash('sha256').update(code).digest('hex'),
    );

    await this.prisma.userAccount.update({
      where: { id: userId },
      data: { totpEnabled: true, backupCodes: hashedCodes },
    });

    return { message: '2FA enabled successfully', backupCodes };
  }

  // ─── DISABLE 2FA ─────────────────────────────────────────────
  async disableTotp(userId: string, password: string) {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const passwordValid = await argon2.verify(user.passwordHash, password);
    if (!passwordValid) throw new UnauthorizedException('Invalid password');

    await this.prisma.userAccount.update({
      where: { id: userId },
      data: { totpEnabled: false, totpSecret: null, backupCodes: [] },
    });

    return { message: '2FA disabled successfully' };
  }

  // ─── GET ACTIVE SESSIONS ─────────────────────────────────────
  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        browser: true,
        os: true,
        ipAddress: true,
        city: true,
        country: true,
        createdAt: true,
        lastActiveAt: true,
      },
      orderBy: { lastActiveAt: 'desc' },
    });
  }

  // ─── PRIVATE HELPERS ─────────────────────────────────────────

  private async generateAuthResponse(user: any, ipAddress: string, userAgent: string) {
    const accessToken = await this.generateAccessToken(user);
    const { refreshToken, session } = await this.createSession(user.id, ipAddress, userAgent);

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        orgId: user.orgId,
        orgCode: user.org?.orgCode,
        theme: user.theme,
        timezone: user.timezone,
        locale: user.locale,
        totpEnabled: user.totpEnabled,
      },
    };
  }

  private async generateAccessToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      type: 'ACCESS',
    };

    return this.jwt.signAsync(payload, {
      expiresIn: this.config.get('jwt.accessTokenExpiry', '15m'),
    });
  }

  private async createSession(userId: string, ipAddress: string, userAgent: string) {
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        ipAddress,
        deviceName: this.parseDeviceName(userAgent),
        deviceType: this.parseDeviceType(userAgent),
        browser: this.parseBrowser(userAgent),
        os: this.parseOS(userAgent),
        expiresAt,
      },
    });

    return { refreshToken, session };
  }

  private async generatePreAuthToken(userId: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId, type: 'PRE_AUTH' },
      { secret: 'pre-auth-secret', expiresIn: '5m' },
    );
  }

  private async handleFailedLogin(userId: string): Promise<void> {
    const user = await this.prisma.userAccount.findUnique({ where: { id: userId } });
    if (!user) return;

    const newCount = user.failedLoginCount + 1;
    const updateData: any = { failedLoginCount: newCount };

    if (newCount >= this.MAX_FAILED_ATTEMPTS) {
      updateData.lockedUntil = new Date(
        Date.now() + this.LOCK_DURATION_MINUTES * 60 * 1000,
      );
      updateData.status = UserStatus.LOCKED;
    }

    await this.prisma.userAccount.update({ where: { id: userId }, data: updateData });
  }

  private parseDeviceName(ua: string): string {
    if (!ua) return 'Unknown Device';
    if (ua.includes('Mobile')) return 'Mobile Browser';
    if (ua.includes('Tablet')) return 'Tablet Browser';
    return 'Desktop Browser';
  }

  private parseDeviceType(ua: string): string {
    if (!ua) return 'DESKTOP';
    if (ua.includes('Mobile')) return 'MOBILE';
    if (ua.includes('Tablet')) return 'TABLET';
    return 'DESKTOP';
  }

  private parseBrowser(ua: string): string {
    if (!ua) return 'Unknown';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private parseOS(ua: string): string {
    if (!ua) return 'Unknown';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }
}
