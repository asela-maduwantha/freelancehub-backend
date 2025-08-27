import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { FileUpload, FileUploadSchema } from '../schemas/file-upload.schema';
// Removed diskStorage import for Azure Blob Storage migration
import { extname } from 'path';
import * as fs from 'fs';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FileUpload.name, schema: FileUploadSchema },
    ]),
    MulterModule.register({
      storage: undefined, 
      limits: {
        fileSize: 10 * 1024 * 1024, 
        files: 10, 
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
