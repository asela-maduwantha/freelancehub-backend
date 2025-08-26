import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  IsDateString,
  IsUrl,
  Length,
  Min,
  Max,
  ArrayMaxSize,
  ValidateNested,
  IsMongoId,
  IsObject
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectBudgetDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAmount?: number;

  @ApiPropertyOptional({ enum: ['USD', 'LKR'], example: 'USD' })
  @IsOptional()
  @IsEnum(['USD', 'LKR'])
  currency?: string;

  @ApiProperty({ enum: ['fixed', 'hourly'], example: 'fixed' })
  @IsEnum(['fixed', 'hourly'])
  type: string;
}

export class ProjectTimelineDto {
  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    const date = new Date(value);
    const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    return date > minDate ? value : undefined;
  })
  deadline?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFlexible?: boolean;
}

export class ProjectRequirementsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  mustHaveSkills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  niceToHaveSkills?: string[];

  @ApiPropertyOptional({ enum: ['entry', 'intermediate', 'expert'] })
  @IsOptional()
  @IsEnum(['entry', 'intermediate', 'expert'])
  experienceLevel?: string;

  @ApiPropertyOptional({ example: 4.5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  minimumRating?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumCompletedProjects?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  preferredLanguages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  preferredCountries?: string[];
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Build a Modern E-commerce Website' })
  @IsString()
  @Length(10, 150)
  @Transform(({ value }) => value.trim())
  title: string;

  @ApiProperty({ example: 'I need a modern, responsive e-commerce website built with React and Node.js...' })
  @IsString()
  @Length(100, 5000)
  @Transform(({ value }) => value.trim())
  description: string;

  @ApiProperty({ example: 'technology' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'web-development' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  subcategory?: string;

  @ApiProperty({ example: ['React', 'Node.js', 'MongoDB'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(15)
  @Transform(({ value }) => Array.isArray(value) ? value.filter(skill => skill && skill.length > 0) : [])
  requiredSkills: string[];

  @ApiProperty({ enum: ['fixed', 'hourly'], example: 'fixed' })
  @IsEnum(['fixed', 'hourly'])
  type: string;

  @ApiProperty({ type: ProjectBudgetDto })
  @ValidateNested()
  @Type(() => ProjectBudgetDto)
  budget: ProjectBudgetDto;

  @ApiPropertyOptional({ type: ProjectTimelineDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectTimelineDto)
  timeline?: ProjectTimelineDto;

  @ApiPropertyOptional({ type: ProjectRequirementsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectRequirementsDto)
  requirements?: ProjectRequirementsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  attachments?: string[];

  @ApiPropertyOptional({ enum: ['public', 'private'], example: 'public' })
  @IsOptional()
  @IsEnum(['public', 'private'])
  @Transform(({ value }) => value || 'public')
  visibility?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsMongoId({ each: true })
  invitedFreelancers?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  tags?: string[];
}

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(10, 150)
  @Transform(({ value }) => value?.trim())
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(100, 5000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(15)
  requiredSkills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectBudgetDto)
  budget?: ProjectBudgetDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectTimelineDto)
  timeline?: ProjectTimelineDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectRequirementsDto)
  requirements?: ProjectRequirementsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  attachments?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  tags?: string[];
}

export class SearchProjectsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  query?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  budget_min?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  budget_max?: number;

  @ApiPropertyOptional({ enum: ['fixed', 'hourly'] })
  @IsOptional()
  @IsEnum(['fixed', 'hourly'])
  type?: string;

  @ApiPropertyOptional({ enum: ['entry', 'intermediate', 'expert'] })
  @IsOptional()
  @IsEnum(['entry', 'intermediate', 'expert'])
  experience_level?: string;

  @ApiPropertyOptional({ enum: ['1d', '3d', '7d', '30d'] })
  @IsOptional()
  @IsEnum(['1d', '3d', '7d', '30d'])
  posted_within?: string;

  @ApiPropertyOptional({ enum: ['newest', 'budget_high', 'budget_low', 'relevance'] })
  @IsOptional()
  @IsEnum(['newest', 'budget_high', 'budget_low', 'relevance'])
  @Transform(({ value }) => value || 'relevance')
  sort?: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value) || 20)
  limit?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured_only?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  urgent_only?: boolean;
}

export class InviteFreelancersDto {
  @ApiProperty()
  @IsArray()
  @ArrayMaxSize(50)
  @IsMongoId({ each: true })
  freelancerIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(10, 500)
  message?: string;
}

export class ProjectStatusDto {
  @ApiProperty({ enum: ['draft', 'open', 'in_progress', 'completed', 'cancelled'] })
  @IsEnum(['draft', 'open', 'in_progress', 'completed', 'cancelled'])
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(10, 500)
  reason?: string;
}

export class PaginatedResponse<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNext: boolean;

  @ApiProperty()
  hasPrev: boolean;
}

export class ProjectFilterDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  budget?: {
    min?: number;
    max?: number;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  location?: {
    country?: string;
    city?: string;
  };

  @ApiPropertyOptional({ enum: ['fixed', 'hourly'] })
  @IsOptional()
  @IsEnum(['fixed', 'hourly'])
  projectType?: string;

  @ApiPropertyOptional({ enum: ['open', 'in_progress', 'completed', 'cancelled'] })
  @IsOptional()
  @IsEnum(['open', 'in_progress', 'completed', 'cancelled'])
  status?: string = 'open';

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class SubmitProposalDto {
  @ApiProperty({ example: 'I am excited to work on your project...' })
  @IsString()
  @Length(50, 2000)
  @Transform(({ value }) => value.trim())
  coverLetter: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(1)
  proposedBudget: number;

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  estimatedDuration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @ArrayMaxSize(5)
  portfolioLinks?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @ArrayMaxSize(3)
  attachments?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(10, 1000)
  additionalInfo?: string;
}
