import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

// Review criteria schema
@Schema({ _id: false })
export class ReviewCriteria {
  @Prop({ required: true, min: 1, max: 5 })
  communication: number;

  @Prop({ required: true, min: 1, max: 5 })
  quality: number;

  @Prop({ required: true, min: 1, max: 5 })
  timeliness: number;

  @Prop({ required: true, min: 1, max: 5 })
  professionalism: number;

  @Prop({ min: 1, max: 5 })
  expertise?: number;

  @Prop({ min: 1, max: 5 })
  value?: number;
}

// Main Review schema
@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Contract', required: true })
  contractId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reviewerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  revieweeId: Types.ObjectId;

  @Prop({ enum: ['client_to_freelancer', 'freelancer_to_client'], required: true })
  type: string;

  @Prop({ required: true, min: 1, max: 5 })
  overallRating: number;

  @Prop({ type: ReviewCriteria, required: true })
  criteria: ReviewCriteria;

  @Prop({ required: true, minlength: 10, maxlength: 2000 })
  comment: string;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ default: false })
  wouldRecommend: boolean;

  @Prop({ default: false })
  wouldWorkAgain: boolean;

  @Prop({ default: true })
  isPublic: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop()
  featuredUntil?: Date;

  // Response from reviewee
  @Prop({ maxlength: 1000 })
  response?: string;

  @Prop()
  respondedAt?: Date;

  // Moderation
  @Prop({ default: false })
  isFlagged: boolean;

  @Prop()
  flaggedAt?: Date;

  @Prop({ maxlength: 500 })
  flagReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  flaggedBy?: Types.ObjectId;

  @Prop({ default: false })
  isModerated: boolean;

  @Prop()
  moderatedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  moderatedBy?: Types.ObjectId;

  @Prop({ enum: ['approved', 'rejected', 'hidden'], default: 'approved' })
  moderationStatus: string;

  @Prop({ maxlength: 500 })
  moderationReason?: string;

  // Helpfulness voting
  @Prop({ default: 0 })
  helpfulVotes: number;

  @Prop({ default: 0 })
  notHelpfulVotes: number;

  @Prop({ type: [Types.ObjectId] })
  votedBy: Types.ObjectId[];

  // Project information for context
  @Prop()
  projectTitle?: string;

  @Prop()
  projectCategory?: string;

  @Prop()
  contractValue?: number;

  @Prop()
  contractDuration?: number; // in days
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Indexes
ReviewSchema.index({ contractId: 1, type: 1 }, { unique: true });
ReviewSchema.index({ reviewerId: 1, createdAt: -1 });
ReviewSchema.index({ revieweeId: 1, moderationStatus: 1, isPublic: 1, createdAt: -1 });
ReviewSchema.index({ overallRating: -1, createdAt: -1 });
ReviewSchema.index({ isFeatured: 1, featuredUntil: 1 });
ReviewSchema.index({ tags: 1 });
ReviewSchema.index({ helpfulVotes: -1 });

// Virtual for average criteria rating
ReviewSchema.virtual('averageCriteriaRating').get(function() {
  const criteria = this.criteria;
  const ratings = [
    criteria.communication,
    criteria.quality,
    criteria.timeliness,
    criteria.professionalism
  ];
  
  if (criteria.expertise) ratings.push(criteria.expertise);
  if (criteria.value) ratings.push(criteria.value);
  
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Virtual for helpfulness ratio
ReviewSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpfulVotes + this.notHelpfulVotes;
  return total > 0 ? this.helpfulVotes / total : 0;
});

// Pre-save middleware to set project context
ReviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Contract = this.db.model('Contract');
      const Project = this.db.model('Project');
      
      const contract = await Contract.findById(this.contractId).populate({
        path: 'projectId',
        select: 'title category'
      });
      
      if (contract && contract.projectId) {
        this.projectTitle = contract.projectId.title;
        this.projectCategory = contract.projectId.category;
        this.contractValue = contract.terms.totalAmount;
        
        if (contract.startDate && contract.endDate) {
          const duration = Math.ceil(
            (contract.endDate.getTime() - contract.startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          this.contractDuration = duration;
        }
      }
    } catch (error) {
      console.error('Error setting project context:', error);
    }
  }
  next();
});
