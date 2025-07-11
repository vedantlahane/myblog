import mongoose, { Document, Schema, Model } from 'mongoose';

interface IDraft {
  post?: mongoose.Types.ObjectId; // null for new posts
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: mongoose.Types.ObjectId[];
  version: number;
  changes?: string; // description of changes
  autoSave: boolean;
  createdAt: Date;
}

export interface IDraftDocument extends IDraft, Document {}

interface IDraftModel extends Model<IDraftDocument> {}

const draftSchema = new Schema<IDraftDocument>({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  coverImage: {
    type: String
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  version: {
    type: Number,
    default: 1
  },
  changes: {
    type: String,
    maxlength: [500, 'Changes description cannot exceed 500 characters']
  },
  autoSave: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
draftSchema.index({ author: 1, createdAt: -1 });
draftSchema.index({ post: 1, version: -1 });
draftSchema.index({ author: 1, post: 1 });
draftSchema.index({ autoSave: 1, createdAt: -1 });

export const Draft = mongoose.model<IDraftDocument, IDraftModel>('Draft', draftSchema);