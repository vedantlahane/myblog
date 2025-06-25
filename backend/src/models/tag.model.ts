import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITag {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
  createdAt: Date;
}

export interface ITagDocument extends ITag, Document {}

interface ITagModel extends Model<ITagDocument> {
  findOrCreate(name: string): Promise<ITagDocument>;
  getMostUsed(limit?: number): Promise<ITagDocument[]>;
}

const tagSchema = new Schema<ITagDocument>({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  slug: { 
    type: String, 
    unique: true,
    lowercase: true
  },
  description: { 
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  color: {
    type: String,
    validate: {
      validator: (color: string) => !color || /^#[0-9A-F]{6}$/i.test(color),
      message: 'Please provide a valid hex color'
    }
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

tagSchema.index({ postCount: -1 });

// Pre-save middleware
tagSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

// Static methods
tagSchema.statics.findOrCreate = async function(name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  let tag = await this.findOne({ slug });
  
  if (!tag) {
    tag = await this.create({ name, slug });
  }
  
  return tag;
};

tagSchema.statics.getMostUsed = function(limit = 10) {
  return this.find()
    .sort({ postCount: -1 })
    .limit(limit);
};

export const Tag = mongoose.model<ITagDocument, ITagModel>('Tag', tagSchema);