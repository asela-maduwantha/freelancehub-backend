import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Request,
  Res,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
// Removed diskStorage import for Azure Blob Storage migration
import { extname, join } from 'path';
import * as fs from 'fs';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { FileUploadDto, FileFilterDto } from './dto/upload.dto';

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('single')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @UseInterceptors(
  FileInterceptor('file'),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: FileUploadDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const uploadedFile = await this.uploadsService.uploadFile(
      file,
      uploadDto,
      req.user.sub,
    );

    return {
      message: 'File uploaded successfully',
      file: {
        id: uploadedFile._id,
        filename: uploadedFile.filename,
        originalName: uploadedFile.originalName,
        mimetype: uploadedFile.mimetype,
        size: uploadedFile.size,
        url: uploadedFile.url,
        category: uploadedFile.category,
        uploadedAt: (uploadedFile as any).createdAt,
      },
    };
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @UseInterceptors(
  FilesInterceptor('files', 10),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: FileUploadDto,
    @Request() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadedFiles = await this.uploadsService.uploadMultipleFiles(
      files,
      uploadDto,
      req.user.sub,
    );

    return {
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles.map((file) => ({
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        url: file.url,
        category: file.category,
        uploadedAt: (file as any).createdAt,
      })),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get user files with optional filters' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  async getFiles(
    @Query() filters: FileFilterDto,
    @Request() req: any,
  ) {
    const files = await this.uploadsService.getFiles(req.user.sub, filters);

    return {
      message: 'Files retrieved successfully',
      files: files.map((file) => ({
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        url: file.url,
        category: file.category,
        relatedTo: file.relatedTo,
        onModel: file.onModel,
        uploadedBy: file.uploadedBy,
        uploadedAt: (file as any).createdAt,
      })),
      total: files.length,
    };
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get files for a specific project' })
  @ApiResponse({ status: 200, description: 'Project files retrieved successfully' })
  async getProjectFiles(@Param('projectId') projectId: string) {
    const files = await this.uploadsService.getFilesByProject(projectId);

    return {
      message: 'Project files retrieved successfully',
      files: files.map((file) => ({
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        url: file.url,
        uploadedBy: file.uploadedBy,
        uploadedAt: (file as any).createdAt,
      })),
      total: files.length,
    };
  }

  @Get('message/:messageId')
  @ApiOperation({ summary: 'Get files for a specific message' })
  @ApiResponse({ status: 200, description: 'Message files retrieved successfully' })
  async getMessageFiles(@Param('messageId') messageId: string) {
    const files = await this.uploadsService.getFilesByMessage(messageId);

    return {
      message: 'Message files retrieved successfully',
      files: files.map((file) => ({
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        url: file.url,
        uploadedBy: file.uploadedBy,
        uploadedAt: (file as any).createdAt,
      })),
      total: files.length,
    };
  }

  @Get('serve/:filename')
  @ApiOperation({ summary: 'Serve uploaded file' })
  @ApiResponse({ status: 200, description: 'File served successfully' })
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return res.sendFile(filePath);
  }

  @Get(':fileId')
  @ApiOperation({ summary: 'Get file details by ID' })
  @ApiResponse({ status: 200, description: 'File details retrieved successfully' })
  async getFileById(
    @Param('fileId') fileId: string,
    @Request() req: any,
  ) {
    const file = await this.uploadsService.getFileById(fileId, req.user.sub);

    return {
      message: 'File details retrieved successfully',
      file: {
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        url: file.url,
        category: file.category,
        relatedTo: file.relatedTo,
        onModel: file.onModel,
        uploadedBy: file.uploadedBy,
        uploadedAt: (file as any).createdAt,
      },
    };
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(
    @Param('fileId') fileId: string,
    @Request() req: any,
  ) {
    await this.uploadsService.deleteFile(fileId, req.user.sub);

    return {
      message: 'File deleted successfully',
    };
  }
}
