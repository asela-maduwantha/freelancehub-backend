import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { 
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import { 
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

import { User, UserDocument } from '../../schemas/user.schema';
import { EmailService } from '../../services/email.service';
import { 
  RegisterUserDto, 
  LoginDto,
  LoginChallengeDto, 
  VerifyAuthenticationDto, 
  RegisterPasskeyDto,
  VerifyEmailDto,
  SendEmailOtpDto,
  VerifyEmailOtpDto,
  Enable2FADto,
  ForgotPasswordDto,
  ResetPasswordDto,
  LoginResponse 
} from '../../dto/auth.dto';
import { LoggingInterceptor } from 'src/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private challenges = new Map<string, string>(); // In production, use Redis

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterUserDto): Promise<{ message: string; verificationRequired: boolean }> {
    // Validate required fields
    if (!registerDto.location || !registerDto.location.country || !registerDto.location.city) {
      throw new BadRequestException('Location with country and city is required');
    }

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [
        { email: registerDto.email },
        { username: registerDto.username }
      ]
    });

    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new BadRequestException('Email already registered');
      }
      throw new BadRequestException('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create new user
    const profileData: any = {
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      location: registerDto.location
    };

    // Only include phone if provided
    if (registerDto.phone) {
      profileData.phone = registerDto.phone;
    }

    const user = new this.userModel({
      email: registerDto.email,
      username: registerDto.username,
      password: hashedPassword,
      roles: [registerDto.primaryRole],
      profile: profileData,
      verification: {
        emailVerified: false,
      },
      activity: {
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        loginCount: 0,
      }
    });

    try {
      await user.save();
    } catch (error) {
      this.logger.error('Failed to save user during registration:', error);
      
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map((err: any) => err.message);
        throw new BadRequestException(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      throw new BadRequestException('Failed to create user account');
    }

    // Generate and send email verification OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    user.verification.emailOtp = await bcrypt.hash(otp, 10);
    user.verification.emailOtpExpires = expiresAt;
    user.verification.emailOtpAttempts = 0;
    
    await user.save();

    try {
      await this.emailService.sendEmailVerificationOtp(registerDto.email, otp, registerDto.firstName);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${registerDto.email}:`, error);
      if (process.env.NODE_ENV === 'development') {
        this.logger.log(`Development Mode - Email verification OTP for ${registerDto.email}: ${otp}`);
      }
    }

    return {
      message: 'User registered successfully. Please check your email for the 6-digit verification code.',
      verificationRequired: true
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.userModel.findOne({ 
      email: loginDto.email 
    }).select('+password'); 

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.verification.emailVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    if (!user.password) {
      throw new UnauthorizedException('Password login not available for this account. Please use passkey authentication.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    user.activity.lastLoginAt = new Date();
    user.activity.loginCount = (user.activity.loginCount || 0) + 1;
    user.activity.lastActiveAt = new Date();
    await user.save();

    const payload = { 
      sub: (user._id as any).toString(), 
      email: user.email, 
      username: user.username,
      role: user.role 
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(64).toString('hex');

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);

    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
        verification: {
          emailVerified: user.verification.emailVerified,
          phoneVerified: user.verification.phoneVerified
        },
      },
      expiresIn: 900 
    };
  }

  async verifyEmail(verifyDto: VerifyEmailDto): Promise<{ success: boolean }> {
    const user = await this.userModel.findOne({
      email: verifyDto.email,
      'verification.emailVerificationToken': verifyDto.token,
      'verification.emailVerificationExpires': { $gt: new Date() }
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.verification.emailVerified = true;
    user.verification.emailVerificationToken = undefined;
    user.verification.emailVerificationExpires = undefined;
    
    await user.save();

    return { success: true };
  }

  async getAuthenticationChallenge(loginDto: LoginChallengeDto): Promise<any> {
    const user = await this.userModel.findOne({
      $or: [
        { email: loginDto.identifier.toLowerCase() },
        { username: loginDto.identifier }
      ]
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.verification.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    if (user.passkeys.length === 0) {
      throw new BadRequestException('No passkeys registered. Please register a passkey first.');
    }

    const options = await generateAuthenticationOptions({
      rpID: this.configService.get<string>('webauthn.rpId') || 'localhost',
      allowCredentials: user.passkeys.map(passkey => ({
        id: passkey.credentialId,
        type: 'public-key' as const,
      })),
      userVerification: 'preferred',
    });

    // Store challenge
    this.challenges.set((user._id as string).toString(), options.challenge);

    return options;
  }

  async verifyAuthentication(authDto: VerifyAuthenticationDto): Promise<LoginResponse> {
    const user = await this.userModel.findOne({
      $or: [
        { email: authDto.identifier.toLowerCase() },
        { username: authDto.identifier }
      ]
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const storedChallenge = this.challenges.get((user._id as string).toString());
    if (!storedChallenge) {
      throw new UnauthorizedException('Invalid challenge');
    }

    // Find the credential
    const credential = user.passkeys.find(
      passkey => passkey.credentialId === authDto.authenticationResponse.id
    );

    if (!credential) {
      throw new UnauthorizedException('Credential not found');
    }

    let verification: VerifiedAuthenticationResponse;
    try {
      verification = await verifyAuthenticationResponse({
        response: authDto.authenticationResponse as AuthenticationResponseJSON,
        expectedChallenge: storedChallenge,
        expectedOrigin: this.configService.get<string>('webauthn.origin') || 'http://localhost:3001',
        expectedRPID: this.configService.get<string>('webauthn.rpId') || 'localhost',
        authenticator: {
          credentialID: credential.credentialId,
          credentialPublicKey: Buffer.from(credential.publicKey, 'base64url'),
          counter: credential.counter,
        },
      });
    } catch (error) {
      throw new UnauthorizedException('Authentication verification failed');
    }

    if (!verification.verified) {
      throw new UnauthorizedException('Authentication failed');
    }

    // Update credential counter
    credential.counter = verification.authenticationInfo.newCounter;
    credential.lastUsed = new Date();

    // Update user activity
    user.activity.lastLoginAt = new Date();
    user.activity.lastActiveAt = new Date();
    user.activity.loginCount += 1;

    await user.save();

    // Clean up challenge
    this.challenges.delete((user._id as string).toString());

    // Generate tokens
    const payload = {
      sub: (user._id as string).toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    // Store refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        id: (user._id as string).toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
        verification: user.verification,
      },
      expiresIn: 900, // 15 minutes
    };
  }

  async getRegistrationChallenge(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const options = await generateRegistrationOptions({
      rpName: this.configService.get<string>('webauthn.rpName') || 'FreelanceHub',
      rpID: this.configService.get<string>('webauthn.rpId') || 'localhost',
      userID: new TextEncoder().encode((user._id as string).toString()),
      userName: user.email,
      userDisplayName: `${user.profile.firstName} ${user.profile.lastName}`,
      excludeCredentials: user.passkeys.map(passkey => ({
        id: passkey.credentialId,
        type: 'public-key' as const,
      })),
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
    });

    // Store challenge
    this.challenges.set(userId, options.challenge);

    return options;
  }

  async registerPasskey(userId: string, passkeyDto: RegisterPasskeyDto): Promise<{ success: boolean }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const storedChallenge = this.challenges.get(userId);
    if (!storedChallenge) {
      throw new UnauthorizedException('Invalid challenge');
    }

    let verification: VerifiedRegistrationResponse;
    try {
      verification = await verifyRegistrationResponse({
        response: passkeyDto.registrationResponse as RegistrationResponseJSON,
        expectedChallenge: storedChallenge,
        expectedOrigin: this.configService.get<string>('webauthn.origin') || 'http://localhost:3000',
        expectedRPID: this.configService.get<string>('webauthn.rpId') || 'localhost',
      });
    } catch (error) {
      throw new BadRequestException('Registration verification failed');
    }

    if (!verification.verified || !verification.registrationInfo) {
      throw new BadRequestException('Passkey registration failed');
    }

    // Add passkey to user
    user.passkeys.push({
      credentialId: verification.registrationInfo.credentialID,
      publicKey: Buffer.from(verification.registrationInfo.credentialPublicKey).toString('base64url'),
      counter: verification.registrationInfo.counter,
      deviceType: verification.registrationInfo.credentialDeviceType,
      name: passkeyDto.name,
      createdAt: new Date(),
    });

    await user.save();

    // Clean up challenge
    this.challenges.delete(userId);

    return { success: true };
  }

  async enable2FA(userId: string): Promise<{ qrCode: string; backupCodes: string[] }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.twoFactorAuth.enabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Generate secret
    const secret = authenticator.generateSecret();
    const serviceName = this.configService.get<string>('webauthn.rpName') || 'FreelanceHub';
    const otpauth = authenticator.keyuri(user.email, serviceName, secret);

    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpauth);

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Store temporarily (not active until verified)
    user.twoFactorAuth.secret = secret;
    user.twoFactorAuth.backupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

    await user.save();

    return { qrCode, backupCodes };
  }

  async verify2FASetup(userId: string, verifyDto: Enable2FADto): Promise<{ success: boolean }> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.twoFactorAuth.secret) {
      throw new BadRequestException('2FA setup not initiated');
    }

    const isValid = authenticator.verify({
      token: verifyDto.totpCode,
      secret: user.twoFactorAuth.secret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid TOTP code');
    }

    // Activate 2FA
    user.twoFactorAuth.enabled = true;
    user.twoFactorAuth.enabledAt = new Date();

    await user.save();

    return { success: true };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret') || 'fallback-refresh-secret',
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        sub: (user._id as string).toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<{ success: boolean }> {
    const user = await this.userModel.findById(userId);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      await user.save();
    }

    return { success: true };
  }

  async logoutAll(userId: string): Promise<{ success: boolean }> {
    const user = await this.userModel.findById(userId);
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }

    return { success: true };
  }

  // OTP-based methods
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendEmailOtp(sendOtpDto: SendEmailOtpDto): Promise<{ message: string; expiresIn: number }> {
    const { email, type } = sendOtpDto;
    
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Email not found');
    }

    // Check rate limiting
    const now = new Date();
    const oneMinute = 60 * 1000;
    
    if (type === 'verification') {
      // Check if already verified
      if (user.verification.emailVerified) {
        throw new BadRequestException('Email already verified');
      }
      
      // Check rate limiting for email verification
      if (user.verification.emailOtpExpires && user.verification.emailOtpExpires > now) {
        const timeLeft = Math.ceil((user.verification.emailOtpExpires.getTime() - now.getTime()) / oneMinute);
        throw new BadRequestException(`Please wait ${timeLeft} minutes before requesting a new OTP`);
      }
    } else if (type === 'password_reset') {
      // Check rate limiting for password reset
      if (user.verification.passwordResetOtpExpires && user.verification.passwordResetOtpExpires > now) {
        const timeLeft = Math.ceil((user.verification.passwordResetOtpExpires.getTime() - now.getTime()) / oneMinute);
        throw new BadRequestException(`Please wait ${timeLeft} minutes before requesting a new OTP`);
      }
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (type === 'verification') {
      user.verification.emailOtp = await bcrypt.hash(otp, 10);
      user.verification.emailOtpExpires = expiresAt;
      user.verification.emailOtpAttempts = 0;
      
      await user.save();
      await this.emailService.sendEmailVerificationOtp(email, otp, user.profile.firstName);
    } else if (type === 'password_reset') {
      user.verification.passwordResetOtp = await bcrypt.hash(otp, 10);
      user.verification.passwordResetOtpExpires = expiresAt;
      user.verification.passwordResetOtpAttempts = 0;
      
      await user.save();
      await this.emailService.sendPasswordResetOtp(email, otp, user.profile.firstName);
    }

    return {
      message: `OTP sent to ${email}`,
      expiresIn: 600 // 10 minutes in seconds
    };
  }

  async verifyEmailOtp(verifyOtpDto: VerifyEmailOtpDto): Promise<{ success: boolean; message: string; accessToken?: string; refreshToken?: string; user?: any; expiresIn?: number }> {
    const { email, otp } = verifyOtpDto;
    
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Email not found');
    }

    if (user.verification.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (!user.verification.emailOtp || !user.verification.emailOtpExpires) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    if (user.verification.emailOtpExpires < new Date()) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Check attempt limit
    if ((user.verification.emailOtpAttempts || 0) >= 5) {
      throw new BadRequestException('Too many invalid attempts. Please request a new OTP.');
    }

    const isOtpValid = await bcrypt.compare(otp, user.verification.emailOtp);
    
    if (!isOtpValid) {
      user.verification.emailOtpAttempts = (user.verification.emailOtpAttempts || 0) + 1;
      await user.save();
      
      const remainingAttempts = 5 - (user.verification.emailOtpAttempts || 0);
      throw new BadRequestException(`Invalid OTP. ${remainingAttempts} attempts remaining.`);
    }

    // Verify email
    user.verification.emailVerified = true;
    user.verification.emailOtp = undefined;
    user.verification.emailOtpExpires = undefined;
    user.verification.emailOtpAttempts = 0;
    user.verification.emailVerificationToken = undefined;
    user.verification.emailVerificationExpires = undefined;
    
    // Update user activity
    user.activity.lastLoginAt = new Date();
    user.activity.lastActiveAt = new Date();
    user.activity.loginCount = (user.activity.loginCount || 0) + 1;
    
    await user.save();

    // Generate tokens for immediate login after verification
    const payload = { 
      sub: (user._id as any).toString(), 
      email: user.email, 
      username: user.username,
      role: user.role 
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(64).toString('hex');

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);

    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    return { 
      success: true, 
      message: 'Email verified successfully',
      accessToken,
      refreshToken,
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
        verification: {
          emailVerified: user.verification.emailVerified,
          phoneVerified: user.verification.phoneVerified
        },
      },
      expiresIn: 900 // 15 minutes
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string; expiresIn: number }> {
    const { email } = forgotPasswordDto;
    
    const user = await this.userModel.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return {
        message: 'If the email exists, a password reset OTP has been sent.',
        expiresIn: 600
      };
    }

    const now = new Date();
    
    // Check rate limiting
    if (user.verification.passwordResetOtpExpires && user.verification.passwordResetOtpExpires > now) {
      const timeLeft = Math.ceil((user.verification.passwordResetOtpExpires.getTime() - now.getTime()) / (60 * 1000));
      throw new BadRequestException(`Please wait ${timeLeft} minutes before requesting a new password reset OTP`);
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verification.passwordResetOtp = await bcrypt.hash(otp, 10);
    user.verification.passwordResetOtpExpires = expiresAt;
    user.verification.passwordResetOtpAttempts = 0;
    
    await user.save();
    await this.emailService.sendPasswordResetOtp(email, otp, user.profile.firstName);

    return {
      message: 'Password reset OTP sent to your email',
      expiresIn: 600 // 10 minutes in seconds
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
    const { email, otp, newPassword } = resetPasswordDto;
    
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Invalid reset request');
    }

    if (!user.verification.passwordResetOtp || !user.verification.passwordResetOtpExpires) {
      throw new BadRequestException('No password reset OTP found. Please request a new one.');
    }

    if (user.verification.passwordResetOtpExpires < new Date()) {
      throw new BadRequestException('Password reset OTP has expired. Please request a new one.');
    }

    // Check attempt limit
    if ((user.verification.passwordResetOtpAttempts || 0) >= 5) {
      throw new BadRequestException('Too many invalid attempts. Please request a new password reset OTP.');
    }

    const isOtpValid = await bcrypt.compare(otp, user.verification.passwordResetOtp);
    
    if (!isOtpValid) {
      user.verification.passwordResetOtpAttempts = (user.verification.passwordResetOtpAttempts || 0) + 1;
      await user.save();
      
      const remainingAttempts = 5 - (user.verification.passwordResetOtpAttempts || 0);
      throw new BadRequestException(`Invalid OTP. ${remainingAttempts} attempts remaining.`);
    }

    // Reset password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.lastPasswordReset = new Date();
    
    // Clear password reset OTP
    user.verification.passwordResetOtp = undefined;
    user.verification.passwordResetOtpExpires = undefined;
    user.verification.passwordResetOtpAttempts = 0;
    
    // Invalidate all refresh tokens for security
    user.refreshTokens = [];
    
    await user.save();

    return { 
      success: true, 
      message: 'Password reset successfully' 
    };
  }
}
