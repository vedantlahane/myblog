import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INotification {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'post';
  message: string;
  entityType?: 'post' | 'comment' | 'user';
  entityId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationDocument extends INotification, Document {}

interface INotificationModel extends Model<INotificationDocument> {
  findUnreadByUser(userId: mongoose.Types.ObjectId): Promise<INotificationDocument[]>;
  markAsRead(notificationId: mongoose.Types.ObjectId): Promise<void>;
  markAllAsReadForUser(userId: mongoose.Types.ObjectId): Promise<void>;
}

const notificationSchema = new Schema<INotificationDocument>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'mention', 'post'],
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: [200, 'Message cannot exceed 200 characters']
  },
  entityType: {
    type: String,
    enum: ['post', 'comment', 'user']
  },
  entityId: {
    type: Schema.Types.ObjectId,
    refPath: 'entityType'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

// Static methods
notificationSchema.statics.findUnreadByUser = function(userId: mongoose.Types.ObjectId) {
  return this.find({ recipient: userId, isRead: false })
    .populate('sender', 'name avatarUrl')
    .sort({ createdAt: -1 });
};

notificationSchema.statics.markAsRead = async function(notificationId: mongoose.Types.ObjectId) {
  await this.findByIdAndUpdate(notificationId, { isRead: true });
};

notificationSchema.statics.markAllAsReadForUser = async function(userId: mongoose.Types.ObjectId) {
  await this.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};

export const Notification = mongoose.model<INotificationDocument, INotificationModel>('Notification', notificationSchema);