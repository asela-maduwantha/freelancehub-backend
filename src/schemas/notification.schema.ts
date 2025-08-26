import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

// Notification data schema for different types
@Schema({ _id: false })
export class NotificationData {
  @Prop()
  projectId?: Types.ObjectId;

  @Prop()
  contractId?: Types.ObjectId;

  @Prop()
  proposalId?: Types.ObjectId;

  @Prop()
  messageId?: Types.ObjectId;

  @Prop()
  paymentId?: Types.ObjectId;

  @Prop()
  reviewId?: Types.ObjectId;

  @Prop()
  userId?: Types.ObjectId;

  @Prop()
  amount?: number;

  @Prop()
  currency?: string;

  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop()
  url?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

// Main Notification schema
@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, maxlength: 1000 })
  message: string;

  @Prop({
    enum: [
      'project_posted',
      'project_invitation',
      'proposal_received',
      'proposal_accepted',
      'proposal_rejected',
      'contract_created',
      'milestone_submitted',
      'milestone_approved',
      'milestone_rejected',
      'payment_received',
      'payment_failed',
      'message_received',
      'review_received',
      'account_verification',
      'security_alert',
      'system_announcement'
    ],
    required: true
  })
  type: string;

  @Prop({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority: string;

  @Prop({ type: NotificationData })
  data: NotificationData;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;

  @Prop({ default: false })
  isEmailSent: boolean;

  @Prop()
  emailSentAt?: Date;

  @Prop({ default: false })
  isPushSent: boolean;

  @Prop()
  pushSentAt?: Date;

  @Prop({ default: false })
  isSMSSent: boolean;

  @Prop()
  smsSentAt?: Date;

  @Prop()
  actionUrl?: string;

  @Prop({ maxlength: 50 })
  actionText?: string;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop()
  archivedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ priority: 1, isRead: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

// Pre-save middleware to mark as read
NotificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});
