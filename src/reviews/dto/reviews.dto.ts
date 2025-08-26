import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, IsObject, IsMongoId, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewCriteriaDto {
  @ApiPropertyOptional({ description: 'Communication rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  communication?: number;

  @ApiPropertyOptional({ description: 'Quality rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  quality?: number;

  @ApiPropertyOptional({ description: 'Timeliness rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  timeliness?: number;

  @ApiPropertyOptional({ description: 'Professionalism rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  professionalism?: number;

  @ApiPropertyOptional({ description: 'Value for money rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  valueForMoney?: number;

  @ApiPropertyOptional({ description: 'Would recommend' })
  @IsOptional()
  @IsBoolean()
  wouldRecommend?: boolean;
}

export class CreateReviewDto {
  @ApiProperty({ description: 'ID of the user being reviewed' })
  @IsMongoId()
  revieweeId: string;

  @ApiProperty({ description: 'Project ID this review is for' })
  @IsMongoId()
  projectId: string;

  @ApiPropertyOptional({ description: 'Contract ID if applicable' })
  @IsOptional()
  @IsMongoId()
  contractId?: string;

  @ApiProperty({ description: 'Overall rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ 
    description: 'Review comment', 
    minLength: 10, 
    maxLength: 2000 
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  comment: string;

  @ApiProperty({ 
    description: 'Type of review',
    enum: ['client_to_freelancer', 'freelancer_to_client']
  })
  @IsEnum(['client_to_freelancer', 'freelancer_to_client'])
  reviewType: string;

  @ApiPropertyOptional({ 
    description: 'Detailed criteria ratings',
    type: ReviewCriteriaDto
  })
  @IsOptional()
  @IsObject()
  criteria?: ReviewCriteriaDto;

  @ApiPropertyOptional({ 
    description: 'Review tags',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Make review public' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: {
    projectTitle?: string;
    projectCategory?: string;
    projectBudget?: number;
    contractDuration?: number;
    completionDate?: string;
  };
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: 'Updated overall rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Updated review comment' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  comment?: string;

  @ApiPropertyOptional({ description: 'Updated criteria ratings' })
  @IsOptional()
  @IsObject()
  criteria?: ReviewCriteriaDto;

  @ApiPropertyOptional({ description: 'Updated review tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Update public visibility' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class ReviewResponseDto {
  @ApiProperty({ description: 'Response comment' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  comment: string;
}

export class ReviewQueryDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by reviewee ID' })
  @IsOptional()
  @IsMongoId()
  revieweeId?: string;

  @ApiPropertyOptional({ description: 'Filter by reviewer ID' })
  @IsOptional()
  @IsMongoId()
  reviewerId?: string;

  @ApiPropertyOptional({ description: 'Filter by project ID' })
  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Filter by review type' })
  @IsOptional()
  @IsEnum(['client_to_freelancer', 'freelancer_to_client'])
  reviewType?: string;

  @ApiPropertyOptional({ description: 'Minimum rating filter' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Maximum rating filter' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  maxRating?: number;

  @ApiPropertyOptional({ description: 'Only show public reviews' })
  @IsOptional()
  @IsBoolean()
  publicOnly?: boolean;

  @ApiPropertyOptional({ description: 'Only show featured reviews' })
  @IsOptional()
  @IsBoolean()
  featuredOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter by tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class ReportReviewDto {
  @ApiProperty({ 
    description: 'Reason for reporting',
    enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other']
  })
  @IsEnum(['inappropriate', 'spam', 'fake', 'offensive', 'other'])
  reason: string;

  @ApiPropertyOptional({ description: 'Additional comment about the report' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
