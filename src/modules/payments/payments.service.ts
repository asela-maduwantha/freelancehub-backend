import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { Payment, PaymentDocument } from '../../schemas/payment.schema';
import { Contract, ContractDocument } from '../../schemas/contract.schema';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('stripe.secretKey');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2025-02-24.acacia',
      });
    } else {
      console.warn('Stripe secret key not configured. Payment functionality will be disabled.');
    }
  }

  async createPaymentIntent(
    contractId: string,
    amount: number,
    userId: string,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Payment processing is not configured');
    }
    const contract = await this.contractModel
      .findById(contractId)
      .populate('clientId freelancerId')
      .exec();

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.clientId.toString() !== userId) {
      throw new ForbiddenException('You can only make payments for your own contracts');
    }

    if (contract.status !== 'active') {
      throw new BadRequestException('Contract must be active to make payments');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          contractId: contractId,
          clientId: userId,
          freelancerId: contract.freelancerId.toString(),
        },
        application_fee_amount: Math.round(amount * 0.05 * 100), // 5% platform fee
        transfer_data: {
          destination: await this.getFreelancerStripeAccount(contract.freelancerId.toString()),
        },
      });

      // Create payment record
      const payment = new this.paymentModel({
        contractId: new Types.ObjectId(contractId),
        amount: amount,
        platformFee: amount * 0.05,
        stripeFee: amount * 0.029 + 0.30, // Stripe fees
        freelancerAmount: amount * 0.95 - (amount * 0.029 + 0.30),
        currency: 'USD',
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
        type: 'milestone_release',
        initiatedBy: new Types.ObjectId(userId),
      });

      await payment.save();

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<{ success: boolean }> {
    if (!this.stripe) {
      throw new BadRequestException('Payment processing is not configured');
    }
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
      // Update payment record
      await this.paymentModel.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        {
          status: 'succeeded',
          processedAt: new Date(),
          stripeChargeId: paymentIntent.latest_charge as string,
        },
      );        // Update contract with payment info
        const contractId = paymentIntent.metadata.contractId;
        await this.contractModel.findByIdAndUpdate(contractId, {
          $inc: { 'financials.totalPaid': paymentIntent.amount / 100 },
          $push: {
            paymentHistory: {
              amount: paymentIntent.amount / 100,
              paidAt: new Date(),
              paymentId: paymentIntentId,
            },
          },
        });

        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      throw new BadRequestException('Failed to confirm payment');
    }
  }

  async createEscrowPayment(
    contractId: string,
    amount: number,
    description: string,
    userId: string,
  ): Promise<{ paymentId: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Payment processing is not configured');
    }
    const contract = await this.contractModel.findById(contractId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.clientId.toString() !== userId) {
      throw new ForbiddenException('You can only create escrow payments for your own contracts');
    }

    try {
      // Create Stripe payment intent for escrow
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        capture_method: 'manual', // Hold the payment
        metadata: {
          contractId: contractId,
          type: 'escrow',
          description: description,
        },
      });

      // Create escrow payment record
      const payment = new this.paymentModel({
        contractId: new Types.ObjectId(contractId),
        amount: amount,
        platformFee: amount * 0.05,
        stripeFee: amount * 0.029 + 0.30,
        freelancerAmount: amount * 0.95 - (amount * 0.029 + 0.30),
        currency: 'USD',
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
        type: 'escrow_funding',
        description: description,
        initiatedBy: new Types.ObjectId(userId),
      });

      await payment.save();

      return { paymentId: (payment._id as string).toString() };
    } catch (error) {
      console.error('Escrow payment creation failed:', error);
      throw new BadRequestException('Failed to create escrow payment');
    }
  }

  async releaseEscrowPayment(paymentId: string, userId: string): Promise<{ success: boolean }> {
    const payment = await this.paymentModel.findById(paymentId).populate('contractId');

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const contract = payment.contractId as any;
    if (contract.clientId.toString() !== userId) {
      throw new ForbiddenException('You can only release your own escrow payments');
    }

    if (payment.status !== 'pending') {
      throw new BadRequestException('Payment is not in pending status');
    }

    try {
      // Capture the payment intent
      await this.stripe.paymentIntents.capture(payment.stripePaymentIntentId);

      // Transfer to freelancer
      const freelancerAccount = await this.getFreelancerStripeAccount(contract.freelancerId.toString());
      
      await this.stripe.transfers.create({
        amount: Math.round(payment.freelancerAmount * 100),
        currency: 'usd',
        destination: freelancerAccount,
        metadata: {
          paymentId: paymentId,
          contractId: payment.contractId.toString(),
        },
      });

      // Update payment status
      await this.paymentModel.findByIdAndUpdate(paymentId, {
        status: 'succeeded',
        processedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error('Escrow release failed:', error);
      throw new BadRequestException('Failed to release escrow payment');
    }
  }

  async refundPayment(paymentId: string, reason: string, userId: string): Promise<{ success: boolean }> {
    const payment = await this.paymentModel.findById(paymentId).populate('contractId');

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const contract = payment.contractId as any;
    if (contract.clientId.toString() !== userId) {
      throw new ForbiddenException('You can only refund your own payments');
    }

    if (payment.status !== 'succeeded' && payment.status !== 'pending') {
      throw new BadRequestException('Payment cannot be refunded');
    }

    try {
      let refund;
      
      if (payment.stripeChargeId) {
        // Refund completed payment
        refund = await this.stripe.refunds.create({
          charge: payment.stripeChargeId,
          reason: 'requested_by_customer',
          metadata: {
            paymentId: paymentId,
            reason: reason,
          },
        });
      } else {
        // Cancel payment intent for escrowed payment
        await this.stripe.paymentIntents.cancel(payment.stripePaymentIntentId);
      }

      // Update payment status
      await this.paymentModel.findByIdAndUpdate(paymentId, {
        status: 'refunded',
        refundedAt: new Date(),
        refundReason: reason,
        stripeRefundId: refund?.id,
      });

      return { success: true };
    } catch (error) {
      console.error('Payment refund failed:', error);
      throw new BadRequestException('Failed to refund payment');
    }
  }

  async getPaymentHistory(contractId: string, userId: string): Promise<Payment[]> {
    const contract = await this.contractModel.findById(contractId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Allow both client and freelancer to view payment history
    if (contract.clientId.toString() !== userId && contract.freelancerId.toString() !== userId) {
      throw new ForbiddenException('You can only view payment history for your own contracts');
    }

    return this.paymentModel
      .find({ contractId: new Types.ObjectId(contractId) })
      .populate('contractId', 'terms.projectTitle clientId freelancerId')
      .populate('initiatedBy', 'username email profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUserPayments(userId: string, role: 'client' | 'freelancer'): Promise<Payment[]> {
    // Get contracts for the user
    const contractQuery = role === 'client' 
      ? { clientId: new Types.ObjectId(userId) }
      : { freelancerId: new Types.ObjectId(userId) };

    const contracts = await this.contractModel.find(contractQuery).select('_id');
    const contractIds = contracts.map(c => c._id);

    return this.paymentModel
      .find({ contractId: { $in: contractIds } })
      .populate('contractId', 'terms.projectTitle clientId freelancerId')
      .populate('initiatedBy', 'username email profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async handleStripeWebhook(signature: string, payload: Buffer): Promise<{ received: boolean }> {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'transfer.created':
          await this.handleTransferCreated(event.data.object as Stripe.Transfer);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.paymentModel.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: 'succeeded',
        processedAt: new Date(),
        stripeChargeId: paymentIntent.latest_charge as string,
      },
    );
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.paymentModel.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: 'failed',
        failedAt: new Date(),
        failureReason: paymentIntent.last_payment_error?.message,
      },
    );
  }

  private async handleTransferCreated(transfer: Stripe.Transfer): Promise<void> {
    if (transfer.metadata?.paymentId) {
      await this.paymentModel.findByIdAndUpdate(transfer.metadata.paymentId, {
        stripeTransferId: transfer.id,
        processedAt: new Date(),
      });
    }
  }

  private async getFreelancerStripeAccount(freelancerId: string): Promise<string> {
    const freelancer = await this.userModel.findById(freelancerId);
    
    if (!freelancer?.stripeConnectedAccountId) {
      throw new BadRequestException('Freelancer must set up Stripe account first');
    }

    return freelancer.stripeConnectedAccountId;
  }

  async createConnectedAccount(userId: string): Promise<{ accountLink: string }> {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.role.includes('freelancer')) {
      throw new ForbiddenException('Only freelancers can create connected accounts');
    }

    try {
      let accountId = user.stripeConnectedAccountId;

      if (!accountId) {
        // Create new Stripe connected account
        const account = await this.stripe.accounts.create({
          type: 'express',
          country: 'US', // You might want to make this configurable
          email: user.email,
        });

        accountId = account.id;

        // Save to user record
        await this.userModel.findByIdAndUpdate(userId, {
          stripeConnectedAccountId: accountId,
        });
      }

      // Create account link for onboarding
      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${this.configService.get('app.frontendUrl')}/dashboard/payments/setup`,
        return_url: `${this.configService.get('app.frontendUrl')}/dashboard/payments/success`,
        type: 'account_onboarding',
      });

      return { accountLink: accountLink.url };
    } catch (error) {
      console.error('Connected account creation failed:', error);
      throw new BadRequestException('Failed to create connected account');
    }
  }

  async getAccountStatus(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    
    if (!user?.stripeConnectedAccountId) {
      return { connected: false, requirements: [] };
    }

    try {
      const account = await this.stripe.accounts.retrieve(user.stripeConnectedAccountId);
      
      return {
        connected: account.charges_enabled && account.payouts_enabled,
        requirements: account.requirements?.currently_due || [],
        accountId: account.id,
      };
    } catch (error) {
      console.error('Account status check failed:', error);
      return { connected: false, requirements: ['account_not_found'] };
    }
  }
}
