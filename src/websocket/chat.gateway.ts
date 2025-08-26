import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagingService } from '../messaging/messaging.service';
import { NotificationsService } from '../notifications/notifications.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId
  private userSockets = new Map<string, AuthenticatedSocket>(); // userId -> socket

  constructor(
    private jwtService: JwtService,
    private messagingService: MessagingService,
    private notificationsService: NotificationsService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without authentication token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.username = payload.username;

      if (!client.userId) {
        this.logger.warn(`Client ${client.id} has invalid user ID`);
        client.disconnect();
        return;
      }

      // Store user connection
      this.connectedUsers.set(client.userId, client.id);
      this.userSockets.set(client.userId, client);

      // Join user to their personal room
      client.join(`user_${client.userId}`);

      // Notify user is online
      client.broadcast.emit('user_online', {
        userId: client.userId,
        username: client.username,
      });

      this.logger.log(`User ${client.username} (${client.userId}) connected`);

      // Send pending notifications
      await this.sendPendingNotifications(client.userId);

    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.userSockets.delete(client.userId);

      // Notify user is offline
      client.broadcast.emit('user_offline', {
        userId: client.userId,
        username: client.username,
      });

      this.logger.log(`User ${client.username} (${client.userId}) disconnected`);
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: {
      receiverId: string;
      content: string;
      projectId?: string;
      type?: string;
      attachments?: any[];
    },
  ) {
    try {
      if (!client.userId) {
        this.logger.warn(`Unauthenticated client ${client.id} attempted to send message`);
        client.emit('error', { message: 'Authentication required' });
        return;
      }

      // Create message in database
      const message = await this.messagingService.createMessage(client.userId, {
        receiverId: data.receiverId,
        content: data.content,
        projectId: data.projectId,
        type: data.type || 'text',
        attachments: data.attachments,
      });

      if (!message) {
        this.logger.error('Failed to create message');
        client.emit('error', { message: 'Failed to send message' });
        return;
      }

      // Send to receiver if online
      const receiverSocket = this.userSockets.get(data.receiverId);
      if (receiverSocket) {
        receiverSocket.emit('new_message', {
          messageId: message._id,
          senderId: client.userId,
          senderUsername: client.username,
          content: data.content,
          type: data.type || 'text',
          projectId: data.projectId,
          attachments: data.attachments,
          timestamp: new Date(),
        });
      }

      // Send confirmation to sender
      client.emit('message_sent', {
        messageId: message._id,
        timestamp: new Date(),
      });

      // Create notification for receiver if offline
      if (!receiverSocket) {
        await this.notificationsService.createNotification(data.receiverId, {
          title: 'New Message',
          message: `You have a new message from ${client.username || 'Unknown'}`,
          type: 'message_received',
          priority: 'medium',
          data: {
            senderId: client.userId,
            messageId: (message._id as any).toString(),
            projectId: data.projectId,
          },
          channels: ['push', 'email'],
        });
      }

      this.logger.log(`Message sent from ${client.userId} to ${data.receiverId}`);

    } catch (error) {
      this.logger.error('Error handling message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string; conversationId?: string },
  ) {
    const receiverSocket = this.userSockets.get(data.receiverId);
    if (receiverSocket) {
      receiverSocket.emit('user_typing', {
        userId: client.userId,
        username: client.username,
        conversationId: data.conversationId,
      });
    }
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string; conversationId?: string },
  ) {
    const receiverSocket = this.userSockets.get(data.receiverId);
    if (receiverSocket) {
      receiverSocket.emit('user_stopped_typing', {
        userId: client.userId,
        username: client.username,
        conversationId: data.conversationId,
      });
    }
  }

  @SubscribeMessage('mark_message_read')
  async handleMarkMessageRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      if (!client.userId) {
        this.logger.warn(`Unauthenticated client ${client.id} attempted to mark message as read`);
        client.emit('error', { message: 'Authentication required' });
        return;
      }

      await this.messagingService.markAsRead(client.userId, data.messageId);
      
      client.emit('message_read_confirmed', {
        messageId: data.messageId,
      });

    } catch (error) {
      this.logger.error('Error marking message as read:', error);
      client.emit('error', { message: 'Failed to mark message as read' });
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conversation_${data.conversationId}`);
    this.logger.log(`User ${client.userId} joined conversation ${data.conversationId}`);
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation_${data.conversationId}`);
    this.logger.log(`User ${client.userId} left conversation ${data.conversationId}`);
  }

  @SubscribeMessage('get_online_users')
  handleGetOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    const onlineUsers = Array.from(this.connectedUsers.keys());
    client.emit('online_users', onlineUsers);
  }

  // Public methods for other services to emit events
  async sendNotificationToUser(userId: string, notification: any) {
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.emit('new_notification', notification);
    }
  }

  async sendProjectUpdate(userId: string, update: any) {
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.emit('project_update', update);
    }
  }

  async sendPaymentUpdate(userId: string, update: any) {
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.emit('payment_update', update);
    }
  }

  async broadcastToConversation(conversationId: string, event: string, data: any) {
    this.server.to(`conversation_${conversationId}`).emit(event, data);
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  private async sendPendingNotifications(userId: string) {
    try {
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      const userSocket = this.userSockets.get(userId);
      
      if (userSocket && unreadCount.unreadCount > 0) {
        userSocket.emit('unread_notifications_count', unreadCount);
      }
    } catch (error) {
      this.logger.error('Error sending pending notifications:', error);
    }
  }
}
