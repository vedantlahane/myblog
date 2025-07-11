import mongoose, { Document, Schema, Model } from 'mongoose';

interface ICategory {
  name: string;
  slug: string;
  description?: string;
  parentCategory?: mongoose.Types.ObjectId; // for nested categories
  icon?: string;
  isActive: boolean;
  order: number; // for sorting
}

export interface ICategoryDocument extends ICategory, Document {
  generateSlug(): string;
}

interface ICategoryModel extends Model<ICategoryDocument> {
  findBySlug(slug: string): Promise<ICategoryDocument | null>;
}

const categorySchema = new Schema<ICategoryDocument>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
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
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  icon: {
    type: String,
    maxlength: [100, 'Icon cannot exceed 100 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ name: 'text' });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1, order: 1 });

// Pre-save middleware
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.generateSlug();
  }
  next();
});

// Instance methods
categorySchema.methods.generateSlug = function(): string {
  return this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Static methods
categorySchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug });
};

export const Category = mongoose.model<ICategoryDocument, ICategoryModel>('Category', categorySchema);