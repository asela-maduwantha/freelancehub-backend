import {
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: '60d5ec49f1b2c8b1f8e4e1a1' })
  @IsString()
  @IsMongoId()
  contractId: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(1)
  amount: number;
}

export class CreateEscrowPaymentDto {
  @ApiProperty({ example: '60d5ec49f1b2c8b1f8e4e1a1' })
  @IsString()
  @IsMongoId()
  contractId: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'Milestone payment for project completion' })
  @IsString()
  @Length(10, 500)
  description: string;
}

export class RefundPaymentDto {
  @ApiProperty({ example: 'Client requested refund due to incomplete work' })
  @IsString()
  @Length(10, 500)
  reason: string;
}

export class StripeWebhookDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  object: string;

  @ApiProperty()
  data: any;

  @ApiProperty()
  @IsString()
  type: string;
}
