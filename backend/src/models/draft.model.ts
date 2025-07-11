import mongoose from "mongoose";
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