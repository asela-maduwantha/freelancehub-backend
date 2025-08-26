import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reviewerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  revieweeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contract', required: false })
  contractId?: Types.ObjectId;

  @Prop({ type: Number, min: 1, max: 5, required: true })
  rating: number;

  @Prop({ required: true, minlength: 10, maxlength: 2000 })
  comment: string;

  @Prop({ 
    type: String, 
    enum: ['client_to_freelancer', 'freelancer_to_client'], 
    required: true 
  })
  reviewType: string;

  @Prop({ type: Object, required: false })
  criteria?: {
    communication?: number; // 1-5
    quality?: number; // 1-5
    timeliness?: number; // 1-5
    professionalism?: number; // 1-5
    valueForMoney?: number; // 1-5
    wouldRecommend?: boolean;
  };

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ type: Object, required: false })
  response?: {
    comment: string;
    createdAt: Date;
    updatedAt?: Date;
  };

  @Prop({ type: Number, default: 0 })
  helpfulVotes: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  helpfulVoters: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  reportCount: number;

  @Prop({ type: [Object], default: [] })
  reports: Array<{
    userId: Types.ObjectId;
    reason: string;
    comment?: string;
    createdAt: Date;
  }>;

  @Prop({ 
    type: String, 
    enum: ['active', 'hidden', 'under_review', 'removed'], 
    default: 'active' 
  })
  status: string;

  @Prop({ type: Date, required: false })
  editedAt?: Date;

  @Prop({ type: String, required: false })
  originalComment?: string;

  @Prop({ type: Object, required: false })
  metadata?: {
    projectTitle?: string;
    projectCategory?: string;
    projectBudget?: number;
    contractDuration?: number;
    completionDate?: Date;
  };
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Create indexes for efficient querying
ReviewSchema.index({ revieweeId: 1, createdAt: -1 });
ReviewSchema.index({ reviewerId: 1, createdAt: -1 });
ReviewSchema.index({ projectId: 1 });
ReviewSchema.index({ rating: 1, isPublic: 1 });
ReviewSchema.index({ reviewType: 1, revieweeId: 1 });
ReviewSchema.index({ status: 1, isPublic: 1 });
