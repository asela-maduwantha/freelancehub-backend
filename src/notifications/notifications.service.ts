import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { User } from '../schemas/user.schema';
import { 
  CreateNotificationDto, 
  UpdateNotificationDto, 
  NotificationQueryDto,
  NotificationPreferencesDto 
} from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createNotification(userId: string, createNotificationDto: CreateNotificationDto) {
    const { 
      title, 
      message, 
      type, 
      priority = 'medium', 
      data, 
      actionUrl, 
      actionText, 
      expiresAt, 
      channels = ['in_app'], 
      category,
      metadata 
    } = createNotificationDto;

    // Validate user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check user notification preferences
    const userPreferences = (user as any).notificationPreferences || {};
    const allowedChannels = this.filterChannelsByPreferences(channels, userPreferences, type);

    if (allowedChannels.length === 0) {
      // User has disabled all channels for this notification type
      return { message: 'Notification blocked by user preferences' };
    }

    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      title,
      message,
      type,
      priority,
      data,
      actionUrl,
      actionText,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      channels: allowedChannels,
      category,
      metadata,
      deliveryStatus: allowedChannels.reduce((acc, channel) => ({
        ...acc,
        [channel]: { sent: false }
      }), {})
    });

    const savedNotification = await notification.save();

    // Trigger delivery to different channels
    await this.deliverNotification(savedNotification);

    return savedNotification;
  }

  async getNotifications(userId: string, query: NotificationQueryDto) {
    const { page = 1, limit = 20, type, priority, isRead, category } = query;
    const skip = (page - 1) * limit;

    const filter: any = { 
      userId: new Types.ObjectId(userId),
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (typeof isRead === 'boolean') filter.isRead = isRead;
    if (category) filter.category = category;

    const notifications = await this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.notificationModel.countDocuments(filter);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      userId: new Types.ObjectId(userId)
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  async markAllAsRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      { 
        userId: new Types.ObjectId(userId), 
        isRead: false,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    return { 
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount 
    };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const result = await this.notificationModel.deleteOne({
      _id: notificationId,
      userId: new Types.ObjectId(userId)
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Notification not found');
    }

    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    return { unreadCount: count };
  }

  async getNotificationsByType(userId: string, type: string, limit: number = 10) {
    const notifications = await this.notificationModel
      .find({
        userId: new Types.ObjectId(userId),
        type,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return notifications;
  }

  async updateNotificationPreferences(userId: string, preferences: NotificationPreferencesDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedPreferences = {
      ...(user as any).notificationPreferences,
      ...preferences
    };

    await this.userModel.findByIdAndUpdate(userId, {
      notificationPreferences: updatedPreferences
    });

    return { 
      message: 'Notification preferences updated successfully',
      preferences: updatedPreferences 
    };
  }

  async getNotificationPreferences(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return (user as any).notificationPreferences || {
      email: true,
      push: true,
      sms: false,
      inApp: true,
      disabledTypes: []
    };
  }

  async createBulkNotifications(userIds: string[], createNotificationDto: CreateNotificationDto) {
    const notifications = userIds.map(userId => ({
      ...createNotificationDto,
      userId: new Types.ObjectId(userId),
      deliveryStatus: (createNotificationDto.channels || ['in_app']).reduce((acc, channel) => ({
        ...acc,
        [channel]: { sent: false }
      }), {})
    }));

    const savedNotifications = await this.notificationModel.insertMany(notifications);

    // Trigger delivery for all notifications
    for (const notification of savedNotifications) {
      await this.deliverNotification(notification);
    }

    return {
      message: `Created ${savedNotifications.length} notifications`,
      count: savedNotifications.length
    };
  }

  async getNotificationStats(userId: string) {
    const stats = await this.notificationModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              priority: '$priority',
              isRead: '$isRead'
            }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        total: 0,
        unread: 0,
        byType: {},
        byPriority: {}
      };
    }

    const { total, unread, byType } = stats[0];

    const typeStats = byType.reduce((acc: any, item: any) => {
      if (!acc[item.type]) {
        acc[item.type] = { total: 0, unread: 0 };
      }
      acc[item.type].total++;
      if (!item.isRead) acc[item.type].unread++;
      return acc;
    }, {});

    const priorityStats = byType.reduce((acc: any, item: any) => {
      if (!acc[item.priority]) {
        acc[item.priority] = { total: 0, unread: 0 };
      }
      acc[item.priority].total++;
      if (!item.isRead) acc[item.priority].unread++;
      return acc;
    }, {});

    return {
      total,
      unread,
      byType: typeStats,
      byPriority: priorityStats
    };
  }

  // Helper method to send system notifications
  async sendSystemNotification(
    userId: string, 
    title: string, 
    message: string, 
    type: string = 'system_update',
    data?: any
  ) {
    return this.createNotification(userId, {
      title,
      message,
      type,
      priority: 'medium',
      data,
      channels: ['in_app', 'email']
    });
  }

  // Helper method to send payment notifications
  async sendPaymentNotification(
    userId: string,
    type: 'payment_received' | 'payment_released',
    amount: number,
    currency: string = 'USD',
    projectTitle?: string
  ) {
    const title = type === 'payment_received' 
      ? '💰 Payment Received' 
      : '🎉 Payment Released';
      
    const message = type === 'payment_received'
      ? `You received a payment of ${currency} ${amount}${projectTitle ? ` for "${projectTitle}"` : ''}`
      : `Payment of ${currency} ${amount} has been released${projectTitle ? ` for "${projectTitle}"` : ''}`;

    return this.createNotification(userId, {
      title,
      message,
      type,
      priority: 'high',
      data: { amount, currency, projectTitle },
      channels: ['in_app', 'email', 'push']
    });
  }

  // Private helper methods
  private filterChannelsByPreferences(
    channels: string[], 
    preferences: any, 
    type: string
  ): string[] {
    const disabledTypes = preferences.disabledTypes || [];
    
    if (disabledTypes.includes(type)) {
      return [];
    }

    return channels.filter(channel => {
      switch (channel) {
        case 'email':
          return preferences.email !== false;
        case 'push':
          return preferences.push !== false;
        case 'sms':
          return preferences.sms === true;
        case 'in_app':
          return preferences.inApp !== false;
        default:
          return true;
      }
    });
  }

  private async deliverNotification(notification: any) {
    // In a real implementation, this would integrate with:
    // - Email service (SendGrid, SES, etc.)
    // - Push notification service (FCM, APNS, etc.)
    // - SMS service (Twilio, etc.)
    // - WebSocket for real-time in-app notifications

    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmailNotification(notification);
            break;
          case 'push':
            await this.sendPushNotification(notification);
            break;
          case 'sms':
            await this.sendSMSNotification(notification);
            break;
          case 'in_app':
            await this.sendInAppNotification(notification);
            break;
        }

        // Update delivery status
        notification.deliveryStatus[channel] = {
          sent: true,
          sentAt: new Date()
        };
      } catch (error) {
        notification.deliveryStatus[channel] = {
          sent: false,
          error: error.message
        };
      }
    }

    await notification.save();
  }

  private async sendEmailNotification(notification: any) {
    // Placeholder for email delivery logic
    console.log(`Sending email notification: ${notification.title}`);
  }

  private async sendPushNotification(notification: any) {
    // Placeholder for push notification delivery logic
    console.log(`Sending push notification: ${notification.title}`);
  }

  private async sendSMSNotification(notification: any) {
    // Placeholder for SMS delivery logic
    console.log(`Sending SMS notification: ${notification.title}`);
  }

  private async sendInAppNotification(notification: any) {
    // Placeholder for real-time in-app notification delivery
    // In a real implementation, this would use WebSockets or Server-Sent Events
    console.log(`Sending in-app notification: ${notification.title}`);
  }
}
