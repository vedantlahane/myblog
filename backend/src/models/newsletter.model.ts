import mongoose, { Document, Schema, Model } from 'mongoose';
interface ISubscription {
  email: string;
  userId?: mongoose.Types.ObjectId; // optional, for registered users
  isActive: boolean;
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories?: mongoose.Types.ObjectId[];
    tags?: mongoose.Types.ObjectId[];
  };
  unsubscribeToken: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}