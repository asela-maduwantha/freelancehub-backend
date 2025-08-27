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
import {
  FreelancerDashboardDto,
  DetailedFreelancerStatsDto,
  ActivityFeedQueryDto,
  EarningsQueryDto,
  EarningsResponseDto,
  PaymentHistoryQueryDto,
  PaymentHistoryResponseDto,
  PayoutRequestDto,
  PayoutResponseDto,
  FreelancerProfileUpdateDto,
  PortfolioItemDto,
  PortfolioItemResponseDto,
  ActiveProjectDto,
  PaginationDto,
  BookmarkedProjectsResponseDto,
} from '../dto/freelancer';

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
    type: FreelancerDashboardDto
  })
  async getDashboard(@Request() req: any): Promise<FreelancerDashboardDto> {
    return this.freelancerService.getDashboardData(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get freelancer statistics' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Statistics retrieved successfully',
    type: DetailedFreelancerStatsDto
  })
  async getStats(@Request() req: any): Promise<DetailedFreelancerStatsDto> {
    return this.freelancerService.getFreelancerStats(req.user.id);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get freelancer activity feed' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Activity feed retrieved successfully' })
  async getActivity(
    @Request() req: any,
    @Query() queryDto: ActivityFeedQueryDto
  ) {
    return this.freelancerService.getActivityFeed(req.user.id, queryDto);
  }

  @Get('earnings')
  @ApiOperation({ summary: 'Get freelancer earnings overview' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Earnings data retrieved successfully',
    type: EarningsResponseDto
  })
  async getEarnings(
    @Request() req: any,
    @Query() queryDto: EarningsQueryDto
  ): Promise<EarningsResponseDto> {
    return this.freelancerService.getEarnings(req.user.id, queryDto);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get freelancer payment history' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Payment history retrieved successfully',
    type: PaymentHistoryResponseDto
  })
  async getPayments(
    @Request() req: any,
    @Query() queryDto: PaymentHistoryQueryDto
  ): Promise<PaymentHistoryResponseDto> {
    return this.freelancerService.getPaymentHistory(req.user.id, queryDto);
  }

  @Post('payout')
  @ApiOperation({ summary: 'Request payout' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Payout requested successfully',
    type: PayoutResponseDto
  })
  async requestPayout(
    @Request() req: any,
    @Body() payoutDto: PayoutRequestDto
  ): Promise<PayoutResponseDto> {
    return this.freelancerService.requestPayout(req.user.id, payoutDto);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update freelancer profile' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  async updateProfile(
    @Request() req: any,
    @Body() profileDto: FreelancerProfileUpdateDto
  ): Promise<{ success: boolean; message: string }> {
    return this.freelancerService.updateProfile(req.user.id, profileDto);
  }

  @Post('portfolio')
  @ApiOperation({ summary: 'Add portfolio item' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Portfolio item added successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        item: { $ref: '#/components/schemas/PortfolioItemResponseDto' }
      }
    }
  })
  async addPortfolioItem(
    @Request() req: any,
    @Body() portfolioDto: PortfolioItemDto
  ): Promise<{ success: boolean; message: string; item: PortfolioItemResponseDto }> {
    return this.freelancerService.addPortfolioItem(req.user.id, portfolioDto);
  }

  @Get('portfolio')
  @ApiOperation({ summary: 'Get freelancer portfolio' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Portfolio retrieved successfully',
    type: [PortfolioItemResponseDto]
  })
  async getPortfolio(@Request() req: any): Promise<PortfolioItemResponseDto[]> {
    return this.freelancerService.getPortfolio(req.user.id);
  }

  @Get('projects/active')
  @ApiOperation({ summary: 'Get active projects for freelancer' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Active projects retrieved successfully',
    type: [ActiveProjectDto]
  })
  async getActiveProjects(@Request() req: any): Promise<ActiveProjectDto[]> {
    return this.freelancerService.getActiveProjects(req.user.id);
  }

  @Get('bookmarks')
  @ApiOperation({ summary: 'Get bookmarked projects' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Bookmarked projects retrieved successfully',
    type: BookmarkedProjectsResponseDto
  })
  async getBookmarkedProjects(
    @Request() req: any,
    @Query() queryDto: PaginationDto
  ): Promise<BookmarkedProjectsResponseDto> {
    return this.freelancerService.getBookmarkedProjects(req.user.id, queryDto);
  }
}
