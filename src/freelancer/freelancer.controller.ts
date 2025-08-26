import {
  Controller,
  Get,
  Put,
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
import { Roles } from '../modules/auth/decorators/roles.decorator';
import { FreelancerService } from './freelancer.service';

@ApiTags('Freelancer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('freelancer')
@Controller({ path: 'freelancer', version: '1' })
export class FreelancerController {
  constructor(private readonly freelancerService: FreelancerService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get freelancer dashboard data' })
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
            pendingProposals: { type: 'number' },
            totalEarnings: { type: 'number' },
            profileViews: { type: 'number' },
            completedProjects: { type: 'number' },
            successRate: { type: 'number' }
          }
        },
        recentActivity: { type: 'array' },
        upcomingDeadlines: { type: 'array' },
        recentMessages: { type: 'array' }
      }
    }
  })
  async getDashboard(@Request() req: any) {
    return this.freelancerService.getDashboardData(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get freelancer statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req: any) {
    return this.freelancerService.getFreelancerStats(req.user.id);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get freelancer activity feed' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Activity feed retrieved successfully' })
  async getActivity(
    @Request() req: any,
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1
  ) {
    return this.freelancerService.getActivityFeed(req.user.id, { limit, page });
  }

  @Get('earnings')
  @ApiOperation({ summary: 'Get freelancer earnings overview' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly', 'yearly'] })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Earnings data retrieved successfully' })
  async getEarnings(
    @Request() req: any,
    @Query('period') period: string = 'monthly',
    @Query('year') year?: number,
    @Query('month') month?: number
  ) {
    return this.freelancerService.getEarnings(req.user.id, { period, year, month });
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get freelancer payment history' })
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
    return this.freelancerService.getPaymentHistory(req.user.id, { page, limit, status });
  }

  @Post('payout')
  @ApiOperation({ summary: 'Request payout' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payout requested successfully' })
  async requestPayout(
    @Request() req: any,
    @Body() payoutDto: { amount: number; paymentMethod: string }
  ) {
    return this.freelancerService.requestPayout(req.user.id, payoutDto);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update freelancer profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Profile updated successfully' })
  async updateProfile(
    @Request() req: any,
    @Body() profileDto: any
  ) {
    return this.freelancerService.updateProfile(req.user.id, profileDto);
  }

  @Post('portfolio')
  @ApiOperation({ summary: 'Add portfolio item' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Portfolio item added successfully' })
  async addPortfolioItem(
    @Request() req: any,
    @Body() portfolioDto: {
      title: string;
      description: string;
      technologies: string[];
      images?: string[];
      links?: { type: string; url: string }[];
    }
  ) {
    return this.freelancerService.addPortfolioItem(req.user.id, portfolioDto);
  }

  @Get('portfolio')
  @ApiOperation({ summary: 'Get freelancer portfolio' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Portfolio retrieved successfully' })
  async getPortfolio(@Request() req: any) {
    return this.freelancerService.getPortfolio(req.user.id);
  }

  @Get('projects/active')
  @ApiOperation({ summary: 'Get active projects for freelancer' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Active projects retrieved successfully' })
  async getActiveProjects(@Request() req: any) {
    return this.freelancerService.getActiveProjects(req.user.id);
  }

  @Get('bookmarks')
  @ApiOperation({ summary: 'Get bookmarked projects' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bookmarked projects retrieved successfully' })
  async getBookmarkedProjects(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.freelancerService.getBookmarkedProjects(req.user.id, { page, limit });
  }
}
