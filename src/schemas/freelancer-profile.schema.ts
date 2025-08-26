import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FreelancerProfileDocument = FreelancerProfile & Document;

// Embedded schemas
@Schema({ _id: false })
export class Professional {
  @Prop({ required: true, maxlength: 100 })
  title: string;

  @Prop({ required: true, maxlength: 2000 })
  description: string;

  @Prop({ enum: ['entry', 'intermediate', 'expert'], required: true })
  experience: string;

  @Prop({ enum: ['available', 'busy', 'unavailable'], default: 'available' })
  availability: string;

  @Prop({
    type: {
      timezone: { type: String, required: true },
      schedule: {
        monday: { start: String, end: String, available: { type: Boolean, default: true } },
        tuesday: { start: String, end: String, available: { type: Boolean, default: true } },
        wednesday: { start: String, end: String, available: { type: Boolean, default: true } },
        thursday: { start: String, end: String, available: { type: Boolean, default: true } },
        friday: { start: String, end: String, available: { type: Boolean, default: true } },
        saturday: { start: String, end: String, available: { type: Boolean, default: false } },
        sunday: { start: String, end: String, available: { type: Boolean, default: false } }
      }
    }
  })
  workingHours: {
    timezone: string;
    schedule: {
      [key: string]: {
        start: string;
        end: string;
        available: boolean;
      };
    };
  };
}

@Schema({ _id: false })
export class Skills {
  @Prop({ type: [String], required: true, validate: [(val: string[]) => val.length > 0, 'At least one primary skill required'] })
  primary: string[];

  @Prop({ type: [String] })
  secondary?: string[];

  @Prop({ type: [String], required: true })
  categories: string[];

  @Prop({
    type: [{
      name: { type: String, required: true },
      level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], required: true },
      yearsOfExperience: { type: Number, min: 0, max: 50 }
    }]
  })
  detailed: {
    name: string;
    level: string;
    yearsOfExperience: number;
  }[];
}

@Schema({ _id: false })
export class PortfolioItem {
  @Prop({ required: true, maxlength: 100 })
  title: string;

  @Prop({ required: true, maxlength: 1000 })
  description: string;

  @Prop({ type: [String] })
  images: string[];

  @Prop()
  liveUrl?: string;

  @Prop()
  repositoryUrl?: string;

  @Prop({ type: [String] })
  technologies: string[];

  @Prop()
  completedAt: Date;

  @Prop({ required: true })
  category: string;

  @Prop({ default: true })
  isPublic: boolean;
}

@Schema({ _id: false })
export class Pricing {
  @Prop({
    type: {
      min: { type: Number, min: 1, max: 10000 },
      max: { type: Number, min: 1, max: 10000 },
      currency: { type: String, default: 'USD', enum: ['USD', 'LKR'] }
    }
  })
  hourlyRate?: {
    min: number;
    max: number;
    currency: string;
  };

  @Prop({
    type: [{
      title: { type: String, required: true, maxlength: 100 },
      description: { type: String, required: true, maxlength: 500 },
      price: { type: Number, required: true, min: 1 },
      deliveryDays: { type: Number, required: true, min: 1, max: 365 },
      revisions: { type: Number, min: 0, max: 10 },
      features: [String]
    }]
  })
  fixedPricePackages?: {
    title: string;
    description: string;
    price: number;
    deliveryDays: number;
    revisions: number;
    features: string[];
  }[];
}

@Schema({ _id: false })
export class Education {
  @Prop({ required: true })
  institution: string;

  @Prop({ required: true })
  degree: string;

  @Prop()
  fieldOfStudy?: string;

  @Prop()
  startYear: number;

  @Prop()
  endYear?: number;

  @Prop()
  description?: string;

  @Prop({ default: false })
  isCurrent: boolean;
}

@Schema({ _id: false })
export class Certification {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  issuingOrganization: string;

  @Prop()
  credentialId?: string;

  @Prop()
  credentialUrl?: string;

  @Prop({ required: true })
  issueDate: Date;

  @Prop()
  expirationDate?: Date;

  @Prop()
  description?: string;
}

@Schema({ _id: false })
export class Language {
  @Prop({ required: true })
  name: string;

  @Prop({ enum: ['native', 'fluent', 'conversational', 'basic'], required: true })
  proficiency: string;
}

@Schema({ _id: false })
export class FreelancerStats {
  @Prop({ default: 0 })
  totalEarnings: number;

  @Prop({ default: 0 })
  totalProjects: number;

  @Prop({ default: 0 })
  completedProjects: number;

  @Prop({ default: 0 })
  ongoingProjects: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 100 })
  successRate: number;

  @Prop({ default: 0 })
  responseTime: number; // in hours

  @Prop({ default: 0 })
  repeatClientRate: number;

  @Prop()
  lastProjectCompletedAt?: Date;

  @Prop({ default: Date.now })
  profileCreatedAt: Date;
}

@Schema({ _id: false })
export class Visibility {
  @Prop({ default: true })
  searchable: boolean;

  @Prop({ default: true })
  showInRecommendations: boolean;

  @Prop({ default: true })
  showPortfolio: boolean;

  @Prop({ default: true })
  showRates: boolean;

  @Prop({ default: true })
  showContactInfo: boolean;
}

// Main FreelancerProfile schema
@Schema({ timestamps: true })
export class FreelancerProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Professional, required: true })
  professional: Professional;

  @Prop({ type: Skills, required: true })
  skills: Skills;

  @Prop({ type: [PortfolioItem], default: [] })
  portfolio: PortfolioItem[];

  @Prop({ type: Pricing })
  pricing?: Pricing;

  @Prop({ type: [Education], default: [] })
  education: Education[];

  @Prop({ type: [Certification], default: [] })
  certifications: Certification[];

  @Prop({ type: [Language], required: true })
  languages: Language[];

  @Prop({ type: FreelancerStats, default: {} })
  stats: FreelancerStats;

  @Prop({ type: Visibility, default: {} })
  visibility: Visibility;

  @Prop({ default: 0, min: 0, max: 100 })
  completionPercentage: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const FreelancerProfileSchema = SchemaFactory.createForClass(FreelancerProfile);

// Indexes
FreelancerProfileSchema.index({ userId: 1 }, { unique: true });
FreelancerProfileSchema.index({ 'skills.primary': 1, 'professional.availability': 1 });
FreelancerProfileSchema.index({ 'skills.categories': 1 });
FreelancerProfileSchema.index({ 'stats.averageRating': -1, 'stats.totalReviews': -1 });
FreelancerProfileSchema.index({ 'visibility.searchable': 1, 'professional.availability': 1 });
FreelancerProfileSchema.index({ isActive: 1, 'professional.availability': 1 });

// Pre-save middleware to calculate completion percentage
FreelancerProfileSchema.pre('save', function(next) {
  const requiredFields = [
    'professional.title',
    'professional.description',
    'skills.primary',
    'skills.categories',
    'languages'
  ];
  
  const optionalFields = [
    'portfolio',
    'pricing',
    'education',
    'certifications'
  ];
  
  let completedRequired = 0;
  let completedOptional = 0;
  
  // Check required fields
  requiredFields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completedRequired++;
    }
  });
  
  // Check optional fields
  optionalFields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completedOptional++;
    }
  });
  
  // Calculate percentage (70% for required, 30% for optional)
  const requiredPercentage = (completedRequired / requiredFields.length) * 70;
  const optionalPercentage = (completedOptional / optionalFields.length) * 30;
  
  this.completionPercentage = Math.round(requiredPercentage + optionalPercentage);
  
  next();
});
