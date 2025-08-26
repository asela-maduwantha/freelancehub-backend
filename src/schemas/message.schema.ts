import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;
export type ConversationDocument = Conversation & Document;

// Message attachment schema
@Schema({ _id: false })
export class MessageAttachment {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  fileType: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop()
  thumbnailUrl?: string;
}

// Main Message schema
@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: Types.ObjectId;

  @Prop({ required: true, maxlength: 5000 })
  content: string;

  @Prop({ enum: ['text', 'file', 'image', 'system'], default: 'text' })
  type: string;

  @Prop({ type: [MessageAttachment] })
  attachments: MessageAttachment[];

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;

  @Prop({ default: false })
  isEdited: boolean;

  @Prop()
  editedAt?: Date;

  @Prop()
  originalContent?: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  replyToId?: Types.ObjectId;

  // System message data
  @Prop({ type: Object })
  systemData?: Record<string, any>;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Conversation participant schema
@Schema({ _id: false })
export class ConversationParticipant {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: Date.now })
  joinedAt: Date;

  @Prop()
  leftAt?: Date;

  @Prop({ default: false })
  isMuted: boolean;

  @Prop()
  mutedUntil?: Date;

  @Prop()
  lastReadAt?: Date;

  @Prop({ default: 0 })
  unreadCount: number;
}

// Conversation metadata schema
@Schema({ _id: false })
export class ConversationMetadata {
  @Prop()
  projectId?: Types.ObjectId;

  @Prop()
  contractId?: Types.ObjectId;

  @Prop()
  proposalId?: Types.ObjectId;

  @Prop({ enum: ['general', 'project_discussion', 'contract_negotiation', 'support'], default: 'general' })
  type: string;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop()
  archivedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  archivedBy?: Types.ObjectId;
}

// Main Conversation schema
@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [ConversationParticipant], required: true })
  participants: ConversationParticipant[];

  @Prop({ maxlength: 100 })
  title?: string;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessageId?: Types.ObjectId;

  @Prop()
  lastMessageAt?: Date;

  @Prop({ default: 0 })
  messageCount: number;

  @Prop({ type: ConversationMetadata, default: {} })
  metadata: ConversationMetadata;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  blockedBy?: Types.ObjectId;

  @Prop()
  blockedAt?: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Indexes for Message
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ receiverId: 1, isRead: 1 });
MessageSchema.index({ type: 1, createdAt: -1 });

// Indexes for Conversation
ConversationSchema.index({ 'participants.userId': 1, 'metadata.isArchived': 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ 'metadata.projectId': 1 }, { sparse: true });
ConversationSchema.index({ 'metadata.contractId': 1 }, { sparse: true });
ConversationSchema.index({ 'metadata.type': 1, lastMessageAt: -1 });

// Virtual for active participants
ConversationSchema.virtual('activeParticipants').get(function() {
  return this.participants.filter(p => !p.leftAt);
});

// Pre-save middleware to update conversation stats
MessageSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Conversation = this.db.model('Conversation');
      const now = new Date();
      await Conversation.findByIdAndUpdate(
        this.conversationId,
        {
          lastMessageId: this._id,
          lastMessageAt: now,
          $inc: { messageCount: 1 }
        }
      );

      // Update unread count for receiver
      await Conversation.findOneAndUpdate(
        {
          _id: this.conversationId,
          'participants.userId': this.receiverId
        },
        {
          $inc: { 'participants.$.unreadCount': 1 }
        }
      );
    } catch (error) {
      console.error('Error updating conversation stats:', error);
    }
  }
  next();
});

// Pre-save middleware to mark as read
MessageSchema.pre('save', async function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
    
    try {
      const Conversation = this.db.model('Conversation');
      await Conversation.findOneAndUpdate(
        {
          _id: this.conversationId,
          'participants.userId': this.receiverId
        },
        {
          $set: { 'participants.$.lastReadAt': this.readAt },
          $inc: { 'participants.$.unreadCount': -1 }
        }
      );
    } catch (error) {
      console.error('Error updating read status:', error);
    }
  }
  next();
});
