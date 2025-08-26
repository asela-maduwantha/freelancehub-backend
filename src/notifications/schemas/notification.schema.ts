import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ 
    type: String, 
    enum: [
      'project_created',
      'proposal_received',
      'proposal_accepted',
      'proposal_rejected',
      'contract_signed',
      'payment_received',
      'payment_released',
      'message_received',
      'milestone_completed',
      'project_completed',
      'review_received',
      'dispute_opened',
      'system_update',
      'security_alert'
    ], 
    required: true 
  })
  type: string;

  @Prop({ 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  })
  priority: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Object, required: false })
  data?: {
    projectId?: string;
    proposalId?: string;
    contractId?: string;
    paymentId?: string;
    messageId?: string;
    reviewId?: string;
    disputeId?: string;
    userId?: string;
    amount?: number;
    currency?: string;
    [key: string]: any;
  };

  @Prop({ type: String, required: false })
  actionUrl?: string;

  @Prop({ type: String, required: false })
  actionText?: string;

  @Prop({ type: Date, required: false })
  readAt?: Date;

  @Prop({ type: Date, required: false })
  expiresAt?: Date;

  @Prop({ 
    type: [String], 
    enum: ['email', 'push', 'sms', 'in_app'], 
    default: ['in_app'] 
  })
  channels: string[];

  @Prop({ type: Object, default: {} })
  deliveryStatus: {
    email?: { sent: boolean; sentAt?: Date; error?: string };
    push?: { sent: boolean; sentAt?: Date; error?: string };
    sms?: { sent: boolean; sentAt?: Date; error?: string };
    in_app?: { sent: boolean; sentAt?: Date; error?: string };
  };

  @Prop({ type: String, required: false })
  category?: string;

  @Prop({ type: Object, required: false })
  metadata?: {
    templateId?: string;
    variables?: { [key: string]: any };
    source?: string;
    batchId?: string;
  };
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Create indexes for efficient querying
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ isRead: 1, userId: 1 });
NotificationSchema.index({ type: 1, userId: 1 });
NotificationSchema.index({ priority: 1, isRead: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
