import mongoose, { Document, Schema, Model } from 'mongoose';

interface ICollection {
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
  isPublic: boolean;
}

export interface ICollectionDocument extends ICollection, Document {
  generateSlug(): string;
}

interface ICollectionModel extends Model<ICollectionDocument> {
  findBySlug(slug: string): Promise<ICollectionDocument | null>;
}

const collectionSchema = new Schema<ICollectionDocument>({
  title: {
    type: String,
    required: [true, 'Collection title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  posts: [{
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  }],
  coverImage: {
    type: String
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
collectionSchema.index({ author: 1, createdAt: -1 });
collectionSchema.index({ isPublic: 1, createdAt: -1 });
collectionSchema.index({ title: 'text', description: 'text' });

// Pre-save middleware
collectionSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.generateSlug();
  }
  next();
});

// Instance methods
collectionSchema.methods.generateSlug = function(): string {
  return this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Static methods
collectionSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug });
};

export const Collection = mongoose.model<ICollectionDocument, ICollectionModel>('Collection', collectionSchema);