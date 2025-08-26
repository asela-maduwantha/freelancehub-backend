import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

// Embedded schemas
@Schema({ _id: false })
export class Budget {
  @Prop({ required: true, min: 1 })
  amount: number;

  @Prop()
  maxAmount?: number;

  @Prop({ enum: ['USD', 'LKR'], default: 'USD' })
  currency: string;

  @Prop({ enum: ['fixed', 'hourly'], required: true })
  type: string;
}

@Schema({ _id: false })
export class Timeline {
  @Prop({ min: 1, max: 365 })
  duration?: number; // in days

  @Prop()
  deadline?: Date;

  @Prop({ default: false })
  isUrgent: boolean;

  @Prop({ default: false })
  isFlexible: boolean;
}

@Schema({ _id: false })
export class ProjectProposals {
  @Prop({ default: 0 })
  count: number;

  @Prop({ default: 0 })
  averageBid: number;

  @Prop({ default: 0 })
  lowestBid: number;

  @Prop({ default: 0 })
  highestBid: number;

  @Prop()
  lastProposalAt?: Date;
}

@Schema({ _id: false })
export class ProjectRequirements {
  @Prop({ type: [String] })
  mustHaveSkills: string[];

  @Prop({ type: [String] })
  niceToHaveSkills: string[];

  @Prop({ enum: ['entry', 'intermediate', 'expert'] })
  experienceLevel?: string;

  @Prop()
  minimumRating?: number;

  @Prop()
  minimumCompletedProjects?: number;

  @Prop({ type: [String] })
  preferredLanguages?: string[];

  @Prop({ type: [String] })
  preferredCountries?: string[];
}

// Main Project schema
@Schema({ timestamps: true })
export class Project {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop({ required: true, maxlength: 150 })
  title: string;

  @Prop({ required: true, minlength: 100, maxlength: 5000 })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  subcategory?: string;

  @Prop({ type: [String], required: true, validate: [(val: string[]) => val.length > 0, 'At least one skill required'] })
  requiredSkills: string[];

  @Prop({ enum: ['fixed', 'hourly'], required: true })
  type: string;

  @Prop({ type: Budget, required: true })
  budget: Budget;

  @Prop({ type: Timeline })
  timeline?: Timeline;

  @Prop({ type: ProjectRequirements })
  requirements?: ProjectRequirements;

  @Prop({ type: [String], validate: [(val: string[]) => val.length <= 10, 'Maximum 10 attachments'] })
  attachments: string[];

  @Prop({ enum: ['public', 'private', 'invited'], default: 'public' })
  visibility: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  invitedFreelancers: Types.ObjectId[];

  @Prop({ type: ProjectProposals, default: {} })
  proposals: ProjectProposals;

  @Prop({ enum: ['draft', 'open', 'in_progress', 'completed', 'cancelled', 'disputed'], default: 'draft' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  selectedFreelancer?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contract' })
  contract?: Types.ObjectId;

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: [String] })
  tags: string[];

  @Prop()
  featuredUntil?: Date;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: false })
  isUrgent: boolean;

  @Prop()
  publishedAt?: Date;

  @Prop()
  closedAt?: Date;

  // For full-text search
  @Prop({ index: 'text' })
  searchText: string;

  // Analytics
  @Prop({ type: [Types.ObjectId] })
  viewedBy: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId] })
  savedBy: Types.ObjectId[];

  @Prop({ default: 0 })
  proposalsCount: number;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Indexes for optimal search performance
ProjectSchema.index({ title: 'text', description: 'text', tags: 'text' });
ProjectSchema.index({ status: 1, visibility: 1, createdAt: -1 });
ProjectSchema.index({ category: 1, status: 1 });
ProjectSchema.index({ requiredSkills: 1, status: 1 });
ProjectSchema.index({ clientId: 1, status: 1 });
ProjectSchema.index({ 'budget.amount': 1, status: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ publishedAt: -1, status: 1 });
ProjectSchema.index({ isFeatured: 1, publishedAt: -1 });
ProjectSchema.index({ isUrgent: 1, publishedAt: -1 });

// Pre-save middleware to generate search text
ProjectSchema.pre('save', function(next) {
  this.searchText = `${this.title} ${this.description} ${this.tags?.join(' ') || ''}`;
  next();
});

// Pre-save middleware to set publishedAt when status changes to 'open'
ProjectSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'open' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Virtual for age in days
ProjectSchema.virtual('ageInDays').get(function() {
  if (!this.publishedAt) return 0;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.publishedAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});
