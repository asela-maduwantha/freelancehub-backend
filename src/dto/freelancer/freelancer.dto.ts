import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  IsUrl,
  Length,
  Min,
  Max,
  ArrayMaxSize,
  ValidateNested,
  IsMongoId,
  IsObject,
  IsDateString
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, ApiResponse } from '@nestjs/swagger';

// Query DTOs
export class PaginationDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number = 10;
}

export class EarningsQueryDto {
  @ApiPropertyOptional({ 
    enum: ['daily', 'weekly', 'monthly', 'yearly'], 
    example: 'monthly',
    description: 'Time period for earnings report'
  })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'yearly'])
  period?: string = 'monthly';

  @ApiPropertyOptional({ example: 2024, minimum: 2020 })
  @IsOptional()
  @IsNumber()
  @Min(2020)
  @Max(new Date().getFullYear() + 1)
  @Transform(({ value }) => parseInt(value))
  year?: number;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 12 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  @Transform(({ value }) => parseInt(value))
  month?: number;
}

export class PaymentHistoryQueryDto extends PaginationDto {
  @ApiPropertyOptional({ 
    enum: ['pending', 'completed', 'failed'], 
    example: 'completed',
    description: 'Filter by payment status'
  })
  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed'])
  status?: string;
}

export class ActivityFeedQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number = 10;
}

// Request DTOs
export class PayoutRequestDto {
  @ApiProperty({ example: 500, minimum: 1 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ 
    example: 'paypal',
    description: 'Payment method for payout (paypal, bank_transfer, etc.)'
  })
  @IsString()
  @Length(2, 50)
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'john.doe@paypal.com' })
  @IsOptional()
  @IsString()
  @Length(5, 100)
  paymentDetails?: string;
}

export class FreelancerProfileUpdateDto {
  @ApiPropertyOptional({ 
    example: 'Experienced full-stack developer with 5+ years in React and Node.js',
    description: 'Professional bio'
  })
  @IsOptional()
  @IsString()
  @Length(10, 1000)
  bio?: string;

  @ApiPropertyOptional({ example: 50, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  hourlyRate?: number;

  @ApiPropertyOptional({ 
    example: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    description: 'Array of skills'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  skills?: string[];

  @ApiPropertyOptional({ 
    enum: ['available', 'busy', 'unavailable'], 
    example: 'available'
  })
  @IsOptional()
  @IsEnum(['available', 'busy', 'unavailable'])
  availability?: string;

  @ApiPropertyOptional({ 
    example: 'Senior Full-Stack Developer',
    description: 'Professional title'
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  title?: string;

  @ApiPropertyOptional({ 
    example: 'senior',
    enum: ['entry', 'intermediate', 'senior', 'expert']
  })
  @IsOptional()
  @IsEnum(['entry', 'intermediate', 'senior', 'expert'])
  experience?: string;

  @ApiPropertyOptional({ 
    example: ['English', 'Spanish'],
    description: 'Languages spoken'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  languages?: string[];

  @ApiPropertyOptional({ example: 'UTC-5' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class PortfolioLinkDto {
  @ApiProperty({ example: 'github', enum: ['github', 'behance', 'dribbble', 'website', 'demo'] })
  @IsString()
  @IsEnum(['github', 'behance', 'dribbble', 'website', 'demo'])
  type: string;

  @ApiProperty({ example: 'https://github.com/username/project' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ example: 'Project Repository' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  label?: string;
}

export class PortfolioItemDto {
  @ApiProperty({ 
    example: 'E-commerce Dashboard',
    description: 'Portfolio item title'
  })
  @IsString()
  @Length(2, 100)
  title: string;

  @ApiProperty({ 
    example: 'A comprehensive dashboard for managing e-commerce operations...',
    description: 'Detailed description of the project'
  })
  @IsString()
  @Length(10, 2000)
  description: string;

  @ApiProperty({ 
    example: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
    description: 'Technologies used in the project'
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(15)
  technologies: string[];

  @ApiPropertyOptional({ 
    example: ['https://example.com/image1.jpg'],
    description: 'Array of image URLs'
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @ArrayMaxSize(10)
  images?: string[];

  @ApiPropertyOptional({ 
    type: [PortfolioLinkDto],
    description: 'External links for the project'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortfolioLinkDto)
  @ArrayMaxSize(5)
  links?: PortfolioLinkDto[];

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({ 
    example: 'client',
    enum: ['personal', 'client', 'open-source', 'freelance']
  })
  @IsOptional()
  @IsEnum(['personal', 'client', 'open-source', 'freelance'])
  projectType?: string;
}

// Response DTOs
export class FreelancerStatsDto {
  @ApiProperty({ example: 42 })
  activeProjects: number;

  @ApiProperty({ example: 15 })
  pendingProposals: number;

  @ApiProperty({ example: 12500.50 })
  totalEarnings: number;

  @ApiProperty({ example: 89 })
  profileViews: number;

  @ApiProperty({ example: 28 })
  completedProjects: number;

  @ApiProperty({ example: 95 })
  successRate: number;
}

export class ActivityItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'proposal', enum: ['proposal', 'contract', 'payment', 'message'] })
  type: string;

  @ApiProperty({ example: 'Submitted proposal for "Build E-commerce Website"' })
  action: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  date: Date;

  @ApiPropertyOptional({ example: 'pending' })
  status?: string;

  @ApiPropertyOptional({ example: 1500 })
  amount?: number;
}

export class UpcomingDeadlineDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'Build E-commerce Website' })
  projectTitle: string;

  @ApiProperty({ example: '2024-02-15T00:00:00.000Z' })
  deadline: Date;

  @ApiProperty({ example: 7 })
  daysLeft: number;
}

export class RecentMessageDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'John Smith' })
  senderName: string;

  @ApiProperty({ example: 'Project update and questions' })
  subject: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  timestamp: Date;

  @ApiProperty({ example: false })
  isRead: boolean;
}

export class FreelancerDashboardDto {
  @ApiProperty({ type: FreelancerStatsDto })
  stats: FreelancerStatsDto;

  @ApiProperty({ type: [ActivityItemDto] })
  recentActivity: ActivityItemDto[];

  @ApiProperty({ type: [UpcomingDeadlineDto] })
  upcomingDeadlines: UpcomingDeadlineDto[];

  @ApiProperty({ type: [RecentMessageDto] })
  recentMessages: RecentMessageDto[];
}

export class EarningsPeriodDto {
  @ApiProperty({ example: 1 })
  year: number;

  @ApiProperty({ example: 3 })
  month: number;

  @ApiProperty({ example: 15 })
  day: number;
}

export class EarningsDataDto {
  @ApiProperty({ type: EarningsPeriodDto })
  _id: EarningsPeriodDto;

  @ApiProperty({ example: 2500.00 })
  totalAmount: number;

  @ApiProperty({ example: 3 })
  count: number;
}

export class EarningsResponseDto {
  @ApiProperty({ example: 'monthly' })
  period: string;

  @ApiProperty({ example: 2024 })
  year: number;

  @ApiPropertyOptional({ example: 3 })
  month?: number;

  @ApiProperty({ type: [EarningsDataDto] })
  earnings: EarningsDataDto[];

  @ApiProperty({ example: 12500.50 })
  totalEarnings: number;

  @ApiProperty({ example: 8 })
  totalTransactions: number;
}

export class PaymentHistoryItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ example: 1500.00 })
  amount: number;

  @ApiProperty({ example: 'completed' })
  status: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 'Build E-commerce Website' })
  projectTitle: string;

  @ApiProperty({ example: 'John Smith' })
  clientName: string;
}

export class PaymentHistoryResponseDto {
  @ApiProperty({ type: [PaymentHistoryItemDto] })
  payments: PaymentHistoryItemDto[];

  @ApiProperty({ example: 45 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class PayoutResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Payout requested successfully' })
  message: string;

  @ApiProperty({
    type: 'object',
    properties: {
      freelancerId: { type: 'string' },
      amount: { type: 'number' },
      paymentMethod: { type: 'string' },
      status: { type: 'string' },
      requestedAt: { type: 'string', format: 'date-time' }
    }
  })
  payoutRequest: {
    freelancerId: string;
    amount: number;
    paymentMethod: string;
    status: string;
    requestedAt: Date;
  };
}

export class PortfolioItemResponseDto extends PortfolioItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}

export class ActiveProjectDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    type: 'object',
    properties: {
      _id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      budget: { type: 'object' },
      deadline: { type: 'string', format: 'date-time' }
    }
  })
  projectId: {
    _id: string;
    title: string;
    description: string;
    budget: any;
    deadline: Date;
  };

  @ApiProperty({
    type: 'object',
    properties: {
      _id: { type: 'string' },
      username: { type: 'string' },
      profile: { type: 'object' }
    }
  })
  clientId: {
    _id: string;
    username: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

export class BookmarkedProjectDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ example: 'Build E-commerce Website' })
  title: string;

  @ApiProperty({ example: 'A modern e-commerce platform...' })
  description: string;

  @ApiProperty({ example: 2500 })
  budget: any;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    type: 'object',
    properties: {
      _id: { type: 'string' },
      username: { type: 'string' },
      profile: { type: 'object' }
    }
  })
  clientId: {
    _id: string;
    username: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

export class BookmarkedProjectsResponseDto {
  @ApiProperty({ type: [BookmarkedProjectDto] })
  projects: BookmarkedProjectDto[];

  @ApiProperty({ example: 15 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 2 })
  totalPages: number;
}

export class DetailedFreelancerStatsDto {
  @ApiProperty({ example: 45 })
  totalProposals: number;

  @ApiProperty({ example: 32 })
  acceptedProposals: number;

  @ApiProperty({ example: 71 })
  proposalAcceptanceRate: number;

  @ApiProperty({ example: 25500.75 })
  totalEarnings: number;

  @ApiProperty({ example: 1250 })
  averageProjectValue: number;

  @ApiProperty({ example: 28 })
  completedProjects: number;

  @ApiProperty({ example: 5 })
  ongoingProjects: number;

  @ApiProperty({ example: 12 })
  totalClients: number;

  @ApiProperty({ example: '2023-03-15T10:30:00.000Z' })
  joinDate: Date;
}
