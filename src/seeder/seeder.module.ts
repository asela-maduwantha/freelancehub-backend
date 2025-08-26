import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederService } from './seeder.service';
import { DatabaseSeederService } from '../seeders/database-seeder.service';

// Import schemas
import { User, UserSchema } from '../schemas/user.schema';
import { FreelancerProfile, FreelancerProfileSchema } from '../schemas/freelancer-profile.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Proposal, ProposalSchema } from '../schemas/proposal.schema';
import { Review, ReviewSchema } from '../schemas/review.schema';
import { Notification, NotificationSchema } from '../schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FreelancerProfile.name, schema: FreelancerProfileSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [SeederService, DatabaseSeederService],
  exports: [SeederService, DatabaseSeederService],
})
export class SeederModule {}
