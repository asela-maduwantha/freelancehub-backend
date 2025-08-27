import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'fallback-jwt-secret',
    });
  }

  async validate(payload: any) {
    const user = await this.userModel.findById(payload.sub).select('-password -refreshTokens -twoFactorAuth.secret -twoFactorAuth.backupCodes');
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.verification.emailVerified) {
      throw new UnauthorizedException('Please verify your email address');
    }

    return {
      id: (user._id as string).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
    };
  }
}
