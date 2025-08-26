import { IsString, IsOptional, IsEnum, IsBoolean, IsObject, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  message: string;

  @ApiProperty({ 
    description: 'Type of notification',
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
    ]
  })
  @IsEnum([
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
  ])
  type: string;

  @ApiPropertyOptional({ 
    description: 'Priority level',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @ApiPropertyOptional({ description: 'Additional notification data' })
  @IsOptional()
  @IsObject()
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

  @ApiPropertyOptional({ description: 'Action URL for notification' })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiPropertyOptional({ description: 'Action button text' })
  @IsOptional()
  @IsString()
  actionText?: string;

  @ApiPropertyOptional({ description: 'Notification expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ 
    description: 'Delivery channels',
    enum: ['email', 'push', 'sms', 'in_app'],
    isArray: true,
    default: ['in_app']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['email', 'push', 'sms', 'in_app'], { each: true })
  channels?: string[];

  @ApiPropertyOptional({ description: 'Notification category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: {
    templateId?: string;
    variables?: { [key: string]: any };
    source?: string;
    batchId?: string;
  };
}

export class UpdateNotificationDto {
  @ApiPropertyOptional({ description: 'Mark as read' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

export class NotificationQueryDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by notification type' })
  @IsOptional()
  @IsEnum([
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
  ])
  type?: string;

  @ApiPropertyOptional({ description: 'Filter by priority level' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @ApiPropertyOptional({ description: 'Filter by read status' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class NotificationPreferencesDto {
  @ApiPropertyOptional({ description: 'Email notifications enabled' })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiPropertyOptional({ description: 'Push notifications enabled' })
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @ApiPropertyOptional({ description: 'SMS notifications enabled' })
  @IsOptional()
  @IsBoolean()
  sms?: boolean;

  @ApiPropertyOptional({ description: 'In-app notifications enabled' })
  @IsOptional()
  @IsBoolean()
  inApp?: boolean;

  @ApiPropertyOptional({ description: 'Notification types to disable' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  disabledTypes?: string[];
}
