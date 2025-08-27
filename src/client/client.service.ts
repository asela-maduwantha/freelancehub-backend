import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { Contract, ContractDocument } from '../schemas/contract.schema';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { Proposal, ProposalDocument } from '../schemas/proposal.schema';

@Injectable()
export class ClientService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
  ) {}

  async getDashboardData(clientId: string) {
    const client = await this.userModel.findById(clientId);
    if (!client || !client.role.includes('client')) {
      throw new ForbiddenException('Only clients can access this data');
    }

    const [
      activeProjects,
      totalProjects,
      totalSpent,
      activeFreelancers,
      pendingProposals,
      completedProjects,
      recentProjects,
      recentApplications,
      upcomingDeadlines
    ] = await Promise.all([
      this.projectModel.countDocuments({
        clientId: new Types.ObjectId(clientId),
        status: 'active'
      }),
      this.projectModel.countDocuments({
        clientId: new Types.ObjectId(clientId)
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
            'contract.clientId': new Types.ObjectId(clientId),
            status: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      this.contractModel.countDocuments({
        clientId: new Types.ObjectId(clientId),
        status: { $in: ['active', 'in_progress'] }
      }),
      this.proposalModel.aggregate([
        {
          $lookup: {
            from: 'projects',
            localField: 'projectId',
            foreignField: '_id',
            as: 'project'
          }
        },
        { $unwind: '$project' },
        {
          $match: {
            'project.clientId': new Types.ObjectId(clientId),
            status: 'pending'
          }
        },
        { $count: 'total' }
      ]).then(result => result[0]?.total || 0),
      this.projectModel.countDocuments({
        clientId: new Types.ObjectId(clientId),
        status: 'completed'
      }),
      this.getRecentProjects(clientId, 5),
      this.getRecentApplications(clientId, 5),
      this.getUpcomingDeadlines(clientId)
    ]);

    return {
      stats: {
        activeProjects,
        totalProjects,
        totalSpent,
        activeFreelancers,
        pendingProposals,
        completedProjects
      },
      recentProjects,
      recentApplications,
      upcomingDeadlines
    };
  }

  async getClientStats(clientId: string) {
    const [
      totalProjectsPosted,
      totalMoneySpent,
      totalFreelancersHired,
      averageProjectBudget,
      projectCompletionRate,
      averageFreelancerRating,
      repeatFreelancers
    ] = await Promise.all([
      this.projectModel.countDocuments({
        clientId: new Types.ObjectId(clientId)
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
            'contract.clientId': new Types.ObjectId(clientId),
            status: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      this.contractModel.distinct('freelancerId', {
        clientId: new Types.ObjectId(clientId)
      }).then(freelancers => freelancers.length),
      this.projectModel.aggregate([
        {
          $match: {
            clientId: new Types.ObjectId(clientId)
          }
        },
        { $group: { _id: null, average: { $avg: '$budget.amount' } } }
      ]).then(result => Math.round(result[0]?.average || 0)),
      this.projectModel.aggregate([
        {
          $match: {
            clientId: new Types.ObjectId(clientId)
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        }
      ]).then(result => {
        const data = result[0];
        return data ? Math.round((data.completed / data.total) * 100) : 0;
      }),
      4.8, // Mock average rating
      this.contractModel.aggregate([
        {
          $match: {
            clientId: new Types.ObjectId(clientId)
          }
        },
        {
          $group: {
            _id: '$freelancerId',
            count: { $sum: 1 }
          }
        },
        {
          $match: {
            count: { $gt: 1 }
          }
        },
        { $count: 'total' }
      ]).then(result => result[0]?.total || 0)
    ]);

    return {
      totalProjectsPosted,
      totalMoneySpent,
      totalFreelancersHired,
      averageProjectBudget,
      projectCompletionRate,
      averageFreelancerRating,
      repeatFreelancers,
      memberSince: (await this.userModel.findById(clientId))?.createdAt || new Date()
    };
  }

  async getRecentApplications(clientId: string, limit: number = 10) {
    const applications = await this.proposalModel.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $match: {
          'project.clientId': new Types.ObjectId(clientId)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'freelancerId',
          foreignField: '_id',
          as: 'freelancer'
        }
      },
      { $unwind: '$freelancer' },
      {
        $project: {
          projectTitle: '$project.title',
          freelancerName: {
            $concat: ['$freelancer.profile.firstName', ' ', '$freelancer.profile.lastName']
          },
          freelancerAvatar: '$freelancer.profile.avatar',
          freelancerRating: '$freelancer.freelancerProfile.rating',
          proposalAmount: '$pricing.amount',
          proposalStatus: '$status',
          submittedAt: '$createdAt',
          coverLetter: { $substr: ['$coverLetter', 0, 100] }
        }
      },
      { $sort: { submittedAt: -1 } },
      { $limit: limit }
    ]);

    return applications;
  }

  async getClientProjects(clientId: string, options: { status?: string; page: number; limit: number }) {
    const { status, page, limit } = options;
    const skip = (page - 1) * limit;

    const query: any = { clientId: new Types.ObjectId(clientId) };
    if (status) {
      query.status = status;
    }

    const [projects, total] = await Promise.all([
      this.projectModel
        .find(query)
        .populate('clientId', 'username profile.firstName profile.lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.projectModel.countDocuments(query)
    ]);

    // Add proposal counts
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const proposalCount = await this.proposalModel.countDocuments({
          projectId: project._id
        });
        return { ...project, proposalCount };
      })
    );

    return {
      projects: projectsWithCounts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getPaymentHistory(clientId: string, options: { page: number; limit: number; status?: string }) {
    const { page, limit, status } = options;
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
            'contract.clientId': new Types.ObjectId(clientId),
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
            localField: 'contract.freelancerId',
            foreignField: '_id',
            as: 'freelancer'
          }
        },
        { $unwind: '$freelancer' },
        {
          $project: {
            amount: 1,
            status: 1,
            createdAt: 1,
            projectTitle: '$project.title',
            freelancerName: {
              $concat: ['$freelancer.profile.firstName', ' ', '$freelancer.profile.lastName']
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
            'contract.clientId': new Types.ObjectId(clientId),
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

  async addFreelancerToFavorites(clientId: string, freelancerId: string) {
    const [client, freelancer] = await Promise.all([
      this.userModel.findById(clientId),
      this.userModel.findById(freelancerId)
    ]);

    if (!client || !client.role.includes('client')) {
      throw new ForbiddenException('Only clients can add favorites');
    }

    if (!freelancer || !freelancer.role.includes('freelancer')) {
      throw new NotFoundException('Freelancer not found');
    }

    // Initialize clientProfile if it doesn't exist
    if (!client.clientProfile) {
      client.clientProfile = {
        favoriteFreelancers: [],
        projectHistory: [],
        totalSpent: 0,
        projectsPosted: 0
      };
    }

    if (!client.clientProfile.favoriteFreelancers) {
      client.clientProfile.favoriteFreelancers = [];
    }

    const freelancerObjectId = new Types.ObjectId(freelancerId);
    if (!client.clientProfile.favoriteFreelancers.some((id: any) => id.equals(freelancerObjectId))) {
      client.clientProfile.favoriteFreelancers.push(freelancerObjectId);
      await client.save();
    }

    return { success: true, message: 'Freelancer added to favorites successfully' };
  }

  async getFavoriteFreelancers(clientId: string, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const client = await this.userModel.findById(clientId) as any;
    if (!client || !client.role.includes('client')) {
      throw new ForbiddenException('Only clients can access favorites');
    }

    const favoriteIds = (client as any).clientProfile?.favoriteFreelancers || [];

    const [freelancers, total] = await Promise.all([
      this.userModel
        .find({
          _id: { $in: favoriteIds },
          role: 'freelancer'
        })
        .select('username profile freelancerProfile.title freelancerProfile.skills freelancerProfile.hourlyRate freelancerProfile.rating')
        .skip(skip)
        .limit(limit)
        .lean(),
      favoriteIds.length
    ]);

    return {
      freelancers,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async searchFreelancers(criteria: {
    skills?: string[];
    minRate?: number;
    maxRate?: number;
    location?: string;
    availability?: string;
    experience?: string;
    page: number;
    limit: number;
  }) {
    const { skills, minRate, maxRate, location, availability, experience, page, limit } = criteria;
    const skip = (page - 1) * limit;

    const query: any = {
      role: 'freelancer',
      isVerified: true
    };

    if (skills && skills.length > 0) {
      query['freelancerProfile.skills'] = {
        $in: skills.map(skill => new RegExp(skill, 'i'))
      };
    }

    if (minRate || maxRate) {
      query['freelancerProfile.hourlyRate.amount'] = {};
      if (minRate) query['freelancerProfile.hourlyRate.amount'].$gte = minRate;
      if (maxRate) query['freelancerProfile.hourlyRate.amount'].$lte = maxRate;
    }

    if (location) {
      query.$or = [
        { 'profile.location.city': new RegExp(location, 'i') },
        { 'profile.location.country': new RegExp(location, 'i') }
      ];
    }

    if (availability) {
      query['freelancerProfile.availability'] = availability;
    }

    if (experience) {
      query['freelancerProfile.experienceLevel'] = experience;
    }

    const [freelancers, total] = await Promise.all([
      this.userModel
        .find(query)
        .select('username profile freelancerProfile')
        .sort({ 'freelancerProfile.rating': -1, 'freelancerProfile.completedProjects': -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(query)
    ]);

    return {
      freelancers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      searchCriteria: criteria
    };
  }

  async getSpendingAnalytics(clientId: string, options: { period: string; year?: number }) {
    const { period, year = new Date().getFullYear() } = options;

    let groupBy: any;
    if (period === 'monthly') {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    } else {
      groupBy = {
        year: { $year: '$createdAt' }
      };
    }

    const analytics = await this.paymentModel.aggregate([
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
          'contract.clientId': new Types.ObjectId(clientId),
          status: 'completed',
          $expr: { $eq: [{ $year: '$createdAt' }, year] }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalSpent: { $sum: '$amount' },
          paymentCount: { $sum: 1 },
          avgPayment: { $avg: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const totalSpent = analytics.reduce((sum, item) => sum + item.totalSpent, 0);
    const totalPayments = analytics.reduce((sum, item) => sum + item.paymentCount, 0);

    return {
      period,
      year,
      analytics,
      summary: {
        totalSpent,
        totalPayments,
        averagePayment: totalPayments > 0 ? Math.round(totalSpent / totalPayments) : 0
      }
    };
  }

  async getSavedSearches(clientId: string) {
    const client = await this.userModel.findById(clientId) as any;
    if (!client || !client.role.includes('client')) {
      throw new ForbiddenException('Only clients can access saved searches');
    }

    return (client as any).clientProfile?.savedSearches || [];
  }

  async saveSearch(clientId: string, searchDto: any) {
    const client = await this.userModel.findById(clientId) as any;
    if (!client || !client.role.includes('client')) {
      throw new ForbiddenException('Only clients can save searches');
    }

    if (!(client as any).clientProfile) {
      (client as any).clientProfile = {};
    }

    if (!(client as any).clientProfile.savedSearches) {
      (client as any).clientProfile.savedSearches = [];
    }

    const savedSearch = {
      id: new Types.ObjectId(),
      name: searchDto.name,
      criteria: searchDto.criteria,
      createdAt: new Date()
    };

    (client as any).clientProfile.savedSearches.push(savedSearch);
    await client.save();

    return { success: true, message: 'Search saved successfully', search: savedSearch };
  }

  // Helper methods
  private async getRecentProjects(clientId: string, limit: number) {
    return this.projectModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .select('title status budget createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  private async getUpcomingDeadlines(clientId: string) {
    const contracts = await this.contractModel
      .find({
        clientId: new Types.ObjectId(clientId),
        status: { $in: ['active', 'in_progress'] },
        deadline: { $gte: new Date() }
      })
      .populate('projectId', 'title')
      .populate('freelancerId', 'username profile.firstName profile.lastName')
      .sort({ deadline: 1 })
      .limit(5)
      .lean();

    return contracts.map((contract: any) => ({
      id: contract._id,
      projectTitle: contract.projectId?.title,
      freelancerName: `${contract.freelancerId?.profile?.firstName} ${contract.freelancerId?.profile?.lastName}`,
      deadline: contract.deadline,
      daysLeft: Math.ceil((new Date(contract.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }));
  }
}
