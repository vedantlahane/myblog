import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IComment {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId;
  isEdited: boolean;
  editedAt?: Date;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentDocument extends IComment, Document {}

interface ICommentModel extends Model<ICommentDocument> {
  findByPost(postId: string): Promise<ICommentDocument[]>;
}

const commentSchema = new Schema<ICommentDocument>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User is required']
  },
  post: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post', 
    required: [true, 'Post is required']
  },
  content: { 
    type: String, 
    required: [true, 'Content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  isEdited: { type: Boolean, default: false },
  editedAt: Date,
  likes: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ user: 1 });
commentSchema.index({ parentComment: 1 });

// Pre-save middleware
commentSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Static methods
commentSchema.statics.findByPost = function(postId: string) {
  return this.find({ post: postId })
    .populate('user', 'name avatarUrl')
    .sort({ createdAt: -1 });
};

// Virtuals
commentSchema.virtual('likeCount').get(function() {
  return this.likes?.length || 0;
});

commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

export const Comment = mongoose.model<ICommentDocument, ICommentModel>('Comment', commentSchema);