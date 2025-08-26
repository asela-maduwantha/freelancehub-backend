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
import { ReviewsService } from './reviews.service';
import { 
  CreateReviewDto, 
  UpdateReviewDto, 
  ReviewResponseDto, 
  ReviewQueryDto,
  ReportReviewDto 
} from './dto/reviews.dto';

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'reviews', version: '1' })
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a review',
    description: 'Create a new review for a completed project'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Review created successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Review already exists or invalid data' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Not authorized to review this user' 
  })
  @ApiBody({ type: CreateReviewDto })
  async createReview(
    @Request() req,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(req.user.userId, createReviewDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get reviews',
    description: 'Retrieve reviews with filtering and pagination'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Reviews retrieved successfully' 
  })
  @ApiQuery({ type: ReviewQueryDto })
  async getReviews(@Query() query: ReviewQueryDto) {
    return this.reviewsService.getReviews(query);
  }

  @Get('featured')
  @ApiOperation({ 
    summary: 'Get featured reviews',
    description: 'Retrieve featured reviews for the platform'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Featured reviews retrieved successfully' 
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of reviews to return' })
  async getFeaturedReviews(@Query('limit') limit: number = 10) {
    return this.reviewsService.getFeaturedReviews(limit);
  }

  @Get('top-rated')
  @ApiOperation({ 
    summary: 'Get top-rated users',
    description: 'Retrieve top-rated freelancers or clients'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Top-rated users retrieved successfully' 
  })
  @ApiQuery({ name: 'userType', required: false, enum: ['freelancer', 'client'], description: 'Type of users to retrieve' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of users to return' })
  async getTopRatedUsers(
    @Query('userType') userType: 'freelancer' | 'client' = 'freelancer',
    @Query('limit') limit: number = 10,
  ) {
    return this.reviewsService.getTopRatedUsers(userType, limit);
  }

  @Get('user/:userId/stats')
  @ApiOperation({ 
    summary: 'Get user rating statistics',
    description: 'Get detailed rating statistics for a specific user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User rating statistics retrieved successfully' 
  })
  @ApiParam({ name: 'userId', description: 'User ID to get statistics for' })
  async getUserRatingStats(@Param('userId') userId: string) {
    return this.reviewsService.getUserRatingStats(userId);
  }

  @Get(':reviewId')
  @ApiOperation({ 
    summary: 'Get review by ID',
    description: 'Retrieve a specific review by its ID'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Review retrieved successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Review not found' 
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID to retrieve' })
  async getReviewById(@Param('reviewId') reviewId: string) {
    return this.reviewsService.getReviewById(reviewId);
  }

  @Put(':reviewId')
  @ApiOperation({ 
    summary: 'Update review',
    description: 'Update your own review (within 30 days of creation)'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Review updated successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Cannot update this review' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Review not found' 
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID to update' })
  @ApiBody({ type: UpdateReviewDto })
  async updateReview(
    @Request() req,
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(req.user.userId, reviewId, updateReviewDto);
  }

  @Delete(':reviewId')
  @ApiOperation({ 
    summary: 'Delete review',
    description: 'Delete your own review'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Review deleted successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Cannot delete this review' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Review not found' 
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID to delete' })
  async deleteReview(
    @Request() req,
    @Param('reviewId') reviewId: string,
  ) {
    return this.reviewsService.deleteReview(req.user.userId, reviewId);
  }

  @Post(':reviewId/response')
  @ApiOperation({ 
    summary: 'Add review response',
    description: 'Add a response to a review about yourself'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Response added successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Review already has a response' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Cannot respond to this review' 
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID to respond to' })
  @ApiBody({ type: ReviewResponseDto })
  async addReviewResponse(
    @Request() req,
    @Param('reviewId') reviewId: string,
    @Body() responseDto: ReviewResponseDto,
  ) {
    return this.reviewsService.addReviewResponse(req.user.userId, reviewId, responseDto);
  }

  @Put(':reviewId/response')
  @ApiOperation({ 
    summary: 'Update review response',
    description: 'Update your response to a review'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Response updated successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Review does not have a response' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Cannot update this response' 
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID to update response for' })
  @ApiBody({ type: ReviewResponseDto })
  async updateReviewResponse(
    @Request() req,
    @Param('reviewId') reviewId: string,
    @Body() responseDto: ReviewResponseDto,
  ) {
    return this.reviewsService.updateReviewResponse(req.user.userId, reviewId, responseDto);
  }

  @Post(':reviewId/helpful')
  @ApiOperation({ 
    summary: 'Vote review as helpful',
    description: 'Vote a review as helpful or remove your vote'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Vote processed successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Review not found' 
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID to vote on' })
  async voteHelpful(
    @Request() req,
    @Param('reviewId') reviewId: string,
  ) {
    return this.reviewsService.voteHelpful(req.user.userId, reviewId);
  }

  @Post(':reviewId/report')
  @ApiOperation({ 
    summary: 'Report review',
    description: 'Report a review for inappropriate content'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Review reported successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Review already reported by this user' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Review not found' 
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID to report' })
  @ApiBody({ type: ReportReviewDto })
  async reportReview(
    @Request() req,
    @Param('reviewId') reviewId: string,
    @Body() reportDto: ReportReviewDto,
  ) {
    return this.reviewsService.reportReview(req.user.userId, reviewId, reportDto);
  }
}
