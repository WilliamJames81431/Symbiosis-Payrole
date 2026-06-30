import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
  Param,
  Version,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyTotpDto } from './dto/verify-totp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EnableTotpDto } from './dto/enable-totp.dto';
import { DisableTotpDto } from './dto/disable-totp.dto';
import { Public, CurrentUser } from '../common/decorators/auth.decorators';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email/username and password' })
  @ApiResponse({ status: 200, description: 'Returns access token or requires 2FA' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account locked or org suspended' })
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(dto, ip, userAgent);
  }

  @Public()
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify TOTP code after password login' })
  async verifyTotp(
    @Body() dto: VerifyTotpDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.verifyTotp(dto, ip, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current session' })
  async logout(@CurrentUser('sessionId') sessionId: string) {
    return this.authService.logout(sessionId);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout all other devices' })
  async logoutAll(
    @CurrentUser('sub') userId: string,
    @CurrentUser('sessionId') sessionId: string,
  ) {
    return this.authService.logoutAllDevices(userId, sessionId);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('2fa/setup')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate TOTP secret and QR code URL for 2FA setup' })
  async setupTotp(@CurrentUser('sub') userId: string) {
    return this.authService.setupTotp(userId);
  }

  @Post('2fa/enable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable 2FA after verifying TOTP code' })
  async enableTotp(
    @CurrentUser('sub') userId: string,
    @Body() dto: EnableTotpDto,
  ) {
    return this.authService.enableTotp(userId, dto.code);
  }

  @Post('2fa/disable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2FA (requires password confirmation)' })
  async disableTotp(
    @CurrentUser('sub') userId: string,
    @Body() dto: DisableTotpDto,
  ) {
    return this.authService.disableTotp(userId, dto.password);
  }

  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active sessions for current user' })
  async getSessions(@CurrentUser('sub') userId: string) {
    return this.authService.getSessions(userId);
  }

  @Delete('sessions/:sessionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    // Verify session belongs to this user
    return this.authService.logout(sessionId);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: any) {
    return { user };
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Start Google OAuth flow' })
  async googleAuth(@Req() req: any) {
    // Guards redirects to Google automatically
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    // Req.user contains the user info from GoogleStrategy
    const token = 'mock-google-jwt-token';
    return res.redirect(`http://localhost:5173/dashboard?token=${token}`);
  }
}
