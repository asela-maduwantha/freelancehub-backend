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
import { Role } from '../modules/auth/decorators/roles.decorator';
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
  // New onboarding DTOs
  CreateCompleteFreelancerProfileDto,
  CreateProfessionalProfileDto,
  CreateSkillsProfileDto,
  CreateLanguagesProfileDto,
  CreatePricingProfileDto,
  CreateEducationDto,
  CreateCertificationDto,
  UpdateVisibilityDto,
  FreelancerProfileCompletionDto,
  CompleteFreelancerProfileResponseDto,
} from '../dto/freelancer';

@ApiTags('Freelancer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('freelancer')
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

  // =============== ONBOARDING ENDPOINTS ===============

  @Post('profile/create')
  @ApiOperation({ summary: 'Create complete freelancer profile for onboarding' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Freelancer profile created successfully',
    type: CompleteFreelancerProfileResponseDto
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Profile already exists or validation failed' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only freelancers can create profiles' })
  async createCompleteProfile(
    @Request() req: any,
    @Body() profileDto: CreateCompleteFreelancerProfileDto
  ): Promise<CompleteFreelancerProfileResponseDto> {
    return this.freelancerService.createCompleteFreelancerProfile(req.user.id, profileDto);
  }

  @Get('profile/complete')
  @ApiOperation({ summary: 'Get complete freelancer profile' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Complete profile retrieved successfully',
    type: CompleteFreelancerProfileResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Freelancer profile not found' })
  async getCompleteProfile(@Request() req: any): Promise<CompleteFreelancerProfileResponseDto> {
    return this.freelancerService.getCompleteFreelancerProfile(req.user.id);
  }

  @Put('profile/professional')
  @ApiOperation({ summary: 'Update professional profile section' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Professional profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Freelancer profile not found' })
  async updateProfessionalProfile(
    @Request() req: any,
    @Body() professionalDto: CreateProfessionalProfileDto
  ): Promise<{ success: boolean; message: string }> {
    return this.freelancerService.updateProfessionalProfile(req.user.id, professionalDto);
  }

  @Put('profile/skills')
  @ApiOperation({ summary: 'Update skills profile section' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Skills profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Freelancer profile not found' })
  async updateSkillsProfile(
    @Request() req: any,
    @Body() skillsDto: CreateSkillsProfileDto
  ): Promise<{ success: boolean; message: string }> {
    return this.freelancerService.updateSkillsProfile(req.user.id, skillsDto);
  }

  @Put('profile/languages')
  @ApiOperation({ summary: 'Update languages profile section' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Languages profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Freelancer profile not found' })
  async updateLanguagesProfile(
    @Request() req: any,
    @Body() languagesDto: CreateLanguagesProfileDto
  ): Promise<{ success: boolean; message: string }> {
    return this.freelancerService.updateLanguagesProfile(req.user.id, languagesDto);
  }

  @Put('profile/pricing')
  @ApiOperation({ summary: 'Update pricing profile section' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Pricing profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Freelancer profile not found' })
  async updatePricingProfile(
    @Request() req: any,
    @Body() pricingDto: CreatePricingProfileDto
  ): Promise<{ success: boolean; message: string }> {
    return this.freelancerService.updatePricingProfile(req.user.id, pricingDto);
  }

  @Put('profile/visibility')
  @ApiOperation({ summary: 'Update visibility settings' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Visibility settings updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Freelancer profile not found' })
  async updateVisibilitySettings(
    @Request() req: any,
    @Body() visibilityDto: UpdateVisibilityDto
  ): Promise<{ success: boolean; message: string }> {
    return this.freelancerService.updateVisibilitySettings(req.user.id, visibilityDto);
  }

  @Post('education')
  @ApiOperation({ summary: 'Add education to profile' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Education added successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        education: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Freelancer profile not found' })
  async addEducation(
    @Request() req: any,
    @Body() educationDto: CreateEducationDto
  ): Promise<{ success: boolean; message: string; education: any }> {
    return this.freelancerService.addEducation(req.user.id, educationDto);
  }

  @Post('certification')
  @ApiOperation({ summary: 'Add certification to profile' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Certification added successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        certification: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Freelancer profile not found' })
  async addCertification(
    @Request() req: any,
    @Body() certificationDto: CreateCertificationDto
  ): Promise<{ success: boolean; message: string; certification: any }> {
    return this.freelancerService.addCertification(req.user.id, certificationDto);
  }

  @Get('profile/completion')
  @ApiOperation({ summary: 'Get profile completion status and suggestions' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile completion status retrieved successfully',
    type: FreelancerProfileCompletionDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Freelancer profile not found' })
  async getProfileCompletion(@Request() req: any): Promise<FreelancerProfileCompletionDto> {
    return this.freelancerService.getProfileCompletion(req.user.id);
  }

  @Post('profile/portfolio')
  @ApiOperation({ summary: 'Add portfolio item to complete profile' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Portfolio item added successfully to complete profile',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        item: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Freelancer profile not found' })
  async addPortfolioItemToProfile(
    @Request() req: any,
    @Body() portfolioDto: PortfolioItemDto
  ): Promise<{ success: boolean; message: string; item: any }> {
    return this.freelancerService.addPortfolioItemToProfile(req.user.id, portfolioDto);
  }
}
