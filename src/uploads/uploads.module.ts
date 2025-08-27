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
      storage: diskStorage({
  // For Azure Blob Storage, file handling is done in service, not here
  // storage: diskStorage({
  //   destination: (req, file, cb) => {
  //     const uploadDir = './uploads';
  //     // Create uploads directory if it doesn't exist
  //     if (!fs.existsSync(uploadDir)) {
  //       fs.mkdirSync(uploadDir, { recursive: true });
  //     }
  //     cb(null, uploadDir);
  //   },
  //   filename: (req, file, cb) => {
  //     const randomName = Array(32)
  //       .fill(null)
  //       .map(() => Math.round(Math.random() * 16).toString(16))
  //       .join('');
  //     cb(null, `${randomName}${extname(file.originalname)}`);
  //   },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10, // Max 10 files per request
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
