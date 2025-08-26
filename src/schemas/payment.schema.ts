import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

// Main Payment schema
@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Contract', required: true })
  contractId: Types.ObjectId;

  @Prop()
  milestoneIndex?: number;

  @Prop({ required: true })
  stripePaymentIntentId: string;

  @Prop()
  stripeChargeId?: string;

  @Prop()
  stripeTransferId?: string;

  @Prop({ required: true, min: 0.01 })
  amount: number;

  @Prop({ enum: ['USD', 'LKR'], default: 'USD' })
  currency: string;

  @Prop({ enum: ['escrow_funding', 'milestone_release', 'refund', 'platform_fee', 'dispute_settlement'], required: true })
  type: string;

  @Prop({ enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'], default: 'pending' })
  status: string;

  @Prop({ required: true, min: 0 })
  platformFee: number;

  @Prop({ required: true, min: 0 })
  stripeFee: number;

  @Prop({ required: true, min: 0 })
  freelancerAmount: number;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  processedAt?: Date;

  @Prop()
  failedAt?: Date;

  @Prop()
  refundedAt?: Date;

  @Prop({ maxlength: 500 })
  failureReason?: string;

  @Prop({ maxlength: 500 })
  refundReason?: string;

  // Idempotency key for Stripe operations
  @Prop({ unique: true, sparse: true })
  idempotencyKey?: string;

  // Additional tracking
  @Prop({ type: Types.ObjectId, ref: 'User' })
  initiatedBy?: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop()
  receiptUrl?: string;

  @Prop({ default: false })
  isDisputed: boolean;

  @Prop()
  disputeId?: string;

  // Tax information
  @Prop({ default: 0 })
  taxAmount: number;

  @Prop()
  taxRate?: number;

  @Prop()
  taxDescription?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ contractId: 1, type: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 }, { unique: true });
PaymentSchema.index({ stripeChargeId: 1 }, { sparse: true });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ type: 1, status: 1 });
PaymentSchema.index({ processedAt: -1 });
PaymentSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
