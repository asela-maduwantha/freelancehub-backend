import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProposalDocument = Proposal & Document;

// Embedded schemas
@Schema({ _id: false })
export class ProposalPricing {
  @Prop({ required: true, min: 1 })
  amount: number;

  @Prop({ enum: ['USD', 'LKR'], default: 'USD' })
  currency: string;

  @Prop({ enum: ['fixed', 'hourly'], required: true })
  type: string;

  @Prop({ min: 1, max: 168 }) // 1 hour to 24 weeks
  estimatedHours?: number;

  @Prop()
  breakdown?: string;
}

@Schema({ _id: false })
export class ProposalTimeline {
  @Prop({ required: true, min: 1, max: 365 })
  deliveryTime: number; // in days

  @Prop()
  startDate?: Date;

  @Prop()
  milestones?: {
    title: string;
    description: string;
    deliveryDate: Date;
    amount: number;
  }[];
}

@Schema({ _id: false })
export class ProposalAttachment {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  fileType: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop()
  description?: string;
}

// Main Proposal schema
@Schema({ timestamps: true })
export class Proposal {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  freelancerId: Types.ObjectId;

  @Prop({ required: true, minlength: 50, maxlength: 2000 })
  coverLetter: string;

  @Prop({ type: ProposalPricing, required: true })
  pricing: ProposalPricing;

  @Prop({ type: ProposalTimeline, required: true })
  timeline: ProposalTimeline;

  @Prop({ type: [ProposalAttachment] })
  attachments: ProposalAttachment[];

  @Prop({ enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending' })
  status: string;

  @Prop()
  clientMessage?: string;

  @Prop()
  rejectionReason?: string;

  @Prop()
  acceptedAt?: Date;

  @Prop()
  rejectedAt?: Date;

  @Prop()
  withdrawnAt?: Date;

  @Prop({ default: false })
  isInvited: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop()
  featuredUntil?: Date;

  @Prop({ default: 0 })
  clientViews: number;

  @Prop()
  lastViewedByClient?: Date;

  // Proposal analytics
  @Prop({
    type: {
      submittedAt: { type: Date, default: Date.now },
      responseTime: Number, // Time taken to submit after project was posted
      competitiveness: Number, // How competitive the bid is (calculated)
      clientEngagement: {
        views: { type: Number, default: 0 },
        messages: { type: Number, default: 0 },
        lastInteraction: Date
      }
    },
    default: {}
  })
  analytics: {
    submittedAt: Date;
    responseTime?: number;
    competitiveness?: number;
    clientEngagement: {
      views: number;
      messages: number;
      lastInteraction?: Date;
    };
  };

  // Questions and answers
  @Prop({
    type: [{
      question: { type: String, required: true },
      answer: { type: String, required: true },
      askedAt: { type: Date, default: Date.now }
    }]
  })
  questionsAndAnswers: {
    question: string;
    answer: string;
    askedAt: Date;
  }[];

  // Client requirements match
  @Prop({
    type: {
      skillsMatch: { type: Number, min: 0, max: 100 },
      experienceMatch: { type: Number, min: 0, max: 100 },
      budgetMatch: { type: Number, min: 0, max: 100 },
      timelineMatch: { type: Number, min: 0, max: 100 },
      overallMatch: { type: Number, min: 0, max: 100 }
    }
  })
  matchScore?: {
    skillsMatch: number;
    experienceMatch: number;
    budgetMatch: number;
    timelineMatch: number;
    overallMatch: number;
  };
}

export const ProposalSchema = SchemaFactory.createForClass(Proposal);

// Indexes
ProposalSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true });
ProposalSchema.index({ projectId: 1, status: 1, createdAt: -1 });
ProposalSchema.index({ freelancerId: 1, status: 1, createdAt: -1 });
ProposalSchema.index({ status: 1, createdAt: -1 });
ProposalSchema.index({ isFeatured: 1, featuredUntil: 1 });

// Pre-save middleware to calculate response time
ProposalSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Project = this.db.model('Project');
      const project = await Project.findById(this.projectId);
      
      if (project && project.publishedAt) {
        const responseTime = Date.now() - project.publishedAt.getTime();
        this.analytics.responseTime = Math.round(responseTime / (1000 * 60 * 60)); // in hours
      }
    } catch (error) {
      console.error('Error calculating response time:', error);
    }
  }
  next();
});

// Pre-save middleware to calculate competitiveness
ProposalSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('pricing.amount')) {
    try {
      const Proposal = this.constructor as any;
      const proposals = await Proposal.find({ 
        projectId: this.projectId, 
        status: 'pending' 
      }).select('pricing.amount');
      
      if (proposals.length > 0) {
        const amounts = proposals.map(p => p.pricing.amount);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const minAmount = Math.min(...amounts);
        
        // Calculate competitiveness (lower bid = more competitive)
        let competitiveness = 50; // baseline
        if (this.pricing.amount <= minAmount) {
          competitiveness = 100;
        } else if (this.pricing.amount <= avgAmount) {
          competitiveness = 75;
        } else if (this.pricing.amount <= avgAmount * 1.5) {
          competitiveness = 25;
        } else {
          competitiveness = 10;
        }
        
        this.analytics.competitiveness = competitiveness;
      }
    } catch (error) {
      console.error('Error calculating competitiveness:', error);
    }
  }
  next();
});
