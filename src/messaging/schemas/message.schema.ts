import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: false })
  projectId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ 
    type: String, 
    enum: ['text', 'file', 'image', 'proposal', 'contract'], 
    default: 'text' 
  })
  type: string;

  @Prop({ type: Object, required: false })
  attachments?: {
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }[];

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, required: false })
  editedAt?: Date;

  @Prop({ type: String, required: false })
  originalContent?: string;

  @Prop({ type: Object, required: false })
  metadata?: {
    proposalId?: string;
    contractId?: string;
    milestoneId?: string;
  };
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Create indexes for efficient querying
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ projectId: 1, createdAt: -1 });
MessageSchema.index({ isRead: 1, receiverId: 1 });
