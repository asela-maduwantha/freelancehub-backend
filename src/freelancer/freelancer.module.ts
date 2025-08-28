import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FreelancerController } from './freelancer.controller';
import { FreelancerService } from './freelancer.service';
import { User, UserSchema } from '../schemas/user.schema';
import { FreelancerProfile, FreelancerProfileSchema } from '../schemas/freelancer-profile.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Contract, ContractSchema } from '../schemas/contract.schema';
import { Payment, PaymentSchema } from '../schemas/payment.schema';
import { Proposal, ProposalSchema } from '../schemas/proposal.schema';
import { Notification, NotificationSchema } from '../schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FreelancerProfile.name, schema: FreelancerProfileSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Contract.name, schema: ContractSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [FreelancerController],
  providers: [FreelancerService],
})
export class FreelancerModule {}
