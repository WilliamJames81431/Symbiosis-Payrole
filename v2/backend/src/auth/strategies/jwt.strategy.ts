import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.publicKeyPath') || 'symbiosis_dev_secret_key_change_in_prod',
    });
  }

  async validate(payload: any) {
    // Check if the token is an access token
    if (payload.type !== 'ACCESS') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Verify user still exists and is active
    const user = await this.prisma.userAccount.findUnique({
      where: { id: payload.sub },
      include: {
        org: { select: { id: true, status: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is not active');
    }

    if (user.org && !['ACTIVE', 'TRIAL'].includes(user.org.status)) {
      throw new UnauthorizedException('Organization is suspended');
    }

    // The returned object is attached to request.user
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      sessionId: payload.sessionId, // If we encoded it
    };
  }
}
