import { IsEnum, IsOptional, IsString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({ description: 'File category', enum: ['avatar', 'project_attachment', 'message_attachment', 'document'] })
  @IsEnum(['avatar', 'project_attachment', 'message_attachment', 'document'])
  category: string;

  @ApiProperty({ description: 'Related entity ID', required: false })
  @IsOptional()
  @IsMongoId()
  relatedTo?: string;

  @ApiProperty({ description: 'Related entity model', enum: ['Project', 'Message', 'User'], required: false })
  @IsOptional()
  @IsEnum(['Project', 'Message', 'User'])
  onModel?: string;
}

export class FileFilterDto {
  @ApiProperty({ description: 'File category filter', required: false })
  @IsOptional()
  @IsEnum(['avatar', 'project_attachment', 'message_attachment', 'document'])
  category?: string;

  @ApiProperty({ description: 'Related entity ID filter', required: false })
  @IsOptional()
  @IsMongoId()
  relatedTo?: string;

  @ApiProperty({ description: 'File type filter', required: false })
  @IsOptional()
  @IsString()
  mimetype?: string;
}
