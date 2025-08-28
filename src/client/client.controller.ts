import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Role } from '../modules/auth/decorators/roles.decorator';
import { ClientService } from './client.service';

@ApiTags('Client')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('client')
@Controller({ path: 'client', version: '1' })
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get client dashboard data' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        stats: {
          type: 'object',
          properties: {
            activeProjects: { type: 'number' },
            totalProjects: { type: 'number' },
            totalSpent: { type: 'number' },
            activeFreelancers: { type: 'number' },
            pendingProposals: { type: 'number' },
            completedProjects: { type: 'number' }
          }
        },
        recentProjects: { type: 'array' },
        recentApplications: { type: 'array' },
        upcomingDeadlines: { type: 'array' }
      }
    }
  })
  async getDashboard(@Request() req: any) {
    return this.clientService.getDashboardData(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get client statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req: any) {
    return this.clientService.getClientStats(req.user.id);
  }

  @Get('recent-applications')
  @ApiOperation({ summary: 'Get recent freelancer applications' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Recent applications retrieved successfully' })
  async getRecentApplications(
    @Request() req: any,
    @Query('limit') limit: number = 10
  ) {
    return this.clientService.getRecentApplications(req.user.id, limit);
  }

  @Get('projects')
  @ApiOperation({ summary: 'Get client projects' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'completed', 'draft', 'cancelled'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Client projects retrieved successfully' })
  async getClientProjects(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.clientService.getClientProjects(req.user.id, { status, page, limit });
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get client payment history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'completed', 'failed'] })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment history retrieved successfully' })
  async getPayments(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string
  ) {
    return this.clientService.getPaymentHistory(req.user.id, { page, limit, status });
  }

  @Post('favorites/freelancers')
  @ApiOperation({ summary: 'Add freelancer to favorites' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Freelancer added to favorites successfully' })
  async addFreelancerToFavorites(
    @Request() req: any,
    @Body() favoriteDto: { freelancerId: string }
  ) {
    return this.clientService.addFreelancerToFavorites(req.user.id, favoriteDto.freelancerId);
  }

  @Get('favorites/freelancers')
  @ApiOperation({ summary: 'Get favorite freelancers' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Favorite freelancers retrieved successfully' })
  async getFavoriteFreelancers(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.clientService.getFavoriteFreelancers(req.user.id, { page, limit });
  }

  @Get('freelancers/search')
  @ApiOperation({ summary: 'Search freelancers' })
  @ApiQuery({ name: 'skills', required: false, type: String, description: 'Comma-separated skills' })
  @ApiQuery({ name: 'minRate', required: false, type: Number })
  @ApiQuery({ name: 'maxRate', required: false, type: Number })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'availability', required: false, enum: ['available', 'busy', 'unavailable'] })
  @ApiQuery({ name: 'experience', required: false, enum: ['entry', 'intermediate', 'expert'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Freelancers retrieved successfully' })
  async searchFreelancers(
    @Request() req: any,
    @Query('skills') skills?: string,
    @Query('minRate') minRate?: number,
    @Query('maxRate') maxRate?: number,
    @Query('location') location?: string,
    @Query('availability') availability?: string,
    @Query('experience') experience?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12
  ) {
    return this.clientService.searchFreelancers({
      skills: skills?.split(',').map(s => s.trim()),
      minRate,
      maxRate,
      location,
      availability,
      experience,
      page,
      limit
    });
  }

  @Get('analytics/spending')
  @ApiOperation({ summary: 'Get client spending analytics' })
  @ApiQuery({ name: 'period', required: false, enum: ['monthly', 'yearly'] })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Spending analytics retrieved successfully' })
  async getSpendingAnalytics(
    @Request() req: any,
    @Query('period') period: string = 'monthly',
    @Query('year') year?: number
  ) {
    return this.clientService.getSpendingAnalytics(req.user.id, { period, year });
  }

  @Get('saved-searches')
  @ApiOperation({ summary: 'Get saved freelancer searches' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Saved searches retrieved successfully' })
  async getSavedSearches(@Request() req: any) {
    return this.clientService.getSavedSearches(req.user.id);
  }

  @Post('saved-searches')
  @ApiOperation({ summary: 'Save freelancer search' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Search saved successfully' })
  async saveSearch(
    @Request() req: any,
    @Body() searchDto: {
      name: string;
      criteria: {
        skills?: string[];
        minRate?: number;
        maxRate?: number;
        location?: string;
        availability?: string;
        experience?: string;
      };
    }
  ) {
    return this.clientService.saveSearch(req.user.id, searchDto);
  }
}
