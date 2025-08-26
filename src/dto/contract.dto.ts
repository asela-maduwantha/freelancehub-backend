import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  IsDateString,
  ValidateNested,
  Min,
  Max,
  Length,
  ArrayMinSize,
  ArrayMaxSize,
  IsBoolean,
  IsMongoId,
} from 'class-validator';

// Contract Terms DTO
export class ContractTermsDto {
  @ApiProperty({ description: 'Total contract amount', minimum: 1 })
  @IsNumber()
  @Min(1)
  totalAmount: number;

  @ApiProperty({ description: 'Currency', enum: ['USD', 'LKR'], default: 'USD' })
  @IsEnum(['USD', 'LKR'])
  currency: string = 'USD';

  @ApiProperty({ description: 'Payment type', enum: ['fixed', 'hourly'] })
  @IsEnum(['fixed', 'hourly'])
  paymentType: string;

  @ApiPropertyOptional({ description: 'Hourly rate if payment type is hourly' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'Estimated hours for hourly contracts' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedHours?: number;

  @ApiProperty({ description: 'Project scope description', maxLength: 2000 })
  @IsString()
  @Length(10, 2000)
  scope: string;

  @ApiProperty({ description: 'List of deliverables', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  deliverables: string[];

  @ApiPropertyOptional({ description: 'Project deadline' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({ description: 'Number of revisions allowed', minimum: 0, maximum: 10, default: 2 })
  @IsNumber()
  @Min(0)
  @Max(10)
  revisions: number = 2;

  @ApiPropertyOptional({ description: 'Additional contract terms', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  additionalTerms?: string;
}

// Milestone DTO
export class MilestoneDto {
  @ApiProperty({ description: 'Milestone title', maxLength: 100 })
  @IsString()
  @Length(1, 100)
  title: string;

  @ApiProperty({ description: 'Milestone description', maxLength: 1000 })
  @IsString()
  @Length(1, 1000)
  description: string;

  @ApiProperty({ description: 'Milestone amount', minimum: 1 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ description: 'Milestone due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ description: 'List of deliverables for this milestone', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  deliverables: string[];
}

// Create Contract DTO
export class CreateContractDto {
  @ApiProperty({ description: 'Project ID' })
  @IsString()
  @IsMongoId()
  projectId: string;

  @ApiProperty({ description: 'Freelancer ID' })
  @IsString()
  @IsMongoId()
  freelancerId: string;

  @ApiProperty({ description: 'Proposal ID' })
  @IsString()
  @IsMongoId()
  proposalId: string;

  @ApiProperty({ description: 'Contract terms', type: ContractTermsDto })
  @ValidateNested()
  @Type(() => ContractTermsDto)
  terms: ContractTermsDto;

  @ApiProperty({ description: 'Contract milestones', type: [MilestoneDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones: MilestoneDto[];
}

// Update Contract DTO
export class UpdateContractDto {
  @ApiPropertyOptional({ description: 'Contract terms', type: ContractTermsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContractTermsDto)
  terms?: ContractTermsDto;

  @ApiPropertyOptional({ description: 'Contract milestones', type: [MilestoneDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones?: MilestoneDto[];

  @ApiPropertyOptional({ description: 'Contract deadline' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// Milestone Submission DTO
export class SubmitMilestoneDto {
  @ApiProperty({ description: 'Submission files/attachments', type: [String] })
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  files: string[];

  @ApiProperty({ description: 'Submission notes', maxLength: 1000 })
  @IsString()
  @Length(1, 1000)
  notes: string;
}

// Milestone Review DTO
export class ReviewMilestoneDto {
  @ApiProperty({ description: 'Approval status', enum: ['approved', 'rejected'] })
  @IsEnum(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @ApiProperty({ description: 'Feedback on the submission', maxLength: 1000 })
  @IsString()
  @Length(1, 1000)
  feedback: string;

  @ApiPropertyOptional({ description: 'Rejection reason if status is rejected', maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  rejectionReason?: string;
}

// Contract Modification DTO
export class ContractModificationDto {
  @ApiProperty({ description: 'Type of modification', enum: ['scope_change', 'timeline_extension', 'budget_increase', 'milestone_addition'] })
  @IsEnum(['scope_change', 'timeline_extension', 'budget_increase', 'milestone_addition'])
  type: string;

  @ApiProperty({ description: 'Description of the modification', maxLength: 1000 })
  @IsString()
  @Length(1, 1000)
  description: string;

  @ApiPropertyOptional({ description: 'Previous value (for reference)' })
  @IsOptional()
  previousValue?: any;

  @ApiProperty({ description: 'New value' })
  newValue: any;
}

// Contract Status Update DTO
export class UpdateContractStatusDto {
  @ApiProperty({ description: 'New contract status', enum: ['draft', 'active', 'completed', 'cancelled', 'disputed', 'paused'] })
  @IsEnum(['draft', 'active', 'completed', 'cancelled', 'disputed', 'paused'])
  status: string;

  @ApiPropertyOptional({ description: 'Reason for status change', maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string;
}

// Contract Search/Filter DTO
export class SearchContractsDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: ['draft', 'active', 'completed', 'cancelled', 'disputed', 'paused'] })
  @IsOptional()
  @IsEnum(['draft', 'active', 'completed', 'cancelled', 'disputed', 'paused'])
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by project category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by date range start' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by date range end' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort by field', enum: ['createdAt', 'totalAmount', 'status', 'deadline'] })
  @IsOptional()
  @IsEnum(['createdAt', 'totalAmount', 'status', 'deadline'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

// Response DTOs
export class ContractResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  freelancerId: string;

  @ApiProperty()
  proposalId: string;

  @ApiProperty()
  terms: ContractTermsDto;

  @ApiProperty({ type: [MilestoneDto] })
  milestones: MilestoneDto[];

  @ApiProperty()
  currentMilestone: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiPropertyOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  endDate?: Date;
}

export class MilestoneResponseDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  dueDate?: Date;

  @ApiProperty({ type: [String] })
  deliverables: string[];

  @ApiPropertyOptional()
  submissions?: any[];

  @ApiPropertyOptional()
  feedback?: string;

  @ApiPropertyOptional()
  approvedAt?: Date;

  @ApiPropertyOptional()
  rejectedAt?: Date;

  @ApiPropertyOptional()
  rejectionReason?: string;
}

export class PaginatedContractsResponseDto {
  @ApiProperty({ type: [ContractResponseDto] })
  contracts: ContractResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
