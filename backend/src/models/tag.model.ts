import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITag {
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITagDocument extends ITag, Document {
  generateSlug(): string;
}

interface ITagModel extends Model<ITagDocument> {
  findBySlug(slug: string): Promise<ITagDocument | null>;
  incrementPostCount(tagId: mongoose.Types.ObjectId): Promise<void>;
  decrementPostCount(tagId: mongoose.Types.ObjectId): Promise<void>;
}

const tagSchema = new Schema<ITagDocument>({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    trim: true,
    maxlength: [30, 'Tag name cannot exceed 30 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  postCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes
tagSchema.index({ slug: 1 });
tagSchema.index({ name: 'text' });
tagSchema.index({ postCount: -1 });

// Pre-save middleware
tagSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.generateSlug();
  }
  next();
});

// Instance methods
tagSchema.methods.generateSlug = function(): string {
  return this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Static methods
tagSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug });
};

tagSchema.statics.incrementPostCount = async function(tagId: mongoose.Types.ObjectId) {
  await this.findByIdAndUpdate(tagId, { $inc: { postCount: 1 } });
};

tagSchema.statics.decrementPostCount = async function(tagId: mongoose.Types.ObjectId) {
  await this.findByIdAndUpdate(tagId, { $inc: { postCount: -1 } });
};

export const Tag = mongoose.model<ITagDocument, ITagModel>('Tag', tagSchema);