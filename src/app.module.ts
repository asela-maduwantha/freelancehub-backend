import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import modules
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WebsocketModule } from './websocket/websocket.module';
import { UploadsModule } from './uploads/uploads.module';
import { AdminModule } from './admin/admin.module';
import { PublicModule } from './public/public.module';
import { FreelancerModule } from './freelancer/freelancer.module';
import { ClientModule } from './client/client.module';

// Import schemas
import { User, UserSchema } from './schemas/user.schema';
import { FreelancerProfile, FreelancerProfileSchema } from './schemas/freelancer-profile.schema';
import { Project, ProjectSchema } from './schemas/project.schema';
import { Proposal, ProposalSchema } from './schemas/proposal.schema';
import { Contract, ContractSchema } from './schemas/contract.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Message, MessageSchema, Conversation, ConversationSchema } from './schemas/message.schema';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { FileUpload, FileUploadSchema } from './schemas/file-upload.schema';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        ...configService.get('database.options'),
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('security.rateLimitWindowMs') || 900000,
            limit: configService.get('security.rateLimitMaxRequests') || 100,
          },
        ],
      }),
    }),

    // Task scheduling
    ScheduleModule.forRoot(),

    // Register all schemas
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FreelancerProfile.name, schema: FreelancerProfileSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: Contract.name, schema: ContractSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: FileUpload.name, schema: FileUploadSchema },
    ]),

    // Feature modules
    AuthModule,
    ProjectsModule,
    ContractsModule,
    PaymentsModule,
    MessagingModule,
    NotificationsModule,
    ReviewsModule,
    WebsocketModule,
    UploadsModule,
    AdminModule,
    PublicModule,
    FreelancerModule,
    ClientModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
