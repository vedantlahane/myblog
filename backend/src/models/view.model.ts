import mongoose, { Document, Schema, Model } from 'mongoose';
interface IView {
  post: mongoose.Types.ObjectId;
  viewer?: mongoose.Types.ObjectId; // null for anonymous
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  sessionId: string;
  duration: number; // time spent in seconds
  viewedAt: Date;
}