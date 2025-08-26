import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  ValidationPipe,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentsService } from './payments.service';

interface CreatePaymentIntentDto {
  contractId: string;
  amount: number;
}

interface CreateEscrowPaymentDto {
  contractId: string;
  amount: number;
  description: string;
}

interface RefundPaymentDto {
  reason: string;
}

@ApiTags('Payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent for contract payment' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Payment intent created successfully' })
  async createPaymentIntent(
    @Body(ValidationPipe) createPaymentDto: CreatePaymentIntentDto,
    @Request() req: any,
  ) {
    return this.paymentsService.createPaymentIntent(
      createPaymentDto.contractId,
      createPaymentDto.amount,
      req.user.id,
    );
  }

  @Post('confirm/:paymentIntentId')
  @ApiOperation({ summary: 'Confirm payment completion' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment confirmed successfully' })
  async confirmPayment(@Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.confirmPayment(paymentIntentId);
  }

  @Post('escrow')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create escrow payment' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Escrow payment created successfully' })
  async createEscrowPayment(
    @Body(ValidationPipe) escrowPaymentDto: CreateEscrowPaymentDto,
    @Request() req: any,
  ) {
    return this.paymentsService.createEscrowPayment(
      escrowPaymentDto.contractId,
      escrowPaymentDto.amount,
      escrowPaymentDto.description,
      req.user.id,
    );
  }

  @Post('escrow/:paymentId/release')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release escrow payment to freelancer' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Escrow payment released successfully' })
  async releaseEscrowPayment(
    @Param('paymentId') paymentId: string,
    @Request() req: any,
  ) {
    return this.paymentsService.releaseEscrowPayment(paymentId, req.user.id);
  }

  @Post(':paymentId/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment refunded successfully' })
  async refundPayment(
    @Param('paymentId') paymentId: string,
    @Body(ValidationPipe) refundDto: RefundPaymentDto,
    @Request() req: any,
  ) {
    return this.paymentsService.refundPayment(paymentId, refundDto.reason, req.user.id);
  }

  @Get('contract/:contractId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history for a contract' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment history retrieved successfully' })
  async getPaymentHistory(
    @Param('contractId') contractId: string,
    @Request() req: any,
  ) {
    return this.paymentsService.getPaymentHistory(contractId, req.user.id);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user payments (client or freelancer)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User payments retrieved successfully' })
  async getUserPayments(@Request() req: any) {
    const role = req.user.roles.includes('client') ? 'client' : 'freelancer';
    return this.paymentsService.getUserPayments(req.user.id, role);
  }

  @Post('connected-account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('freelancer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe connected account for freelancer' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Connected account created successfully' })
  async createConnectedAccount(@Request() req: any) {
    return this.paymentsService.createConnectedAccount(req.user.id);
  }

  @Get('account-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('freelancer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Stripe account status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Account status retrieved successfully' })
  async getAccountStatus(@Request() req: any) {
    return this.paymentsService.getAccountStatus(req.user.id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing request body');
    }
    return this.paymentsService.handleStripeWebhook(signature, req.rawBody);
  }
}
