import { 
  IsEmail, 
  IsString, 
  IsEnum, 
  IsPhoneNumber, 
  IsOptional, 
  Length, 
  Matches, 
  IsDateString,
  ValidateNested,
  IsArray,
  ArrayMaxSize,
  IsBoolean,
  IsObject
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty({ example: 'Sri Lanka' })
  @IsString()
  @Length(2, 100)
  country: string;

  @ApiProperty({ example: 'Colombo' })
  @IsString()
  @Length(2, 100)
  city: string;

  @ApiPropertyOptional({ example: [79.8612, 6.9271] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  coordinates?: [number, number];
}

export class RegisterUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ example: 'johndoe123' })
  @IsString()
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username can only contain letters, numbers, hyphens, and underscores'
  })
  username: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @Length(2, 50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @Length(2, 50)
  lastName: string;

  @ApiProperty({ enum: ['freelancer', 'client'], example: 'freelancer' })
  @IsEnum(['freelancer', 'client'])
  primaryRole: string;

  @ApiPropertyOptional({ example: '+94701234567' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ 
    example: 'StrongPassword123!',
    description: 'Password must contain at least 8 characters with uppercase, lowercase, number and special character'
  })
  @IsString()
  @Length(8, 128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  password: string;
}

export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}

export class SendEmailOtpDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ 
    enum: ['verification', 'password_reset'], 
    example: 'verification',
    description: 'Type of OTP to send' 
  })
  @IsEnum(['verification', 'password_reset'])
  type: 'verification' | 'password_reset';
}

export class VerifyEmailOtpDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ 
    example: '123456',
    description: '6-digit OTP code' 
  })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number' })
  otp: string;
}

export class LoginChallengeDto {
  @ApiProperty()
  @IsString()
  identifier: string; // email or username
}

export class LoginDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @Length(1, 128)
  password: string;
}

export class RegisterPasskeyDto {
  @ApiProperty()
  @IsString()
  name: string; // User-given name for the passkey

  @ApiProperty()
  @IsObject()
  registrationResponse: any; // WebAuthn registration response

  @ApiProperty()
  @IsString()
  challenge: string;
}

export class VerifyAuthenticationDto {
  @ApiProperty()
  @IsString()
  identifier: string;

  @ApiProperty()
  @IsObject()
  authenticationResponse: any; // WebAuthn authentication response

  @ApiProperty()
  @IsString()
  challenge: string;
}

export class Enable2FADto {
  @ApiProperty()
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  totpCode: string;
}

export class Verify2FADto {
  @ApiProperty()
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  totpCode: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\//)
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  language?: string;

  @ApiPropertyOptional({ example: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsEnum(['USD', 'LKR'])
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };

  @ApiPropertyOptional({ enum: ['public', 'private'] })
  @IsOptional()
  @IsEnum(['public', 'private'])
  profileVisibility?: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @Length(8, 128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ 
    example: '123456',
    description: '6-digit OTP code' 
  })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number' })
  otp: string;

  @ApiProperty()
  @IsString()
  @Length(8, 128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  newPassword: string;
}

export class LoginResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    profile: any;
    verification: any;
    twoFactorEnabled?: boolean;
  };

  @ApiProperty()
  expiresIn: number;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
