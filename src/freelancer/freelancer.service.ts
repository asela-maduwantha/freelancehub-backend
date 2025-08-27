import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { Contract, ContractDocument } from '../schemas/contract.schema';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { Proposal, ProposalDocument } from '../schemas/proposal.schema';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
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
  ActivityItemDto,
} from '../dto/freelancer';

@Injectable()
export class FreelancerService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async getDashboardData(freelancerId: string): Promise<FreelancerDashboardDto> {
    const freelancer = await this.userModel.findById(freelancerId);
    if (!freelancer || !freelancer.role.includes('freelancer')) {
      throw new ForbiddenException('Only freelancers can access this data');
    }

    const [
      activeProjects,
      pendingProposals,
      totalEarnings,
      completedProjects,
      recentActivity,
      upcomingDeadlines,
      recentMessages
    ] = await Promise.all([
      this.contractModel.countDocuments({
        freelancerId: new Types.ObjectId(freelancerId),
        status: { $in: ['active', 'in_progress'] }
      }),
      this.proposalModel.countDocuments({
        freelancerId: new Types.ObjectId(freelancerId),
        status: 'pending'
      }),
      this.paymentModel.aggregate([
        {
          $lookup: {
            from: 'contracts',
            localField: 'contractId',
            foreignField: '_id',
            as: 'contract'
          }
        },
        { $unwind: '$contract' },
        {
          $match: {
            'contract.freelancerId': new Types.ObjectId(freelancerId),
            status: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      this.contractModel.countDocuments({
        freelancerId: new Types.ObjectId(freelancerId),
        status: 'completed'
      }),
      this.getRecentActivity(freelancerId, 5),
      this.getUpcomingDeadlines(freelancerId),
      this.getRecentMessages(freelancerId, 3)
    ]);

    const profileViews = Math.floor(Math.random() * 100) + 20; // Mock data
    const successRate = completedProjects > 0 ? 
      Math.round((completedProjects / (completedProjects + 2)) * 100) : 0;

    return {
      stats: {
        activeProjects,
        pendingProposals,
        totalEarnings,
        profileViews,
        completedProjects,
        successRate
      },
      recentActivity,
      upcomingDeadlines,
      recentMessages
    };
  }

  async getFreelancerStats(freelancerId: string): Promise<DetailedFreelancerStatsDto> {
    const [
      totalProposals,
      acceptedProposals,
      totalEarnings,
      averageProjectValue,
      completedProjects,
      ongoingProjects,
      totalClients
    ] = await Promise.all([
      this.proposalModel.countDocuments({
        freelancerId: new Types.ObjectId(freelancerId)
      }),
      this.proposalModel.countDocuments({
        freelancerId: new Types.ObjectId(freelancerId),
        status: 'accepted'
      }),
      this.paymentModel.aggregate([
        {
          $lookup: {
            from: 'contracts',
            localField: 'contractId',
            foreignField: '_id',
            as: 'contract'
          }
        },
        { $unwind: '$contract' },
        {
          $match: {
            'contract.freelancerId': new Types.ObjectId(freelancerId),
            status: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      this.contractModel.aggregate([
        {
          $match: {
            freelancerId: new Types.ObjectId(freelancerId),
            status: 'completed'
          }
        },
        { $group: { _id: null, average: { $avg: '$totalAmount' } } }
      ]).then(result => result[0]?.average || 0),
      this.contractModel.countDocuments({
        freelancerId: new Types.ObjectId(freelancerId),
        status: 'completed'
      }),
      this.contractModel.countDocuments({
        freelancerId: new Types.ObjectId(freelancerId),
        status: { $in: ['active', 'in_progress'] }
      }),
      this.contractModel.distinct('clientId', {
        freelancerId: new Types.ObjectId(freelancerId)
      }).then(clients => clients.length)
    ]);

    const proposalAcceptanceRate = totalProposals > 0 ? 
      Math.round((acceptedProposals / totalProposals) * 100) : 0;

    return {
      totalProposals,
      acceptedProposals,
      proposalAcceptanceRate,
      totalEarnings,
      averageProjectValue: Math.round(averageProjectValue),
      completedProjects,
      ongoingProjects,
      totalClients,
      joinDate: (await this.userModel.findById(freelancerId))?.createdAt || new Date()
    };
  }

  async getActivityFeed(freelancerId: string, options: ActivityFeedQueryDto) {
    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;

    // Combine different types of activities
    const [proposals, contracts, payments] = await Promise.all([
      this.proposalModel
        .find({ freelancerId: new Types.ObjectId(freelancerId) })
        .populate('projectId', 'title')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      this.contractModel
        .find({ freelancerId: new Types.ObjectId(freelancerId) })
        .populate('projectId', 'title')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      this.paymentModel
        .find({})
        .populate({
          path: 'contractId',
          match: { freelancerId: new Types.ObjectId(freelancerId) },
          populate: { path: 'projectId', select: 'title' }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean()
    ]);

    // Format activities
    const activities = [
      ...proposals.map((p: any) => ({
        id: p._id,
        type: 'proposal',
        action: `Submitted proposal for "${p.projectId?.title}"`,
        date: p.createdAt,
        status: p.status
      })),
      ...contracts.map((c: any) => ({
        id: c._id,
        type: 'contract',
        action: `Contract ${c.status} for "${c.projectId?.title}"`,
        date: c.createdAt,
        status: c.status
      })),
      ...payments.filter((p: any) => p.contractId).map((p: any) => ({
        id: p._id,
        type: 'payment',
        action: `Payment received for "${p.contractId?.projectId?.title}"`,
        date: p.createdAt,
        amount: p.amount
      }))
    ];

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async getEarnings(freelancerId: string, options: EarningsQueryDto): Promise<EarningsResponseDto> {
    const { period = 'monthly', year = new Date().getFullYear(), month } = options;
    
    let matchCondition: any = {
      status: 'completed'
    };

    // Add date filtering based on period
    if (period === 'monthly' && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      matchCondition.createdAt = { $gte: startDate, $lte: endDate };
    } else if (period === 'yearly') {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      matchCondition.createdAt = { $gte: startDate, $lte: endDate };
    }

    const earnings = await this.paymentModel.aggregate([
      {
        $lookup: {
          from: 'contracts',
          localField: 'contractId',
          foreignField: '_id',
          as: 'contract'
        }
      },
      { $unwind: '$contract' },
      {
        $match: {
          'contract.freelancerId': new Types.ObjectId(freelancerId),
          ...matchCondition
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return {
      period,
      year,
      month,
      earnings,
      totalEarnings: earnings.reduce((sum, e) => sum + e.totalAmount, 0),
      totalTransactions: earnings.reduce((sum, e) => sum + e.count, 0)
    };
  }

  async getPaymentHistory(freelancerId: string, options: PaymentHistoryQueryDto): Promise<PaymentHistoryResponseDto> {
    const { page = 1, limit = 20, status } = options;
    const skip = (page - 1) * limit;

    const matchCondition: any = {};
    if (status) {
      matchCondition.status = status;
    }

    const [payments, total] = await Promise.all([
      this.paymentModel.aggregate([
        {
          $lookup: {
            from: 'contracts',
            localField: 'contractId',
            foreignField: '_id',
            as: 'contract'
          }
        },
        { $unwind: '$contract' },
        {
          $match: {
            'contract.freelancerId': new Types.ObjectId(freelancerId),
            ...matchCondition
          }
        },
        {
          $lookup: {
            from: 'projects',
            localField: 'contract.projectId',
            foreignField: '_id',
            as: 'project'
          }
        },
        { $unwind: '$project' },
        {
          $lookup: {
            from: 'users',
            localField: 'contract.clientId',
            foreignField: '_id',
            as: 'client'
          }
        },
        { $unwind: '$client' },
        {
          $project: {
            _id: { $toString: '$_id' },
            amount: 1,
            status: 1,
            createdAt: 1,
            projectTitle: '$project.title',
            clientName: {
              $concat: ['$client.profile.firstName', ' ', '$client.profile.lastName']
            }
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]),
      this.paymentModel.aggregate([
        {
          $lookup: {
            from: 'contracts',
            localField: 'contractId',
            foreignField: '_id',
            as: 'contract'
          }
        },
        { $unwind: '$contract' },
        {
          $match: {
            'contract.freelancerId': new Types.ObjectId(freelancerId),
            ...matchCondition
          }
        },
        { $count: 'total' }
      ]).then(result => result[0]?.total || 0)
    ]);

    return {
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async requestPayout(freelancerId: string, payoutDto: PayoutRequestDto): Promise<PayoutResponseDto> {
    // Validate freelancer
    const freelancer = await this.userModel.findById(freelancerId);
    if (!freelancer || !freelancer.role.includes('freelancer')) {
      throw new ForbiddenException('Only freelancers can request payouts');
    }

    // Check available balance (simplified)
    const totalEarnings = await this.paymentModel.aggregate([
      {
        $lookup: {
          from: 'contracts',
          localField: 'contractId',
          foreignField: '_id',
          as: 'contract'
        }
      },
      { $unwind: '$contract' },
      {
        $match: {
          'contract.freelancerId': new Types.ObjectId(freelancerId),
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).then(result => result[0]?.total || 0);

    if (payoutDto.amount > totalEarnings) {
      throw new ForbiddenException('Insufficient balance for payout');
    }

    // Create payout request (you would integrate with payment processor here)
    const payoutRequest = {
      freelancerId: freelancerId,
      amount: payoutDto.amount,
      paymentMethod: payoutDto.paymentMethod,
      status: 'pending',
      requestedAt: new Date()
    };

    return {
      success: true,
      message: 'Payout requested successfully',
      payoutRequest
    };
  }

  async updateProfile(freelancerId: string, profileDto: FreelancerProfileUpdateDto): Promise<{ success: boolean; message: string }> {
    const freelancer = await this.userModel.findById(freelancerId);
    if (!freelancer || !freelancer.role.includes('freelancer')) {
      throw new ForbiddenException('Only freelancers can update this profile');
    }

    // Update freelancer profile
    const updateData: any = {};
    
    if (profileDto.bio) updateData['freelancerProfile.bio'] = profileDto.bio;
    if (profileDto.hourlyRate) updateData['freelancerProfile.hourlyRate'] = profileDto.hourlyRate;
    if (profileDto.skills) updateData['freelancerProfile.skills'] = profileDto.skills;
    if (profileDto.availability) updateData['freelancerProfile.availability'] = profileDto.availability;
    if (profileDto.title) updateData['freelancerProfile.title'] = profileDto.title;
    if (profileDto.experience) updateData['freelancerProfile.experience'] = profileDto.experience;
    if (profileDto.languages) updateData['freelancerProfile.languages'] = profileDto.languages;
    if (profileDto.timezone) updateData['freelancerProfile.timezone'] = profileDto.timezone;

    await this.userModel.findByIdAndUpdate(freelancerId, updateData, { new: true });

    return { success: true, message: 'Profile updated successfully' };
  }

  async addPortfolioItem(freelancerId: string, portfolioDto: PortfolioItemDto): Promise<{ success: boolean; message: string; item: PortfolioItemResponseDto }> {
    const freelancer = await this.userModel.findById(freelancerId) as any;
    if (!freelancer || !freelancer.role.includes('freelancer')) {
      throw new ForbiddenException('Only freelancers can add portfolio items');
    }

    if (!freelancer.freelancerProfile) {
      freelancer.freelancerProfile = {};
    }

    if (!freelancer.freelancerProfile.portfolio) {
      freelancer.freelancerProfile.portfolio = [];
    }

    const portfolioItem: PortfolioItemResponseDto = {
      ...portfolioDto,
      id: new Types.ObjectId().toString(),
      createdAt: new Date()
    };

    freelancer.freelancerProfile.portfolio.push(portfolioItem);
    await freelancer.save();

    return { success: true, message: 'Portfolio item added successfully', item: portfolioItem };
  }

  async getPortfolio(freelancerId: string): Promise<PortfolioItemResponseDto[]> {
    const freelancer = await this.userModel.findById(freelancerId) as any;
    if (!freelancer) {
      throw new NotFoundException('Freelancer not found');
    }

    return freelancer.freelancerProfile?.portfolio || [];
  }

  async getActiveProjects(freelancerId: string): Promise<ActiveProjectDto[]> {
    const contracts = await this.contractModel
      .find({
        freelancerId: new Types.ObjectId(freelancerId),
        status: { $in: ['active', 'in_progress'] }
      })
      .populate('projectId', 'title description budget deadline')
      .populate('clientId', 'username profile.firstName profile.lastName profile.avatar')
      .sort({ createdAt: -1 })
      .lean() as any[];

    return contracts.map((contract: any) => ({
      _id: contract._id.toString(),
      status: contract.status,
      createdAt: contract.createdAt,
      projectId: {
        _id: contract.projectId._id.toString(),
        title: contract.projectId.title,
        description: contract.projectId.description,
        budget: contract.projectId.budget,
        deadline: contract.projectId.deadline
      },
      clientId: {
        _id: contract.clientId._id.toString(),
        username: contract.clientId.username,
        profile: contract.clientId.profile
      }
    }));
  }

  async getBookmarkedProjects(freelancerId: string, options: PaginationDto): Promise<BookmarkedProjectsResponseDto> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const freelancer = await this.userModel.findById(freelancerId) as any;
    if (!freelancer || !freelancer.role.includes('freelancer')) {
      throw new ForbiddenException('Only freelancers can access bookmarks');
    }

    const bookmarkedIds = freelancer.freelancerProfile?.bookmarkedProjects || [];
    
    const [projectsRaw, total] = await Promise.all([
      this.projectModel
        .find({ _id: { $in: bookmarkedIds } })
        .populate('clientId', 'username profile.firstName profile.lastName profile.avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      bookmarkedIds.length
    ]);

    const projects = (projectsRaw as any[]).map((project: any) => ({
      _id: project._id.toString(),
      title: project.title,
      description: project.description,
      budget: project.budget,
      createdAt: project.createdAt,
      clientId: {
        _id: project.clientId._id.toString(),
        username: project.clientId.username,
        profile: project.clientId.profile
      }
    }));

    return {
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Helper methods
  private async getRecentActivity(freelancerId: string, limit: number): Promise<ActivityItemDto[]> {
    const notifications = await this.notificationModel
      .find({ userId: new Types.ObjectId(freelancerId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean() as any[];

    return notifications.map((notification: any) => ({
      id: notification._id.toString(),
      type: notification.type,
      action: notification.message,
      date: notification.createdAt || new Date(),
      status: notification.read ? 'read' : 'unread'
    }));
  }

  private async getUpcomingDeadlines(freelancerId: string) {
    const contracts = await this.contractModel
      .find({
        freelancerId: new Types.ObjectId(freelancerId),
        status: { $in: ['active', 'in_progress'] },
        deadline: { $gte: new Date() }
      })
      .populate('projectId', 'title')
      .sort({ deadline: 1 })
      .limit(5)
      .lean();

    return contracts.map((contract: any) => ({
      id: contract._id,
      projectTitle: contract.projectId?.title,
      deadline: contract.deadline,
      daysLeft: Math.ceil((new Date(contract.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }));
  }

  private async getRecentMessages(freelancerId: string, limit: number) {
    // This would need to be implemented when you have a proper messaging system
    return [];
  }
}
