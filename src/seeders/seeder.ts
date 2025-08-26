import { seeder } from 'nestjs-seeder';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { FreelancerProfile, FreelancerProfileSchema } from '../schemas/freelancer-profile.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Proposal, ProposalSchema } from '../schemas/proposal.schema';
import { Review, ReviewSchema } from '../schemas/review.schema';
import { Notification, NotificationSchema } from '../schemas/notification.schema';

// Import seeders
import { UsersSeeder } from './users.seeder';
import { FreelancerProfilesSeeder } from './freelancer-profiles.seeder';
import { ProjectsSeeder } from './projects.seeder';
import { ProposalsSeeder } from './proposals.seeder';
import { ReviewsSeeder } from './reviews.seeder';
import { NotificationsSeeder } from './notifications.seeder';

// Get database URL from environment or use default
const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/freelancehub';

seeder({
  imports: [
    MongooseModule.forRoot(dbUrl),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FreelancerProfile.name, schema: FreelancerProfileSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
}).run([
  UsersSeeder,
  FreelancerProfilesSeeder,
  ProjectsSeeder,
  ProposalsSeeder,
  ReviewsSeeder,
  NotificationsSeeder,
]);
