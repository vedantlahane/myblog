import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITag {
  name: string;
  description?: string;
  color: string;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITagDocument extends ITag, Document {}

interface ITagModel extends Model<ITagDocument> {
  findByName(name: string): Promise<ITagDocument | null>;
  incrementPostCount(tagId: mongoose.Types.ObjectId): Promise<void>;
  decrementPostCount(tagId: mongoose.Types.ObjectId): Promise<void>;
}

const tagSchema = new Schema<ITagDocument>({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [2, 'Tag name must be at least 2 characters'],
    maxlength: [50, 'Tag name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  color: {
    type: String,
    default: '#6B7280',
    validate: {
      validator: (color: string) => /^#[0-9A-F]{6}$/i.test(color),
      message: 'Please provide a valid hex color'
    }
  },
  postCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
});

// Indexes
tagSchema.index({ name: 1 });
tagSchema.index({ postCount: -1 });
tagSchema.index({ createdAt: -1 });

// Static methods
tagSchema.statics.findByName = async function(name: string) {
  return this.findOne({ name: name.toLowerCase() });
};

tagSchema.statics.incrementPostCount = async function(tagId: mongoose.Types.ObjectId) {
  await this.findByIdAndUpdate(tagId, { $inc: { postCount: 1 } });
};

tagSchema.statics.decrementPostCount = async function(tagId: mongoose.Types.ObjectId) {
  await this.findByIdAndUpdate(tagId, { $inc: { postCount: -1 } });
};

export const Tag = mongoose.model<ITagDocument, ITagModel>('Tag', tagSchema);
