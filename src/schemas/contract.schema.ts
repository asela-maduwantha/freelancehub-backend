import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ContractDocument = Contract & Document;

// Embedded schemas
@Schema({ _id: false })
export class ContractTerms {
  @Prop({ required: true, min: 1 })
  totalAmount: number;

  @Prop({ enum: ['USD', 'LKR'], default: 'USD' })
  currency: string;

  @Prop({ enum: ['fixed', 'hourly'], required: true })
  paymentType: string;

  @Prop()
  hourlyRate?: number;

  @Prop()
  estimatedHours?: number;

  @Prop({ required: true, maxlength: 2000 })
  scope: string;

  @Prop({ type: [String] })
  deliverables: string[];

  @Prop()
  deadline?: Date;

  @Prop({ min: 0, max: 10, default: 2 })
  revisions: number;

  @Prop({ maxlength: 1000 })
  additionalTerms?: string;
}

@Schema({ _id: false })
export class Milestone {
  @Prop({ required: true, maxlength: 100 })
  title: string;

  @Prop({ required: true, maxlength: 1000 })
  description: string;

  @Prop({ required: true, min: 1 })
  amount: number;

  @Prop()
  dueDate?: Date;

  @Prop({ type: [String], required: true })
  deliverables: string[];

  @Prop({ 
    enum: ['pending', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected', 'paid'], 
    default: 'pending' 
  })
  status: string;

  @Prop({
    type: [{
      files: [String],
      notes: { type: String, maxlength: 1000 },
      submittedAt: { type: Date, default: Date.now }
    }]
  })
  submissions: {
    files: string[];
    notes: string;
    submittedAt: Date;
  }[];

  @Prop({ maxlength: 1000 })
  feedback?: string;

  @Prop()
  approvedAt?: Date;

  @Prop()
  rejectedAt?: Date;

  @Prop({ maxlength: 500 })
  rejectionReason?: string;

  @Prop()
  paidAt?: Date;

  @Prop()
  paymentId?: string;
}

@Schema({ _id: false })
export class Escrow {
  @Prop()
  stripePaymentIntentId?: string;

  @Prop({ default: 0 })
  totalEscrowed: number;

  @Prop({ default: 0 })
  availableForRelease: number;

  @Prop({ default: 0 })
  released: number;

  @Prop({ default: 0 })
  refunded: number;

  @Prop({ default: 0.1 }) // 10% platform fee
  platformFeeRate: number;

  @Prop({ default: 0.029 }) // 2.9% Stripe fee
  stripeFeeRate: number;

  @Prop({ default: 0.30 }) // $0.30 Stripe fixed fee
  stripeFixedFee: number;
}

@Schema({ _id: false })
export class ContractModification {
  @Prop({ enum: ['scope_change', 'timeline_extension', 'budget_increase', 'milestone_addition'], required: true })
  type: string;

  @Prop({ required: true, maxlength: 1000 })
  description: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  previousValue?: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  newValue?: any;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requestedBy: Types.ObjectId;

  @Prop({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: string;

  @Prop()
  approvedAt?: Date;

  @Prop()
  rejectedAt?: Date;

  @Prop({ maxlength: 500 })
  rejectionReason?: string;

  @Prop({ default: Date.now })
  requestedAt: Date;
}

@Schema({ _id: false })
export class PerformanceMetrics {
  @Prop({ default: 0 })
  totalHoursWorked: number;

  @Prop({ default: 0 })
  milestonesCompleted: number;

  @Prop({ default: 0 })
  averageResponseTime: number; // in hours

  @Prop({ default: 0 })
  onTimeDeliveryRate: number; // percentage

  @Prop({ default: 0 })
  qualityScore: number; // 1-5 rating

  @Prop()
  lastActivityAt?: Date;

  @Prop({
    type: [{
      date: { type: Date, default: Date.now },
      hoursWorked: { type: Number, default: 0 },
      description: String,
      screenshots: [String]
    }]
  })
  timeEntries: {
    date: Date;
    hoursWorked: number;
    description?: string;
    screenshots?: string[];
  }[];
}

// Main Contract schema
@Schema({ timestamps: true })
export class Contract {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, unique: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  freelancerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Proposal', required: true })
  proposalId: Types.ObjectId;

  @Prop({ type: ContractTerms, required: true })
  terms: ContractTerms;

  @Prop({ 
    type: [Milestone], 
    required: true, 
    validate: [(val: Milestone[]) => val.length > 0, 'At least one milestone required'] 
  })
  milestones: Milestone[];

  @Prop({ default: 0 })
  currentMilestone: number;

  @Prop({ type: Escrow, default: {} })
  escrow: Escrow;

  @Prop({ enum: ['draft', 'active', 'completed', 'cancelled', 'disputed', 'paused'], default: 'draft' })
  status: string;

  @Prop({ default: Date.now })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  cancelledAt?: Date;

  @Prop({ maxlength: 500 })
  cancellationReason?: string;

  @Prop({ type: [ContractModification] })
  modifications: ContractModification[];

  @Prop({ type: PerformanceMetrics, default: {} })
  performanceMetrics: PerformanceMetrics;

  // Dispute information
  @Prop()
  disputeId?: string;

  @Prop()
  disputedAt?: Date;

  @Prop({ maxlength: 1000 })
  disputeReason?: string;

  // Client and freelancer signatures
  @Prop()
  clientSignedAt?: Date;

  @Prop()
  freelancerSignedAt?: Date;

  @Prop({ type: String })
  clientSignature?: string;

  @Prop({ type: String })
  freelancerSignature?: string;

  // Review information
  @Prop()
  clientReviewId?: Types.ObjectId;

  @Prop()
  freelancerReviewId?: Types.ObjectId;
}

export const ContractSchema = SchemaFactory.createForClass(Contract);


ContractSchema.index({ status: 1, createdAt: -1 });
ContractSchema.index({ startDate: -1 });

// Virtual for contract duration
ContractSchema.virtual('duration').get(function() {
  const start = this.startDate;
  const end = this.endDate || new Date();
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for completion percentage
ContractSchema.virtual('completionPercentage').get(function() {
  if (this.milestones.length === 0) return 0;
  const completedMilestones = this.milestones.filter(m => m.status === 'approved' || m.status === 'paid');
  return Math.round((completedMilestones.length / this.milestones.length) * 100);
});

// Pre-save middleware to update current milestone
ContractSchema.pre('save', function(next) {
  if (this.isModified('milestones')) {
    const inProgressIndex = this.milestones.findIndex(m => m.status === 'in_progress');
    if (inProgressIndex !== -1) {
      this.currentMilestone = inProgressIndex;
    } else {
      const pendingIndex = this.milestones.findIndex(m => m.status === 'pending');
      this.currentMilestone = pendingIndex !== -1 ? pendingIndex : 0;
    }
  }
  next();
});

// Pre-save middleware to set completion date
ContractSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});
