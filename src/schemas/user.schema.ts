import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

// Embedded schemas
@Schema({ _id: false })
export class Profile {
  @Prop({ required: true, maxlength: 50 })
  firstName: string;

  @Prop({ required: true, maxlength: 50 })
  lastName: string;

  @Prop({ validate: /^https?:\/\// })
  avatar?: string;

  @Prop({ 
    validate: {
      validator: function(v: string) {
        return !v || /^\+[1-9]\d{1,14}$/.test(v);
      },
      message: 'Phone number must be in valid international format (e.g., +1234567890)'
    }
  })
  phone?: string;


}

@Schema({ _id: false })
export class PasskeyCredential {
  @Prop({ required: true, unique: true, sparse: true })
  credentialId: string;

  @Prop({ required: true })
  publicKey: string;

  @Prop({ default: 0 })
  counter: number;

  @Prop({ required: true })
  deviceType: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  lastUsed?: Date;
}

@Schema({ _id: false })
export class TwoFactorAuth {
  @Prop({ default: false })
  enabled: boolean;

  @Prop()
  secret?: string;

  @Prop({ type: [String] })
  backupCodes?: string[];

  @Prop()
  enabledAt?: Date;
}

@Schema({ _id: false })
export class Verification {
  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  emailVerificationExpires?: Date;

  @Prop()
  emailOtp?: string;

  @Prop()
  emailOtpExpires?: Date;

  @Prop({ default: 0 })
  emailOtpAttempts?: number;

  @Prop({ default: false })
  phoneVerified: boolean;

  @Prop()
  phoneVerificationToken?: string;

  @Prop()
  phoneVerificationExpires?: Date;

  @Prop()
  phoneOtp?: string;

  @Prop()
  phoneOtpExpires?: Date;

  @Prop({ default: 0 })
  phoneOtpAttempts?: number;

  @Prop()
  passwordResetOtp?: string;

  @Prop()
  passwordResetOtpExpires?: Date;

  @Prop({ default: 0 })
  passwordResetOtpAttempts?: number;
}

@Schema({ _id: false })
export class UserPreferences {
  @Prop({ default: 'en' })
  language: string;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({
    type: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    default: {}
  })
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };

  @Prop({ default: 'public' })
  profileVisibility: string;
}

@Schema({ _id: false })
export class UserActivity {
  @Prop({ default: Date.now })
  lastLoginAt: Date;

  @Prop()
  lastLoginIP?: string;

  @Prop({ default: 0 })
  loginCount: number;

  @Prop({ default: Date.now })
  lastActiveAt: Date;

  @Prop({ default: 0 })
  totalTimeSpent: number; // in seconds
}

// Client profile embedded schema
@Schema({ _id: false })
export class ClientProfile {
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  favoriteFreelancers: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Project', default: [] })
  projectHistory: Types.ObjectId[];

  @Prop({ default: 0 })
  totalSpent: number;

  @Prop({ default: 0 })
  projectsPosted: number;
}

// Freelancer profile reference schema
@Schema({ _id: false })
export class FreelancerProfileRef {
  @Prop({ type: [Types.ObjectId], ref: 'Project', default: [] })
  bookmarkedProjects: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [String], default: [] })
  categories: string[];
}

// Main User schema
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true, unique: true, minlength: 3, maxlength: 50 })
  username: string;

  @Prop({ select: false }) // Hide password in queries by default
  password?: string;

  @Prop({ type: Profile, required: true })
  profile: Profile;

  @Prop({ type: Verification, default: {} })
  verification: Verification;

  @Prop({ type: [PasskeyCredential], default: [] })
  passkeys: PasskeyCredential[];

  @Prop({ type: TwoFactorAuth, default: {} })
  twoFactorAuth: TwoFactorAuth;

  @Prop({ type: UserPreferences, default: {} })
  preferences: UserPreferences;

  @Prop({ type: UserActivity, default: {} })
  activity: UserActivity;

  @Prop({ enum: ['active', 'suspended', 'deactivated'], default: 'active' })
  status: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isSuspended: boolean;

  @Prop()
  suspendedAt?: Date;

  @Prop()
  suspensionReason?: string;

  @Prop()
  deletedAt?: Date;

  @Prop()
  deletionReason?: string;

  @Prop({ enum: ['client', 'freelancer', 'admin'], default: 'client' })
  role: string;

  @Prop()
  lastLogin?: Date;

  @Prop()
  lastPasswordReset?: Date;

  @Prop({ type: [String], default: [] })
  refreshTokens: string[];

  @Prop()
  stripeCustomerId?: string;

  @Prop()
  stripeConnectedAccountId?: string;

  // Role-specific profiles
  @Prop({ type: ClientProfile })
  clientProfile?: ClientProfile;

  @Prop({ type: FreelancerProfileRef })
  freelancerProfile?: FreelancerProfileRef;

  // Timestamps (automatically added by timestamps: true)
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ status: 1, createdAt: -1 });

// Virtual for full name
UserSchema.virtual('profile.fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Pre-save middleware for email normalization
UserSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});
