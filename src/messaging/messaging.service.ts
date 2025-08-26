import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './schemas/message.schema';
import { Conversation } from './schemas/conversation.schema';
import { CreateMessageDto, UpdateMessageDto, CreateConversationDto, MessageQueryDto } from './dto/messaging.dto';
import { User } from '../schemas/user.schema';

@Injectable()
export class MessagingService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createMessage(senderId: string, createMessageDto: CreateMessageDto) {
    const { receiverId, content, projectId, type = 'text', attachments, metadata } = createMessageDto;

    // Validate receiver exists
    const receiver = await this.userModel.findById(receiverId);
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    // Find or create conversation
    let conversation = await this.findOrCreateConversation([senderId, receiverId], projectId);

    // Create the message
    const message = new this.messageModel({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverId),
      projectId: projectId ? new Types.ObjectId(projectId) : undefined,
      content,
      type,
      attachments,
      metadata,
    });

    const savedMessage = await message.save();

    // Update conversation
    await this.updateConversation(conversation._id as string, savedMessage._id as string, receiverId);

    return this.populateMessage(savedMessage);
  }

  async getMessages(userId: string, query: MessageQueryDto) {
    const { page = 1, limit = 20, conversationId, projectId, unreadOnly } = query;
    const skip = (page - 1) * limit;

    let filter: any = {
      $or: [
        { senderId: new Types.ObjectId(userId) },
        { receiverId: new Types.ObjectId(userId) }
      ],
      isDeleted: false
    };

    if (conversationId) {
      const conversation = await this.conversationModel.findById(conversationId);
      if (!conversation || !conversation.participants.includes(new Types.ObjectId(userId))) {
        throw new ForbiddenException('Access denied to this conversation');
      }
      
      filter = {
        $or: [
          { 
            senderId: { $in: conversation.participants },
            receiverId: { $in: conversation.participants }
          }
        ],
        isDeleted: false
      };
    }

    if (projectId) {
      filter.projectId = new Types.ObjectId(projectId);
    }

    if (unreadOnly) {
      filter.isRead = false;
      filter.receiverId = new Types.ObjectId(userId);
    }

    const messages = await this.messageModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('receiverId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('projectId', 'title status')
      .exec();

    const total = await this.messageModel.countDocuments(filter);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getConversations(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const conversations = await this.conversationModel
      .find({
        participants: new Types.ObjectId(userId),
        isArchived: false
      })
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'username profile.firstName profile.lastName profile.avatar')
      .populate('lastMessage')
      .populate('projectId', 'title status')
      .exec();

    const total = await this.conversationModel.countDocuments({
      participants: new Types.ObjectId(userId),
      isArchived: false
    });

    return {
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async markAsRead(userId: string, messageId: string) {
    const message = await this.messageModel.findById(messageId);
    
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.receiverId.toString() !== userId) {
      throw new ForbiddenException('You can only mark your own received messages as read');
    }

    message.isRead = true;
    await message.save();

    // Update unread count in conversation
    await this.updateUnreadCount(message.senderId.toString(), userId, -1);

    return message;
  }

  async markConversationAsRead(userId: string, conversationId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    
    if (!conversation || !conversation.participants.includes(new Types.ObjectId(userId))) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    // Mark all unread messages in this conversation as read
    await this.messageModel.updateMany(
      {
        receiverId: new Types.ObjectId(userId),
        $or: [
          { 
            senderId: { $in: conversation.participants },
            receiverId: { $in: conversation.participants }
          }
        ],
        isRead: false
      },
      { isRead: true }
    );

    // Reset unread count for this user
    conversation.unreadCounts[userId] = 0;
    await conversation.save();

    return { message: 'Conversation marked as read' };
  }

  async updateMessage(userId: string, messageId: string, updateMessageDto: UpdateMessageDto) {
    const message = await this.messageModel.findById(messageId);
    
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Check if message is not too old (24 hours)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if ((message as any).createdAt < dayAgo) {
      throw new BadRequestException('Cannot edit messages older than 24 hours');
    }

    message.originalContent = message.content;
    message.content = updateMessageDto.content;
    message.editedAt = new Date();

    await message.save();
    return this.populateMessage(message);
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.messageModel.findById(messageId);
    
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    message.isDeleted = true;
    message.content = 'This message has been deleted';
    await message.save();

    return { message: 'Message deleted successfully' };
  }

  async createConversation(userId: string, createConversationDto: CreateConversationDto) {
    const { participants, projectId, title, type = 'project' } = createConversationDto;

    // Ensure current user is in participants
    if (!participants.includes(userId)) {
      participants.push(userId);
    }

    // Validate all participants exist
    const users = await this.userModel.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      throw new BadRequestException('One or more participants not found');
    }

    // Check if conversation already exists
    const existingConversation = await this.conversationModel.findOne({
      participants: { 
        $all: participants.map(id => new Types.ObjectId(id)),
        $size: participants.length
      },
      projectId: projectId ? new Types.ObjectId(projectId) : { $exists: false }
    });

    if (existingConversation) {
      return this.populateConversation(existingConversation);
    }

    const conversation = new this.conversationModel({
      participants: participants.map(id => new Types.ObjectId(id)),
      projectId: projectId ? new Types.ObjectId(projectId) : undefined,
      title,
      type,
      unreadCounts: participants.reduce((acc, id) => ({ ...acc, [id]: 0 }), {})
    });

    const savedConversation = await conversation.save();
    return this.populateConversation(savedConversation);
  }

  async archiveConversation(userId: string, conversationId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    
    if (!conversation || !conversation.participants.includes(new Types.ObjectId(userId))) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    conversation.isArchived = true;
    await conversation.save();

    return { message: 'Conversation archived successfully' };
  }

  async getUnreadCount(userId: string) {
    const unreadMessages = await this.messageModel.countDocuments({
      receiverId: new Types.ObjectId(userId),
      isRead: false,
      isDeleted: false
    });

    const unreadConversations = await this.conversationModel.countDocuments({
      participants: new Types.ObjectId(userId),
      [`unreadCounts.${userId}`]: { $gt: 0 },
      isArchived: false
    });

    return {
      unreadMessages,
      unreadConversations
    };
  }

  async searchMessages(userId: string, searchTerm: string, limit: number = 20) {
    const messages = await this.messageModel
      .find({
        $or: [
          { senderId: new Types.ObjectId(userId) },
          { receiverId: new Types.ObjectId(userId) }
        ],
        content: { $regex: searchTerm, $options: 'i' },
        isDeleted: false
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('receiverId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('projectId', 'title')
      .exec();

    return messages;
  }

  // Private helper methods
  private async findOrCreateConversation(participants: string[], projectId?: string) {
    const participantIds = participants.map(id => new Types.ObjectId(id));
    
    let conversation = await this.conversationModel.findOne({
      participants: { 
        $all: participantIds,
        $size: participants.length
      },
      projectId: projectId ? new Types.ObjectId(projectId) : { $exists: false }
    });

    if (!conversation) {
      conversation = new this.conversationModel({
        participants: participantIds,
        projectId: projectId ? new Types.ObjectId(projectId) : undefined,
        type: projectId ? 'project' : 'general',
        unreadCounts: participants.reduce((acc, id) => ({ ...acc, [id]: 0 }), {})
      });
      await conversation.save();
    }

    return conversation;
  }

  private async updateConversation(conversationId: string, lastMessageId: string, receiverId: string) {
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: new Types.ObjectId(lastMessageId),
      lastActivity: new Date(),
      $inc: { [`unreadCounts.${receiverId}`]: 1 }
    });
  }

  private async updateUnreadCount(senderId: string, receiverId: string, increment: number) {
    const conversation = await this.conversationModel.findOne({
      participants: { 
        $all: [new Types.ObjectId(senderId), new Types.ObjectId(receiverId)]
      }
    });

    if (conversation) {
      conversation.unreadCounts[receiverId] = Math.max(0, 
        (conversation.unreadCounts[receiverId] || 0) + increment
      );
      await conversation.save();
    }
  }

  private populateMessage(message: any) {
    return this.messageModel
      .findById(message._id)
      .populate('senderId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('receiverId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('projectId', 'title status')
      .exec();
  }

  private populateConversation(conversation: any) {
    return this.conversationModel
      .findById(conversation._id)
      .populate('participants', 'username profile.firstName profile.lastName profile.avatar')
      .populate('lastMessage')
      .populate('projectId', 'title status')
      .exec();
  }
}
