import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IComment {
  content: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentDocument extends IComment, Document {}

interface ICommentModel extends Model<ICommentDocument> {
  findByPost(postId: mongoose.Types.ObjectId): Promise<ICommentDocument[]>;
  findReplies(commentId: mongoose.Types.ObjectId): Promise<ICommentDocument[]>;
}

const commentSchema = new Schema<ICommentDocument>({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parent: 1 });

// Pre-save middleware
commentSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.editedAt = new Date();
  }
  next();
});

// Static methods
commentSchema.statics.findByPost = function(postId: mongoose.Types.ObjectId) {
  return this.find({ post: postId, parent: null, isDeleted: false })
    .populate('author', 'name avatarUrl')
    .sort({ createdAt: -1 });
};

commentSchema.statics.findReplies = function(commentId: mongoose.Types.ObjectId) {
  return this.find({ parent: commentId, isDeleted: false })
    .populate('author', 'name avatarUrl')
    .sort({ createdAt: 1 });
};

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes?.length || 0;
});

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent'
});

export const Comment = mongoose.model<ICommentDocument, ICommentModel>('Comment', commentSchema);