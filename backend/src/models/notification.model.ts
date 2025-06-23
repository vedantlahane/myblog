import mongoose, { Document, Schema, Model } from 'mongoose';

export type NotificationType = 'like' | 'comment' | 'follow' | 'reply' | 'mention';

export interface INotification {
  type: NotificationType;
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  post?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  message: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface INotificationDocument extends INotification, Document {}

interface INotificationModel extends Model<INotificationDocument> {
  markAsRead(userId: string, notificationIds: string[]): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}

const notificationSchema = new Schema<INotificationDocument>({
  type: { 
    type: String, 
    required: true,
    enum: ['like', 'comment', 'follow', 'reply', 'mention']
  },
  recipient: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  post: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post' 
  },
  comment: { 
    type: Schema.Types.ObjectId, 
    ref: 'Comment' 
  },
  message: { 
    type: String, 
    required: true 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  readAt: Date,
  metadata: { 
    type: Map, 
    of: Schema.Types.Mixed 
  }
}, { 
  timestamps: true 
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

// Static methods
notificationSchema.statics.markAsRead = async function(
  userId: string, 
  notificationIds: string[]
) {
  await this.updateMany(
    { 
      _id: { $in: notificationIds }, 
      recipient: userId 
    },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

notificationSchema.statics.getUnreadCount = async function(userId: string) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

export const Notification = mongoose.model<INotificationDocument, INotificationModel>(
  'Notification', 
  notificationSchema
);