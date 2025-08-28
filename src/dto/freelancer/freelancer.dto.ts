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
  IsDateString,
  Matches
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

// =============== ONBOARDING DTOs ===============

// Professional Information DTOs
export class WorkingScheduleDto {
  @ApiProperty({ example: '09:00', description: 'Start time in HH:mm format' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in HH:mm format' })
  start: string;

  @ApiProperty({ example: '17:00', description: 'End time in HH:mm format' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in HH:mm format' })
  end: string;

  @ApiProperty({ example: true, description: 'Whether available on this day' })
  @IsBoolean()
  available: boolean;
}

export class WorkingHoursDto {
  @ApiProperty({ example: 'UTC-5', description: 'Timezone identifier' })
  @IsString()
  @Length(1, 50)
  timezone: string;

  @ApiProperty({ type: WorkingScheduleDto, description: 'Monday schedule' })
  @ValidateNested()
  @Type(() => WorkingScheduleDto)
  monday: WorkingScheduleDto;

  @ApiProperty({ type: WorkingScheduleDto, description: 'Tuesday schedule' })
  @ValidateNested()
  @Type(() => WorkingScheduleDto)
  tuesday: WorkingScheduleDto;

  @ApiProperty({ type: WorkingScheduleDto, description: 'Wednesday schedule' })
  @ValidateNested()
  @Type(() => WorkingScheduleDto)
  wednesday: WorkingScheduleDto;

  @ApiProperty({ type: WorkingScheduleDto, description: 'Thursday schedule' })
  @ValidateNested()
  @Type(() => WorkingScheduleDto)
  thursday: WorkingScheduleDto;

  @ApiProperty({ type: WorkingScheduleDto, description: 'Friday schedule' })
  @ValidateNested()
  @Type(() => WorkingScheduleDto)
  friday: WorkingScheduleDto;

  @ApiProperty({ type: WorkingScheduleDto, description: 'Saturday schedule' })
  @ValidateNested()
  @Type(() => WorkingScheduleDto)
  saturday: WorkingScheduleDto;

  @ApiProperty({ type: WorkingScheduleDto, description: 'Sunday schedule' })
  @ValidateNested()
  @Type(() => WorkingScheduleDto)
  sunday: WorkingScheduleDto;
}

export class CreateProfessionalProfileDto {
  @ApiProperty({ example: 'Senior Full-Stack Developer', description: 'Professional title' })
  @IsString()
  @Length(2, 100)
  title: string;

  @ApiProperty({ 
    example: 'Experienced full-stack developer with 5+ years of expertise in React, Node.js, and cloud technologies. Specialized in building scalable web applications and leading development teams.',
    description: 'Professional description/bio'
  })
  @IsString()
  @Length(50, 2000)
  description: string;

  @ApiProperty({ 
    example: 'expert', 
    enum: ['entry', 'intermediate', 'expert'],
    description: 'Experience level'
  })
  @IsEnum(['entry', 'intermediate', 'expert'])
  experience: string;

  @ApiProperty({ 
    example: 'available', 
    enum: ['available', 'busy', 'unavailable'],
    description: 'Current availability status'
  })
  @IsOptional()
  @IsEnum(['available', 'busy', 'unavailable'])
  availability?: string;

  @ApiProperty({ type: WorkingHoursDto, description: 'Working hours and schedule' })
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours: WorkingHoursDto;
}

// Skills DTOs
export class DetailedSkillDto {
  @ApiProperty({ example: 'React', description: 'Skill name' })
  @IsString()
  @Length(1, 50)
  name: string;

  @ApiProperty({ 
    example: 'advanced', 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    description: 'Skill proficiency level'
  })
  @IsEnum(['beginner', 'intermediate', 'advanced', 'expert'])
  level: string;

  @ApiProperty({ example: 3, minimum: 0, maximum: 50, description: 'Years of experience with this skill' })
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience: number;
}

export class CreateSkillsProfileDto {
  @ApiProperty({ 
    example: ['JavaScript', 'React', 'Node.js'],
    description: 'Primary skills (most important)'
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @Length(1, 50, { each: true })
  primary: string[];

  @ApiPropertyOptional({ 
    example: ['Docker', 'AWS', 'MongoDB'],
    description: 'Secondary skills (additional)'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(15)
  @Length(1, 50, { each: true })
  secondary?: string[];

  @ApiProperty({ 
    example: ['Web Development', 'Frontend Development'],
    description: 'Skill categories'
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  @Length(1, 50, { each: true })
  categories: string[];

  @ApiProperty({ 
    type: [DetailedSkillDto],
    description: 'Detailed skill information with proficiency levels'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetailedSkillDto)
  @ArrayMaxSize(20)
  detailed: DetailedSkillDto[];
}

// Language DTOs
export class CreateLanguageDto {
  @ApiProperty({ example: 'English', description: 'Language name' })
  @IsString()
  @Length(2, 50)
  name: string;

  @ApiProperty({ 
    example: 'fluent', 
    enum: ['native', 'fluent', 'conversational', 'basic'],
    description: 'Language proficiency level'
  })
  @IsEnum(['native', 'fluent', 'conversational', 'basic'])
  proficiency: string;
}

export class CreateLanguagesProfileDto {
  @ApiProperty({ 
    type: [CreateLanguageDto],
    description: 'Languages with proficiency levels'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLanguageDto)
  @ArrayMaxSize(10)
  languages: CreateLanguageDto[];
}

// Pricing DTOs
export class HourlyRateDto {
  @ApiProperty({ example: 25, minimum: 1, maximum: 10000, description: 'Minimum hourly rate' })
  @IsNumber()
  @Min(1)
  @Max(10000)
  min: number;

  @ApiProperty({ example: 50, minimum: 1, maximum: 10000, description: 'Maximum hourly rate' })
  @IsNumber()
  @Min(1)
  @Max(10000)
  max: number;

  @ApiProperty({ example: 'USD', enum: ['USD', 'LKR'], description: 'Currency' })
  @IsEnum(['USD', 'LKR'])
  currency: string;
}

export class FixedPricePackageDto {
  @ApiProperty({ example: 'Basic Website', description: 'Package title' })
  @IsString()
  @Length(2, 100)
  title: string;

  @ApiProperty({ example: 'Simple 5-page website with responsive design', description: 'Package description' })
  @IsString()
  @Length(10, 500)
  description: string;

  @ApiProperty({ example: 500, minimum: 1, description: 'Package price' })
  @IsNumber()
  @Min(1)
  price: number;

  @ApiProperty({ example: 7, minimum: 1, maximum: 365, description: 'Delivery time in days' })
  @IsNumber()
  @Min(1)
  @Max(365)
  deliveryDays: number;

  @ApiProperty({ example: 2, minimum: 0, maximum: 10, description: 'Number of included revisions' })
  @IsNumber()
  @Min(0)
  @Max(10)
  revisions: number;

  @ApiProperty({ 
    example: ['Responsive Design', 'SEO Optimization', 'Contact Form'],
    description: 'Package features'
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  features: string[];
}

export class CreatePricingProfileDto {
  @ApiPropertyOptional({ type: HourlyRateDto, description: 'Hourly rate range' })
  @IsOptional()
  @ValidateNested()
  @Type(() => HourlyRateDto)
  hourlyRate?: HourlyRateDto;

  @ApiPropertyOptional({ 
    type: [FixedPricePackageDto],
    description: 'Fixed price packages'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FixedPricePackageDto)
  @ArrayMaxSize(5)
  fixedPricePackages?: FixedPricePackageDto[];
}

// Education DTOs
export class CreateEducationDto {
  @ApiProperty({ example: 'University of Colombo', description: 'Institution name' })
  @IsString()
  @Length(2, 100)
  institution: string;

  @ApiProperty({ example: 'Bachelor of Science', description: 'Degree name' })
  @IsString()
  @Length(2, 100)
  degree: string;

  @ApiPropertyOptional({ example: 'Computer Science', description: 'Field of study' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  fieldOfStudy?: string;

  @ApiProperty({ example: 2018, minimum: 1950, maximum: 2030, description: 'Start year' })
  @IsNumber()
  @Min(1950)
  @Max(2030)
  startYear: number;

  @ApiPropertyOptional({ example: 2022, minimum: 1950, maximum: 2030, description: 'End year' })
  @IsOptional()
  @IsNumber()
  @Min(1950)
  @Max(2030)
  endYear?: number;

  @ApiPropertyOptional({ example: 'Graduated with First Class Honors', description: 'Additional description' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ example: false, description: 'Whether currently studying' })
  @IsBoolean()
  isCurrent: boolean;
}

// Certification DTOs
export class CreateCertificationDto {
  @ApiProperty({ example: 'AWS Certified Solutions Architect', description: 'Certification name' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ example: 'Amazon Web Services', description: 'Issuing organization' })
  @IsString()
  @Length(2, 100)
  issuingOrganization: string;

  @ApiPropertyOptional({ example: 'AWS-SAA-12345', description: 'Credential ID' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  credentialId?: string;

  @ApiPropertyOptional({ example: 'https://aws.amazon.com/verification', description: 'Credential verification URL' })
  @IsOptional()
  @IsUrl()
  credentialUrl?: string;

  @ApiProperty({ example: '2023-01-15', description: 'Issue date' })
  @IsDateString()
  issueDate: string;

  @ApiPropertyOptional({ example: '2026-01-15', description: 'Expiration date' })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({ example: 'Professional level certification', description: 'Additional description' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}

// Visibility Settings DTOs
export class UpdateVisibilityDto {
  @ApiProperty({ example: true, description: 'Whether profile appears in search results' })
  @IsBoolean()
  searchable: boolean;

  @ApiProperty({ example: true, description: 'Whether to show in client recommendations' })
  @IsBoolean()
  showInRecommendations: boolean;

  @ApiProperty({ example: true, description: 'Whether to show portfolio publicly' })
  @IsBoolean()
  showPortfolio: boolean;

  @ApiProperty({ example: true, description: 'Whether to show pricing information' })
  @IsBoolean()
  showRates: boolean;

  @ApiProperty({ example: true, description: 'Whether to show contact information' })
  @IsBoolean()
  showContactInfo: boolean;
}

// Complete Profile Creation DTO
export class CreateCompleteFreelancerProfileDto {
  @ApiProperty({ type: CreateProfessionalProfileDto, description: 'Professional information' })
  @ValidateNested()
  @Type(() => CreateProfessionalProfileDto)
  professional: CreateProfessionalProfileDto;

  @ApiProperty({ type: CreateSkillsProfileDto, description: 'Skills information' })
  @ValidateNested()
  @Type(() => CreateSkillsProfileDto)
  skills: CreateSkillsProfileDto;

  @ApiProperty({ type: CreateLanguagesProfileDto, description: 'Languages information' })
  @ValidateNested()
  @Type(() => CreateLanguagesProfileDto)
  languages: CreateLanguagesProfileDto;

  @ApiPropertyOptional({ type: CreatePricingProfileDto, description: 'Pricing information' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePricingProfileDto)
  pricing?: CreatePricingProfileDto;

  @ApiPropertyOptional({ type: UpdateVisibilityDto, description: 'Visibility settings' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateVisibilityDto)
  visibility?: UpdateVisibilityDto;
}

// Response DTOs
export class FreelancerProfileCompletionDto {
  @ApiProperty({ example: 75, minimum: 0, maximum: 100, description: 'Profile completion percentage' })
  completionPercentage: number;

  @ApiProperty({ 
    example: {
      professional: true,
      skills: true,
      languages: true,
      pricing: false,
      portfolio: false,
      education: false,
      certifications: false
    },
    description: 'Section completion status'
  })
  sectionsCompleted: {
    professional: boolean;
    skills: boolean;
    languages: boolean;
    pricing: boolean;
    portfolio: boolean;
    education: boolean;
    certifications: boolean;
  };

  @ApiProperty({ 
    example: ['Add pricing information', 'Upload portfolio items'],
    description: 'Suggestions for improving profile'
  })
  suggestions: string[];
}

export class CompleteFreelancerProfileResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Profile ID' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'User ID' })
  userId: string;

  @ApiProperty({ type: CreateProfessionalProfileDto, description: 'Professional information' })
  professional: any;

  @ApiProperty({ type: CreateSkillsProfileDto, description: 'Skills information' })
  skills: any;

  @ApiProperty({ type: CreateLanguagesProfileDto, description: 'Languages information' })
  languages: any;

  @ApiPropertyOptional({ type: CreatePricingProfileDto, description: 'Pricing information' })
  pricing?: any;

  @ApiProperty({ type: [PortfolioItemResponseDto], description: 'Portfolio items' })
  portfolio: PortfolioItemResponseDto[];

  @ApiPropertyOptional({ type: [CreateEducationDto], description: 'Education history' })
  education?: any[];

  @ApiPropertyOptional({ type: [CreateCertificationDto], description: 'Certifications' })
  certifications?: any[];

  @ApiProperty({ type: UpdateVisibilityDto, description: 'Visibility settings' })
  visibility: any;

  @ApiProperty({ example: 75, minimum: 0, maximum: 100, description: 'Profile completion percentage' })
  completionPercentage: number;

  @ApiProperty({ example: true, description: 'Whether profile is active' })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Profile creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-16T12:45:00.000Z', description: 'Profile last updated' })
  updatedAt: Date;
}