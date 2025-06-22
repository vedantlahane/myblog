

// ✅ post.model.ts (Model)
import mongoose, { Document, Schema } from 'mongoose';

export interface Comment {
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface PostDocument extends Document {
  title: string;
  subtitle: string;
  content: string;
  category: string;
  author: mongoose.Types.ObjectId;
  tags: string[];
  likes: mongoose.Types.ObjectId[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<PostDocument>(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Post = mongoose.model<PostDocument>('Post', postSchema);
