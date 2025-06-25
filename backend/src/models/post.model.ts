import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPost {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: mongoose.Types.ObjectId;
  coverImage?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  likes: mongoose.Types.ObjectId[];
  viewCount: number;
  readTime: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface IPostDocument extends IPost, Document {
  generateSlug(): string;
  calculateReadTime(): number;
}

interface IPostModel extends Model<IPostDocument> {
  findPublished(): Promise<IPostDocument[]>;
  findBySlug(slug: string): Promise<IPostDocument | null>;
}

const postSchema = new Schema<IPostDocument>({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: { 
    type: String, 
    unique: true,
    lowercase: true,
    trim: true
  },
  content: { 
    type: String, 
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Author is required']
  },
  coverImage: { 
    type: String,
    validate: {
      validator: (url: string) => !url || /^https?:\/\/.+/.test(url),
      message: 'Please provide a valid URL'
    }
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  likes: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  viewCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  readTime: { 
    type: Number, 
    default: 0,
    min: 0
  },
  publishedAt: Date
}, {
  timestamps: true,
});

// Indexes
// postSchema.index({ slug: 1 });
postSchema.index({ author: 1, status: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ title: 'text', content: 'text' });

// Pre-save middleware
postSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.generateSlug();
  }
  
  if (this.isModified('content')) {
    this.readTime = this.calculateReadTime();
  }
  
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Instance methods
postSchema.methods.generateSlug = function(): string {
  return this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now();
};

postSchema.methods.calculateReadTime = function(): number {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Static methods
postSchema.statics.findPublished = function() {
  return this.find({ status: 'published' }).sort({ publishedAt: -1 });
};

postSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug, status: 'published' });
};

// Virtuals
postSchema.virtual('likeCount').get(function() {
  return this.likes?.length || 0;
});

postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post'
});

export const Post = mongoose.model<IPostDocument, IPostModel>('Post', postSchema);