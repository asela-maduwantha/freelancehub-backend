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
import { MessagingService } from './messaging.service';
import { 
  CreateMessageDto, 
  UpdateMessageDto, 
  CreateConversationDto, 
  MessageQueryDto 
} from './dto/messaging.dto';

@ApiTags('Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'messaging', version: '1' })
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('messages')
  @ApiOperation({ 
    summary: 'Send a new message',
    description: 'Send a message to another user, optionally within a project context'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Message sent successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Receiver not found' 
  })
  @ApiBody({ type: CreateMessageDto })
  async sendMessage(
    @Request() req,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messagingService.createMessage(req.user.userId, createMessageDto);
  }

  @Get('messages')
  @ApiOperation({ 
    summary: 'Get messages',
    description: 'Retrieve messages for the authenticated user with pagination and filtering'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Messages retrieved successfully' 
  })
  @ApiQuery({ type: MessageQueryDto })
  async getMessages(
    @Request() req,
    @Query() query: MessageQueryDto,
  ) {
    return this.messagingService.getMessages(req.user.userId, query);
  }

  @Get('conversations')
  @ApiOperation({ 
    summary: 'Get user conversations',
    description: 'Retrieve all conversations for the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Conversations retrieved successfully' 
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getConversations(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.messagingService.getConversations(req.user.userId, page, limit);
  }

  @Post('conversations')
  @ApiOperation({ 
    summary: 'Create a new conversation',
    description: 'Start a new conversation with specified participants'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Conversation created successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid participants or conversation already exists' 
  })
  @ApiBody({ type: CreateConversationDto })
  async createConversation(
    @Request() req,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.messagingService.createConversation(req.user.userId, createConversationDto);
  }

  @Put('messages/:messageId')
  @ApiOperation({ 
    summary: 'Edit a message',
    description: 'Edit your own message content (within 24 hours of sending)'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Message updated successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Cannot edit this message' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Message not found' 
  })
  @ApiParam({ name: 'messageId', description: 'Message ID to edit' })
  @ApiBody({ type: UpdateMessageDto })
  async updateMessage(
    @Request() req,
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messagingService.updateMessage(req.user.userId, messageId, updateMessageDto);
  }

  @Delete('messages/:messageId')
  @ApiOperation({ 
    summary: 'Delete a message',
    description: 'Delete your own message'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Message deleted successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Cannot delete this message' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Message not found' 
  })
  @ApiParam({ name: 'messageId', description: 'Message ID to delete' })
  async deleteMessage(
    @Request() req,
    @Param('messageId') messageId: string,
  ) {
    return this.messagingService.deleteMessage(req.user.userId, messageId);
  }

  @Post('messages/:messageId/read')
  @ApiOperation({ 
    summary: 'Mark message as read',
    description: 'Mark a received message as read'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Message marked as read' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Cannot mark this message as read' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Message not found' 
  })
  @ApiParam({ name: 'messageId', description: 'Message ID to mark as read' })
  async markMessageAsRead(
    @Request() req,
    @Param('messageId') messageId: string,
  ) {
    return this.messagingService.markAsRead(req.user.userId, messageId);
  }

  @Post('conversations/:conversationId/read')
  @ApiOperation({ 
    summary: 'Mark conversation as read',
    description: 'Mark all messages in a conversation as read'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Conversation marked as read' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Access denied to this conversation' 
  })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID to mark as read' })
  async markConversationAsRead(
    @Request() req,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagingService.markConversationAsRead(req.user.userId, conversationId);
  }

  @Post('conversations/:conversationId/archive')
  @ApiOperation({ 
    summary: 'Archive conversation',
    description: 'Archive a conversation to hide it from active conversations'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Conversation archived successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Access denied to this conversation' 
  })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID to archive' })
  async archiveConversation(
    @Request() req,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagingService.archiveConversation(req.user.userId, conversationId);
  }

  @Get('unread-count')
  @ApiOperation({ 
    summary: 'Get unread message count',
    description: 'Get the total count of unread messages and conversations'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Unread count retrieved successfully' 
  })
  async getUnreadCount(@Request() req) {
    return this.messagingService.getUnreadCount(req.user.userId);
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Search messages',
    description: 'Search through user messages by content'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Search results retrieved successfully' 
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum results to return' })
  async searchMessages(
    @Request() req,
    @Query('q') searchTerm: string,
    @Query('limit') limit: number = 20,
  ) {
    return this.messagingService.searchMessages(req.user.userId, searchTerm, limit);
  }
}
