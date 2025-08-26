import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { NotificationsService } from './notifications.service';
import { 
  CreateNotificationDto, 
  UpdateNotificationDto, 
  NotificationQueryDto,
  NotificationPreferencesDto
} from './dto/notifications.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a notification',
    description: 'Create a new notification for the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Notification created successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiBody({ type: CreateNotificationDto })
  async createNotification(
    @Request() req,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.createNotification(req.user.userId, createNotificationDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get notifications',
    description: 'Retrieve notifications for the authenticated user with filtering and pagination'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Notifications retrieved successfully' 
  })
  @ApiQuery({ type: NotificationQueryDto })
  async getNotifications(
    @Request() req,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.getNotifications(req.user.userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ 
    summary: 'Get unread notification count',
    description: 'Get the total count of unread notifications for the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Unread count retrieved successfully' 
  })
  async getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get notification statistics',
    description: 'Get detailed notification statistics for the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Notification statistics retrieved successfully' 
  })
  async getNotificationStats(@Request() req) {
    return this.notificationsService.getNotificationStats(req.user.userId);
  }

  @Get('preferences')
  @ApiOperation({ 
    summary: 'Get notification preferences',
    description: 'Get notification preferences for the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Notification preferences retrieved successfully' 
  })
  async getNotificationPreferences(@Request() req) {
    return this.notificationsService.getNotificationPreferences(req.user.userId);
  }

  @Put('preferences')
  @ApiOperation({ 
    summary: 'Update notification preferences',
    description: 'Update notification preferences for the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Notification preferences updated successfully' 
  })
  @ApiBody({ type: NotificationPreferencesDto })
  async updateNotificationPreferences(
    @Request() req,
    @Body() preferences: NotificationPreferencesDto,
  ) {
    return this.notificationsService.updateNotificationPreferences(req.user.userId, preferences);
  }

  @Get('type/:type')
  @ApiOperation({ 
    summary: 'Get notifications by type',
    description: 'Retrieve notifications of a specific type for the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Notifications retrieved successfully' 
  })
  @ApiParam({ name: 'type', description: 'Notification type to filter by' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of notifications to return' })
  async getNotificationsByType(
    @Request() req,
    @Param('type') type: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.notificationsService.getNotificationsByType(req.user.userId, type, limit);
  }

  @Put(':notificationId/read')
  @ApiOperation({ 
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Notification marked as read successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Notification not found' 
  })
  @ApiParam({ name: 'notificationId', description: 'Notification ID to mark as read' })
  async markAsRead(
    @Request() req,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(req.user.userId, notificationId);
  }

  @Put('mark-all-read')
  @ApiOperation({ 
    summary: 'Mark all notifications as read',
    description: 'Mark all unread notifications as read for the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'All notifications marked as read successfully' 
  })
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Delete(':notificationId')
  @ApiOperation({ 
    summary: 'Delete notification',
    description: 'Delete a specific notification'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Notification deleted successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Notification not found' 
  })
  @ApiParam({ name: 'notificationId', description: 'Notification ID to delete' })
  async deleteNotification(
    @Request() req,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(req.user.userId, notificationId);
  }
}
