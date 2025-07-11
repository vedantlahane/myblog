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
}