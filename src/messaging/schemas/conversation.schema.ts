import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Project', required: false })
  projectId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Message', required: false })
  lastMessage?: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  lastActivity: Date;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ type: String, required: false })
  title?: string;

  @Prop({ type: Object, default: {} })
  unreadCounts: { [userId: string]: number };

  @Prop({ 
    type: String, 
    enum: ['project', 'support', 'general'], 
    default: 'project' 
  })
  type: string;

  @Prop({ type: Object, required: false })
  metadata?: {
    contractId?: string;
    disputeId?: string;
  };
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Create indexes for efficient querying
ConversationSchema.index({ participants: 1, lastActivity: -1 });
ConversationSchema.index({ projectId: 1 });
ConversationSchema.index({ isArchived: 1 });
