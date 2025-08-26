import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Payment, PaymentSchema } from '../schemas/payment.schema';
import { Message, MessageSchema } from '../schemas/message.schema';
import { Review, ReviewSchema } from '../schemas/review.schema';
import { FileUpload, FileUploadSchema } from '../schemas/file-upload.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: FileUpload.name, schema: FileUploadSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
