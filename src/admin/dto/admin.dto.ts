import { IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class AdminStatsDto {
  @ApiProperty({ description: 'Date range filter', enum: ['today', 'week', 'month', 'year'], required: false })
  @IsOptional()
  @IsEnum(['today', 'week', 'month', 'year'])
  dateRange?: string;

  @ApiProperty({ description: 'Start date for custom range', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date for custom range', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UserManagementDto {
  @ApiProperty({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ description: 'User role filter', enum: ['client', 'freelancer', 'admin'], required: false })
  @IsOptional()
  @IsEnum(['client', 'freelancer', 'admin'])
  role?: string;

  @ApiProperty({ description: 'Account status filter', enum: ['active', 'inactive', 'suspended'], required: false })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @ApiProperty({ description: 'Search term for username or email', required: false })
  @IsOptional()
  search?: string;
}

export class UserActionDto {
  @ApiProperty({ description: 'Action to perform', enum: ['suspend', 'activate', 'delete', 'make_admin'] })
  @IsEnum(['suspend', 'activate', 'delete', 'make_admin'])
  action: string;

  @ApiProperty({ description: 'Reason for action', required: false })
  @IsOptional()
  reason?: string;
}
