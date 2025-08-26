import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttachmentDto {
  @ApiProperty({ description: 'Original filename' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'File URL' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @ApiProperty({ description: 'MIME type of the file' })
  @IsString()
  mimeType: string;
}

export class CreateMessageDto {
  @ApiProperty({ description: 'ID of the message receiver' })
  @IsMongoId()
  receiverId: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Project ID if message is related to a project' })
  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @ApiPropertyOptional({ 
    description: 'Type of message',
    enum: ['text', 'file', 'image', 'proposal', 'contract'],
    default: 'text'
  })
  @IsOptional()
  @IsEnum(['text', 'file', 'image', 'proposal', 'contract'])
  type?: string;

  @ApiPropertyOptional({ 
    description: 'File attachments',
    type: [AttachmentDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: {
    proposalId?: string;
    contractId?: string;
    milestoneId?: string;
  };
}

export class UpdateMessageDto {
  @ApiProperty({ description: 'Updated message content' })
  @IsString()
  content: string;
}

export class CreateConversationDto {
  @ApiProperty({ description: 'Array of participant user IDs' })
  @IsArray()
  @IsMongoId({ each: true })
  participants: string[];

  @ApiPropertyOptional({ description: 'Project ID if conversation is related to a project' })
  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Conversation title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ 
    description: 'Type of conversation',
    enum: ['project', 'support', 'general'],
    default: 'project'
  })
  @IsOptional()
  @IsEnum(['project', 'support', 'general'])
  type?: string;
}

export class MessageQueryDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Conversation ID to filter messages' })
  @IsOptional()
  @IsMongoId()
  conversationId?: string;

  @ApiPropertyOptional({ description: 'Project ID to filter messages' })
  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Only show unread messages' })
  @IsOptional()
  unreadOnly?: boolean;
}
