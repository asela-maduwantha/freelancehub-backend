import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { FileUpload, FileUploadDocument } from '../schemas/file-upload.schema';
import { AdminStatsDto, UserManagementDto, UserActionDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(FileUpload.name) private fileUploadModel: Model<FileUploadDocument>,
  ) {}

  async getDashboardStats(statsDto: AdminStatsDto) {
    const dateFilter = this.buildDateFilter(statsDto);

    const [
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      totalPayments,
      totalRevenue,
      newUsersThisPeriod,
      newProjectsThisPeriod,
      paymentsThisPeriod,
      revenueThisPeriod,
    ] = await Promise.all([
      this.userModel.countDocuments({ isActive: true }),
      this.userModel.countDocuments({ 
        isActive: true, 
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }),
      this.projectModel.countDocuments(),
      this.projectModel.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      this.paymentModel.countDocuments(),
      this.calculateTotalRevenue(),
      this.userModel.countDocuments({ 
        createdAt: dateFilter,
        isActive: true 
      }),
      this.projectModel.countDocuments({ 
        createdAt: dateFilter 
      }),
      this.paymentModel.countDocuments({ 
        createdAt: dateFilter 
      }),
      this.calculateRevenueForPeriod(dateFilter),
    ]);

    // Get user role distribution
    const userRoleStats = await this.userModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // Get project status distribution
    const projectStatusStats = await this.projectModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Get top categories
    const topCategories = await this.projectModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return {
      overview: {
        totalUsers,
        activeUsers,
        totalProjects,
        activeProjects,
        totalPayments,
        totalRevenue,
      },
      growth: {
        newUsers: newUsersThisPeriod,
        newProjects: newProjectsThisPeriod,
        newPayments: paymentsThisPeriod,
        revenue: revenueThisPeriod,
      },
      distribution: {
        userRoles: userRoleStats,
        projectStatus: projectStatusStats,
        topCategories,
      },
    };
  }

  async getUsers(managementDto: UserManagementDto) {
    const { page = 1, limit = 10, role, status, search } = managementDto;
    const skip = (page - 1) * limit;

    // Build query filter
    const filter: any = {};
    
    if (role) {
      filter.role = role;
    }

    if (status) {
      if (status === 'active') {
        filter.isActive = true;
        filter.isSuspended = { $ne: true };
      } else if (status === 'inactive') {
        filter.isActive = false;
      } else if (status === 'suspended') {
        filter.isSuspended = true;
      }
    }

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password -twoFactorSecret')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password -twoFactorSecret')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user statistics
    const [projectsCreated, projectsWorked, totalEarned, totalSpent, reviewsCount] = await Promise.all([
      this.projectModel.countDocuments({ clientId: new Types.ObjectId(userId) }),
      this.projectModel.countDocuments({ freelancerId: new Types.ObjectId(userId) }),
      this.calculateUserEarnings(userId),
      this.calculateUserSpending(userId),
      this.reviewModel.countDocuments({ revieweeId: new Types.ObjectId(userId) }),
    ]);

    return {
      user,
      statistics: {
        projectsCreated,
        projectsWorked,
        totalEarned,
        totalSpent,
        reviewsCount,
      },
    };
  }

  async performUserAction(userId: string, actionDto: UserActionDto, adminId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const admin = await this.userModel.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    switch (actionDto.action) {
      case 'suspend':
        user.isSuspended = true;
        user.suspendedAt = new Date();
        user.suspensionReason = actionDto.reason;
        break;

      case 'activate':
        user.isSuspended = false;
        user.suspendedAt = undefined;
        user.suspensionReason = undefined;
        user.isActive = true;
        break;

      case 'delete':
        user.isActive = false;
        user.deletedAt = new Date();
        user.deletionReason = actionDto.reason;
        break;

      case 'make_admin':
        user.role = 'admin';
        break;

      default:
        throw new ForbiddenException('Invalid action');
    }

    await user.save();

    this.logger.log(`Admin ${adminId} performed action ${actionDto.action} on user ${userId}`);

    return {
      message: `User ${actionDto.action} action completed successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isSuspended: user.isSuspended,
      },
    };
  }

  async getSystemHealth() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      activeConnections,
      recentErrors,
      storageUsage,
      databaseStats,
    ] = await Promise.all([
      this.getActiveConnections(),
      this.getRecentErrors(oneDayAgo),
      this.getStorageUsage(),
      this.getDatabaseStats(),
    ]);

    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeConnections,
      recentErrors,
      storage: storageUsage,
      database: databaseStats,
      timestamp: now,
    };
  }

  async getRecentActivity(limit: number = 50) {
    const [recentUsers, recentProjects, recentPayments] = await Promise.all([
      this.userModel
        .find({ isActive: true })
        .select('username email role createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .exec(),
      this.projectModel
        .find()
        .populate('clientId', 'username')
        .select('title status category budget createdAt clientId')
        .sort({ createdAt: -1 })
        .limit(10)
        .exec(),
      this.paymentModel
        .find()
        .populate('payerId payeeId', 'username')
        .select('amount status type createdAt payerId payeeId')
        .sort({ createdAt: -1 })
        .limit(10)
        .exec(),
    ]);

    return {
      recentUsers,
      recentProjects,
      recentPayments,
    };
  }

  private buildDateFilter(statsDto: AdminStatsDto) {
    const now = new Date();
    let startDate: Date;

    if (statsDto.startDate && statsDto.endDate) {
      return {
        $gte: new Date(statsDto.startDate),
        $lte: new Date(statsDto.endDate),
      };
    }

    switch (statsDto.dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { $gte: startDate };
  }

  private async calculateTotalRevenue(): Promise<number> {
    const result = await this.paymentModel.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
  }

  private async calculateRevenueForPeriod(dateFilter: any): Promise<number> {
    const result = await this.paymentModel.aggregate([
      { $match: { status: 'completed', createdAt: dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
  }

  private async calculateUserEarnings(userId: string): Promise<number> {
    const result = await this.paymentModel.aggregate([
      { 
        $match: { 
          payeeId: new Types.ObjectId(userId), 
          status: 'completed' 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
  }

  private async calculateUserSpending(userId: string): Promise<number> {
    const result = await this.paymentModel.aggregate([
      { 
        $match: { 
          payerId: new Types.ObjectId(userId), 
          status: 'completed' 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
  }

  private async getActiveConnections(): Promise<number> {
    // This would integrate with your WebSocket service to get active connections
    // For now, return a placeholder
    return 42;
  }

  private async getRecentErrors(since: Date): Promise<number> {
    // This would integrate with your logging system
    // For now, return a placeholder
    return 3;
  }

  private async getStorageUsage(): Promise<any> {
    const fileStats = await this.fileUploadModel.aggregate([
      { $group: { _id: null, totalSize: { $sum: '$size' }, count: { $sum: 1 } } },
    ]);

    return {
      files: fileStats[0]?.count || 0,
      totalSize: fileStats[0]?.totalSize || 0,
      formattedSize: this.formatBytes(fileStats[0]?.totalSize || 0),
    };
  }

  private async getDatabaseStats(): Promise<any> {
    const [userCount, projectCount, paymentCount, messageCount] = await Promise.all([
      this.userModel.countDocuments(),
      this.projectModel.countDocuments(),
      this.paymentModel.countDocuments(),
      this.messageModel.countDocuments(),
    ]);

    return {
      collections: {
        users: userCount,
        projects: projectCount,
        payments: paymentCount,
        messages: messageCount,
      },
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
