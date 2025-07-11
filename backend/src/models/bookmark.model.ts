import mongoose, { Document, Schema, Model } from 'mongoose';

interface IBookmark {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  collections?: string[]; // user-defined collections
  notes?: string; // personal notes
  progress?: number; // reading progress percentage
  bookmarkedAt: Date;
}

export interface IBookmarkDocument extends IBookmark, Document {}

interface IBookmarkModel extends Model<IBookmarkDocument> {}

const bookmarkSchema = new Schema<IBookmarkDocument>({
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
  collections: [{
    type: String,
    trim: true,
    maxlength: [50, 'Collection name cannot exceed 50 characters']
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%'],
    default: 0
  },
  bookmarkedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate bookmarks
bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, bookmarkedAt: -1 });
bookmarkSchema.index({ user: 1, collections: 1 });

export const Bookmark = mongoose.model<IBookmarkDocument, IBookmarkModel>('Bookmark', bookmarkSchema);