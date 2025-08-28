import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  RegisterUserDto,
  LoginDto,
  LoginChallengeDto,
  VerifyAuthenticationDto,
  RegisterPasskeyDto,
  VerifyEmailDto,
  SendEmailOtpDto,
  VerifyEmailOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  Enable2FADto,
  LoginResponse,
  RefreshTokenDto,
} from '../../dto/auth.dto';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user with email verification' })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        verificationRequired: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponse
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials or email not verified' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification token' })
  async verifyEmail(@Body() verifyDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyDto);
  }

  @Post('send-email-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to email for verification or password reset' })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        expiresIn: { type: 'number', description: 'Expiry time in seconds' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - email not found or rate limited' })
  async sendEmailOtp(@Body() sendOtpDto: SendEmailOtpDto) {
    return this.authService.sendEmailOtp(sendOtpDto);
  }

  @Post('verify-email-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email using OTP and get access tokens' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully with authentication tokens',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        accessToken: { type: 'string', description: 'JWT access token for immediate login' },
        refreshToken: { type: 'string', description: 'Refresh token for token renewal' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string' },
            profile: { type: 'object' },
            verification: { type: 'object' }
          }
        },
        expiresIn: { type: 'number', description: 'Token expiry time in seconds' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP or OTP expired' })
  async verifyEmailOtp(@Body() verifyOtpDto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailOtp(verifyOtpDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset OTP to email' })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset OTP sent',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        expiresIn: { type: 'number', description: 'Expiry time in seconds' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Rate limited or invalid request' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using OTP' })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP or OTP expired' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('login/challenge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get WebAuthn authentication challenge' })
  @ApiResponse({ 
    status: 200, 
    description: 'Authentication challenge generated',
    schema: {
      type: 'object',
      description: 'WebAuthn PublicKeyCredentialRequestOptions'
    }
  })
  @ApiResponse({ status: 401, description: 'User not found or not verified' })
  @ApiResponse({ status: 400, description: 'No passkeys registered' })
  async getAuthenticationChallenge(@Body() loginDto: LoginChallengeDto) {
    return this.authService.getAuthenticationChallenge(loginDto);
  }

  @Post('login/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify WebAuthn authentication' })
  @ApiResponse({ 
    status: 200, 
    description: 'Authentication successful',
    type: LoginResponse
  })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  async verifyAuthentication(@Body() authDto: VerifyAuthenticationDto): Promise<LoginResponse> {
    return this.authService.verifyAuthentication(authDto);
  }

  @Post('passkey/registration-challenge')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get WebAuthn registration challenge for authenticated user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Registration challenge generated',
    schema: {
      type: 'object',
      description: 'WebAuthn PublicKeyCredentialCreationOptions'
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRegistrationChallenge(@Request() req) {
    return this.authService.getRegistrationChallenge(req.user._id.toString());
  }

  @Post('passkey/register')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register new passkey for authenticated user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Passkey registered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Passkey registration failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async registerPasskey(@Body() passkeyDto: RegisterPasskeyDto, @Request() req) {
    return this.authService.registerPasskey(req.user._id.toString(), passkeyDto);
  }

  @Post('2fa/enable')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable 2FA and get QR code' })
  @ApiResponse({ 
    status: 200, 
    description: '2FA setup initiated',
    schema: {
      type: 'object',
      properties: {
        qrCode: { type: 'string', description: 'Base64 QR code image' },
        backupCodes: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 400, description: '2FA already enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enable2FA(@Request() req) {
    return this.authService.enable2FA(req.user._id.toString());
  }

  @Post('2fa/verify-setup')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA setup with TOTP code' })
  @ApiResponse({ 
    status: 200, 
    description: '2FA activated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid TOTP code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verify2FASetup(@Body() verifyDto: Enable2FADto, @Request() req) {
    return this.authService.verify2FASetup(req.user._id.toString(), verifyDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from current device' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logged out successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req, @Body() refreshDto: RefreshTokenDto) {
    return this.authService.logout(req.user._id.toString(), refreshDto.refreshToken);
  }

  @Post('logout-all')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logged out from all devices',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAll(@Request() req) {
    return this.authService.logoutAll(req.user._id.toString());
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Current user information',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        roles: { type: 'array', items: { type: 'string' } },
        profile: { type: 'object' },
        verification: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    const user = req.user;
   
    return {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      profile: user.profile,
      verification: user.verification,
      preferences: user.preferences
    };
  }
}
