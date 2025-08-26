import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Roles } from '../modules/auth/decorators/roles.decorator';
import { AdminStatsDto, UserManagementDto, UserActionDto } from './dto/admin.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard statistics retrieved successfully' })
  async getDashboardStats(@Query() statsDto: AdminStatsDto) {
    const stats = await this.adminService.getDashboardStats(statsDto);
    
    return {
      message: 'Dashboard statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: ['client', 'freelancer', 'admin'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'suspended'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users retrieved successfully' })
  async getUsers(@Query() managementDto: UserManagementDto) {
    const result = await this.adminService.getUsers(managementDto);
    
    return {
      message: 'Users retrieved successfully',
      ...result,
    };
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get detailed user information' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User details retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async getUserDetails(@Param('userId') userId: string) {
    const result = await this.adminService.getUserDetails(userId);
    
    return {
      message: 'User details retrieved successfully',
      ...result,
    };
  }

  @Post('users/:userId/action')
  @ApiOperation({ summary: 'Perform action on user (suspend, activate, delete, make_admin)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User action completed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Admin access required' })
  async performUserAction(
    @Param('userId') userId: string,
    @Body() actionDto: UserActionDto,
    @Request() req: any,
  ) {
    const result = await this.adminService.performUserAction(userId, actionDto, req.user.sub);
    
    return result;
  }

  @Get('system/health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'System health retrieved successfully' })
  async getSystemHealth() {
    const health = await this.adminService.getSystemHealth();
    
    return {
      message: 'System health retrieved successfully',
      ...health,
    };
  }

  @Get('activity/recent')
  @ApiOperation({ summary: 'Get recent platform activity' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items to retrieve' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Recent activity retrieved successfully' })
  async getRecentActivity(@Query('limit') limit?: number) {
    const activity = await this.adminService.getRecentActivity(limit);
    
    return {
      message: 'Recent activity retrieved successfully',
      data: activity,
    };
  }

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get platform analytics overview' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Analytics overview retrieved successfully' })
  async getAnalyticsOverview(@Query() statsDto: AdminStatsDto) {
    const stats = await this.adminService.getDashboardStats(statsDto);
    
    return {
      message: 'Analytics overview retrieved successfully',
      analytics: {
        userGrowth: stats.growth.newUsers,
        projectGrowth: stats.growth.newProjects,
        revenueGrowth: stats.growth.revenue,
        conversionRate: this.calculateConversionRate(stats),
        avgProjectValue: this.calculateAvgProjectValue(stats),
        platformHealth: 'excellent',
      },
      trends: stats.distribution,
    };
  }

  @Get('reports/summary')
  @ApiOperation({ summary: 'Get comprehensive platform summary report' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Summary report retrieved successfully' })
  async getSummaryReport(@Query() statsDto: AdminStatsDto) {
    const [stats, activity, health] = await Promise.all([
      this.adminService.getDashboardStats(statsDto),
      this.adminService.getRecentActivity(10),
      this.adminService.getSystemHealth(),
    ]);

    return {
      message: 'Summary report retrieved successfully',
      report: {
        generatedAt: new Date(),
        period: statsDto.dateRange || 'default',
        overview: stats.overview,
        growth: stats.growth,
        recentActivity: activity,
        systemHealth: {
          status: health.status,
          uptime: health.uptime,
          activeConnections: health.activeConnections,
          recentErrors: health.recentErrors,
        },
        recommendations: this.generateRecommendations(stats),
      },
    };
  }

  private calculateConversionRate(stats: any): number {
    const { totalUsers, totalProjects } = stats.overview;
    return totalUsers > 0 ? Math.round((totalProjects / totalUsers) * 100) : 0;
  }

  private calculateAvgProjectValue(stats: any): number {
    const { totalProjects, totalRevenue } = stats.overview;
    return totalProjects > 0 ? Math.round(totalRevenue / totalProjects) : 0;
  }

  private generateRecommendations(stats: any): string[] {
    const recommendations: string[] = [];
    
    const { growth, overview } = stats;
    
    if (growth.newUsers < 10) {
      recommendations.push('Consider implementing user acquisition campaigns to increase new user registrations');
    }
    
    if (growth.newProjects < 5) {
      recommendations.push('Focus on encouraging existing users to post more projects through incentives');
    }
    
    if (overview.activeUsers / overview.totalUsers < 0.3) {
      recommendations.push('Implement user engagement strategies to increase platform activity');
    }
    
    if (growth.revenue < 1000) {
      recommendations.push('Review pricing strategy and consider value-added services to increase revenue');
    }
    
    return recommendations.length > 0 ? recommendations : ['Platform performance is strong across all metrics'];
  }
}
