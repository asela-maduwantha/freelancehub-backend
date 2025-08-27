import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FileUpload, FileUploadDocument } from '../schemas/file-upload.schema';
import { FileUploadDto, FileFilterDto } from './dto/upload.dto';
import * as fs from 'fs';
import { BlobServiceClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private blobServiceClient: BlobServiceClient;
  private containerClient: any;
  private blobUrl: string;

  constructor(
    @InjectModel(FileUpload.name) private fileUploadModel: Model<FileUploadDocument>,
    private configService: ConfigService,
  ) {
  const accountName = this.configService.get<string>('azure.accountName');
  const accountKey = this.configService.get<string>('azure.accountKey');
  const containerName = this.configService.get<string>('azure.containerName') ?? '';
  const blobUrl = this.configService.get<string>('azure.blobUrl') ?? '';
  const connStr = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;
  this.blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
  this.containerClient = this.blobServiceClient.getContainerClient(containerName);
  this.blobUrl = blobUrl;
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadDto: FileUploadDto,
    userId: string,
  ): Promise<FileUploadDocument> {
    try {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new BadRequestException('File size exceeds 10MB limit');
      }

      // Validate file type based on category
      this.validateFileType(file, uploadDto.category);

      // Upload to Azure Blob Storage
      const blockBlobClient = this.containerClient.getBlockBlobClient(file.filename);
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype }
      });

      const fileUpload = new this.fileUploadModel({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.filename,
        uploadedBy: new Types.ObjectId(userId),
        category: uploadDto.category,
        relatedTo: uploadDto.relatedTo ? new Types.ObjectId(uploadDto.relatedTo) : undefined,
        onModel: uploadDto.onModel,
        url: `${this.blobUrl}/${file.filename}`,
      });

      const savedFile = await fileUpload.save();
      this.logger.log(`File uploaded to Azure: ${file.originalname} by user ${userId}`);
      return savedFile;
    } catch (error) {
      // Clean up uploaded file if database save fails
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    uploadDto: FileUploadDto,
    userId: string,
  ): Promise<FileUploadDocument[]> {
    const uploadedFiles: FileUploadDocument[] = [];
    
    for (const file of files) {
      try {
        const uploadedFile = await this.uploadFile(file, uploadDto, userId);
        uploadedFiles.push(uploadedFile);
      } catch (error) {
        this.logger.error(`Failed to upload file ${file.originalname}:`, error.message);
        // Continue with other files
      }
    }

    return uploadedFiles;
  }

  async getFiles(userId: string, filters: FileFilterDto = {}): Promise<FileUploadDocument[]> {
    const query: any = { uploadedBy: new Types.ObjectId(userId), isActive: true };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.relatedTo) {
      query.relatedTo = new Types.ObjectId(filters.relatedTo);
    }

    if (filters.mimetype) {
      query.mimetype = { $regex: filters.mimetype, $options: 'i' };
    }

    return this.fileUploadModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'username email')
      .exec();
  }

  async getFileById(fileId: string, userId: string): Promise<FileUploadDocument> {
    const file = await this.fileUploadModel
      .findOne({ 
        _id: new Types.ObjectId(fileId), 
        uploadedBy: new Types.ObjectId(userId),
        isActive: true 
      })
      .populate('uploadedBy', 'username email')
      .exec();

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.getFileById(fileId, userId);

    // Mark as inactive instead of actual deletion
    file.isActive = false;
    await file.save();

    // Delete from Azure Blob Storage
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(file.filename);
      await blockBlobClient.deleteIfExists();
    } catch (error) {
      this.logger.warn(`Failed to delete blob ${file.filename}:`, error.message);
    }

    this.logger.log(`File deleted from Azure: ${file.originalName} by user ${userId}`);
  }

  async getFilesByProject(projectId: string): Promise<FileUploadDocument[]> {
    return this.fileUploadModel
      .find({
        relatedTo: new Types.ObjectId(projectId),
        onModel: 'Project',
        isActive: true,
      })
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getFilesByMessage(messageId: string): Promise<FileUploadDocument[]> {
    return this.fileUploadModel
      .find({
        relatedTo: new Types.ObjectId(messageId),
        onModel: 'Message',
        isActive: true,
      })
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  private validateFileType(file: Express.Multer.File, category: string): void {
    const allowedTypes = {
      avatar: ['image/jpeg', 'image/png', 'image/gif'],
      project_attachment: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv'
      ],
      message_attachment: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ],
      document: [
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv'
      ],
    };

    if (!allowedTypes[category]?.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed for category ${category}`,
      );
    }
  }
}
