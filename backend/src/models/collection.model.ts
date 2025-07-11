import mongoose, { Document, Schema, Model } from 'mongoose';
interface ISeries {
  title: string;
  slug: string;
  description: string;
  author: mongoose.Types.ObjectId;
  posts: Array<{
    post: mongoose.Types.ObjectId;
    order: number;
  }>;
  coverImage?: string;
  isComplete: boolean;
}