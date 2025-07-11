import mongoose, { Document, Schema, Model } from 'mongoose';

interface IMedia {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: mongoose.Types.ObjectId;
  usedIn: Array<{
    modelType: 'Post' | 'User' | 'Comment';
    modelId: mongoose.Types.ObjectId;
  }>;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number; // for videos
  };
  altText?: string;
  description?: string;
}

export interface IMediaDocument extends IMedia, Document {}

interface IMediaModel extends Model<IMediaDocument> {}

const mediaSchema = new Schema<IMediaDocument>({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    unique: true
  },
  originalName: {
    type: String,
    required: [true, 'Original name is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  url: {
    type: String,
    required: [true, 'URL is required']
  },
  thumbnailUrl: {
    type: String
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  usedIn: [{
    modelType: {
      type: String,
      enum: ['Post', 'User', 'Comment'],
      required: true
    },
    modelId: {
      type: Schema.Types.ObjectId,
      required: true
    }
  }],
  metadata: {
    width: Number,
    height: Number,
    duration: Number
  },
  altText: {
    type: String,
    maxlength: [200, 'Alt text cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ mimeType: 1 });
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ filename: 1 });

export const Media = mongoose.model<IMediaDocument, IMediaModel>('Media', mediaSchema);