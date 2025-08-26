import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from './schemas/review.schema';
import { User } from '../schemas/user.schema';
import { Project } from '../schemas/project.schema';
import { 
  CreateReviewDto, 
  UpdateReviewDto, 
  ReviewResponseDto, 
  ReviewQueryDto,
  ReportReviewDto 
} from './dto/reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async createReview(reviewerId: string, createReviewDto: CreateReviewDto) {
    const { 
      revieweeId, 
      projectId, 
      contractId, 
      rating, 
      comment, 
      reviewType, 
      criteria, 
      tags = [], 
      isPublic = true, 
      metadata 
    } = createReviewDto;

    // Validate reviewee exists
    const reviewee = await this.userModel.findById(revieweeId);
    if (!reviewee) {
      throw new NotFoundException('Reviewee not found');
    }

    // Validate project exists and reviewer was involved
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Verify reviewer has permission to review this user for this project
    const canReview = await this.verifyReviewPermission(reviewerId, revieweeId, projectId, reviewType);
    if (!canReview) {
      throw new ForbiddenException('You cannot review this user for this project');
    }

    // Check if review already exists
    const existingReview = await this.reviewModel.findOne({
      reviewerId: new Types.ObjectId(reviewerId),
      revieweeId: new Types.ObjectId(revieweeId),
      projectId: new Types.ObjectId(projectId)
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this user for this project');
    }

    const review = new this.reviewModel({
      reviewerId: new Types.ObjectId(reviewerId),
      revieweeId: new Types.ObjectId(revieweeId),
      projectId: new Types.ObjectId(projectId),
      contractId: contractId ? new Types.ObjectId(contractId) : undefined,
      rating,
      comment,
      reviewType,
      criteria,
      tags,
      isPublic,
      metadata: {
        ...metadata,
        projectTitle: project.title,
        projectCategory: project.category
      }
    });

    const savedReview = await review.save();

    // Update user's rating statistics
    await this.updateUserRatingStats(revieweeId);

    return this.populateReview(savedReview);
  }

  async getReviews(query: ReviewQueryDto) {
    const { 
      page = 1, 
      limit = 20, 
      revieweeId, 
      reviewerId, 
      projectId, 
      reviewType, 
      minRating, 
      maxRating, 
      publicOnly, 
      featuredOnly, 
      tags 
    } = query;
    const skip = (page - 1) * limit;

    const filter: any = { status: 'active' };

    if (revieweeId) filter.revieweeId = new Types.ObjectId(revieweeId);
    if (reviewerId) filter.reviewerId = new Types.ObjectId(reviewerId);
    if (projectId) filter.projectId = new Types.ObjectId(projectId);
    if (reviewType) filter.reviewType = reviewType;
    if (publicOnly) filter.isPublic = true;
    if (featuredOnly) filter.isFeatured = true;
    if (tags && tags.length > 0) filter.tags = { $in: tags };

    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = minRating;
      if (maxRating) filter.rating.$lte = maxRating;
    }

    const reviews = await this.reviewModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reviewerId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('revieweeId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('projectId', 'title category status')
      .exec();

    const total = await this.reviewModel.countDocuments(filter);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getReviewById(reviewId: string) {
    const review = await this.reviewModel
      .findById(reviewId)
      .populate('reviewerId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('revieweeId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('projectId', 'title category status')
      .exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async updateReview(userId: string, reviewId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.reviewModel.findById(reviewId);
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.reviewerId.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    // Check if review is not too old (30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if ((review as any).createdAt < thirtyDaysAgo) {
      throw new BadRequestException('Cannot edit reviews older than 30 days');
    }

    // Store original comment if this is the first edit
    if (!review.originalComment) {
      review.originalComment = review.comment;
    }

    // Update fields
    if (updateReviewDto.rating) review.rating = updateReviewDto.rating;
    if (updateReviewDto.comment) review.comment = updateReviewDto.comment;
    if (updateReviewDto.criteria) review.criteria = { ...review.criteria, ...updateReviewDto.criteria };
    if (updateReviewDto.tags) review.tags = updateReviewDto.tags;
    if (typeof updateReviewDto.isPublic === 'boolean') review.isPublic = updateReviewDto.isPublic;
    
    review.editedAt = new Date();
    await review.save();

    // Update user's rating statistics if rating changed
    if (updateReviewDto.rating) {
      await this.updateUserRatingStats(review.revieweeId.toString());
    }

    return this.populateReview(review);
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.reviewModel.findById(reviewId);
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.reviewerId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewModel.findByIdAndDelete(reviewId);

    // Update user's rating statistics
    await this.updateUserRatingStats(review.revieweeId.toString());

    return { message: 'Review deleted successfully' };
  }

  async addReviewResponse(userId: string, reviewId: string, responseDto: ReviewResponseDto) {
    const review = await this.reviewModel.findById(reviewId);
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.revieweeId.toString() !== userId) {
      throw new ForbiddenException('You can only respond to reviews about yourself');
    }

    if (review.response) {
      throw new BadRequestException('Review already has a response');
    }

    review.response = {
      comment: responseDto.comment,
      createdAt: new Date()
    };

    await review.save();
    return this.populateReview(review);
  }

  async updateReviewResponse(userId: string, reviewId: string, responseDto: ReviewResponseDto) {
    const review = await this.reviewModel.findById(reviewId);
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.revieweeId.toString() !== userId) {
      throw new ForbiddenException('You can only update responses to reviews about yourself');
    }

    if (!review.response) {
      throw new BadRequestException('Review does not have a response to update');
    }

    review.response.comment = responseDto.comment;
    review.response.updatedAt = new Date();

    await review.save();
    return this.populateReview(review);
  }

  async voteHelpful(userId: string, reviewId: string) {
    const review = await this.reviewModel.findById(reviewId);
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const hasVoted = review.helpfulVoters.includes(userObjectId);

    if (hasVoted) {
      // Remove vote
      review.helpfulVoters = review.helpfulVoters.filter(
        voterId => !voterId.equals(userObjectId)
      );
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      // Add vote
      review.helpfulVoters.push(userObjectId);
      review.helpfulVotes += 1;
    }

    await review.save();
    return { 
      message: hasVoted ? 'Vote removed' : 'Vote added',
      helpfulVotes: review.helpfulVotes,
      hasVoted: !hasVoted
    };
  }

  async reportReview(userId: string, reviewId: string, reportDto: ReportReviewDto) {
    const review = await this.reviewModel.findById(reviewId);
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user already reported this review
    const existingReport = review.reports.find(
      report => report.userId.equals(new Types.ObjectId(userId))
    );

    if (existingReport) {
      throw new BadRequestException('You have already reported this review');
    }

    review.reports.push({
      userId: new Types.ObjectId(userId),
      reason: reportDto.reason,
      comment: reportDto.comment,
      createdAt: new Date()
    });

    review.reportCount += 1;

    // Auto-hide review if it gets too many reports
    if (review.reportCount >= 5) {
      review.status = 'under_review';
    }

    await review.save();
    return { message: 'Review reported successfully' };
  }

  async getUserRatingStats(userId: string) {
    const stats = await this.reviewModel.aggregate([
      { 
        $match: { 
          revieweeId: new Types.ObjectId(userId),
          status: 'active'
        } 
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          },
          byType: {
            $push: {
              type: '$reviewType',
              rating: '$rating'
            }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        clientReviews: { total: 0, average: 0 },
        freelancerReviews: { total: 0, average: 0 }
      };
    }

    const { totalReviews, averageRating, ratingDistribution, byType } = stats[0];

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((rating: number) => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    // Calculate reviews by type
    const clientReviews = byType.filter((item: any) => item.type === 'client_to_freelancer');
    const freelancerReviews = byType.filter((item: any) => item.type === 'freelancer_to_client');

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution: distribution,
      clientReviews: {
        total: clientReviews.length,
        average: clientReviews.length > 0 
          ? Math.round((clientReviews.reduce((sum: number, item: any) => sum + item.rating, 0) / clientReviews.length) * 10) / 10
          : 0
      },
      freelancerReviews: {
        total: freelancerReviews.length,
        average: freelancerReviews.length > 0 
          ? Math.round((freelancerReviews.reduce((sum: number, item: any) => sum + item.rating, 0) / freelancerReviews.length) * 10) / 10
          : 0
      }
    };
  }

  async getFeaturedReviews(limit: number = 10) {
    const reviews = await this.reviewModel
      .find({ 
        isFeatured: true, 
        isPublic: true, 
        status: 'active' 
      })
      .sort({ helpfulVotes: -1, createdAt: -1 })
      .limit(limit)
      .populate('reviewerId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('revieweeId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('projectId', 'title category')
      .exec();

    return reviews;
  }

  async getTopRatedUsers(userType: 'freelancer' | 'client' = 'freelancer', limit: number = 10) {
    const reviewType = userType === 'freelancer' ? 'client_to_freelancer' : 'freelancer_to_client';

    const topUsers = await this.reviewModel.aggregate([
      { 
        $match: { 
          reviewType,
          status: 'active',
          isPublic: true
        } 
      },
      {
        $group: {
          _id: '$revieweeId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      },
      { $match: { totalReviews: { $gte: 3 } } }, // Minimum 3 reviews
      { $sort: { averageRating: -1, totalReviews: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          averageRating: { $round: ['$averageRating', 1] },
          totalReviews: 1,
          username: '$user.username',
          profile: '$user.profile'
        }
      }
    ]);

    return topUsers;
  }

  // Private helper methods
  private async verifyReviewPermission(
    reviewerId: string, 
    revieweeId: string, 
    projectId: string, 
    reviewType: string
  ): Promise<boolean> {
    const project = await this.projectModel.findById(projectId);
    
    if (!project) return false;

    if (reviewType === 'client_to_freelancer') {
      // Client reviewing freelancer
      return project.clientId.toString() === reviewerId && 
             project.selectedFreelancer?.toString() === revieweeId;
    } else {
      // Freelancer reviewing client
      return project.selectedFreelancer?.toString() === reviewerId && 
             project.clientId.toString() === revieweeId;
    }
  }

  private async updateUserRatingStats(userId: string) {
    const stats = await this.getUserRatingStats(userId);
    
    // Update user document with cached rating stats
    await this.userModel.findByIdAndUpdate(userId, {
      'ratingStats.totalReviews': stats.totalReviews,
      'ratingStats.averageRating': stats.averageRating,
      'ratingStats.lastUpdated': new Date()
    });
  }

  private populateReview(review: any) {
    return this.reviewModel
      .findById(review._id)
      .populate('reviewerId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('revieweeId', 'username profile.firstName profile.lastName profile.avatar')
      .populate('projectId', 'title category status')
      .exec();
  }
}
