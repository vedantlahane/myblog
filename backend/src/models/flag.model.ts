import mongoose, { Document, Schema, Model } from 'mongoose';
interface IReport {
  reporter: mongoose.Types.ObjectId;
  targetType: 'post' | 'comment' | 'user';
  targetId: mongoose.Types.ObjectId;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
}