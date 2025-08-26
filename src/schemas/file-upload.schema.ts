import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FileUploadDocument = FileUpload & Document;

@Schema({ timestamps: true })
export class FileUpload {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  uploadedBy: Types.ObjectId;

  @Prop({ required: true, enum: ['avatar', 'project_attachment', 'message_attachment', 'document'] })
  category: string;

  @Prop({ type: Types.ObjectId, refPath: 'onModel' })
  relatedTo?: Types.ObjectId;

  @Prop({ enum: ['Project', 'Message', 'User'] })
  onModel?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  url?: string;
}

export const FileUploadSchema = SchemaFactory.createForClass(FileUpload);
