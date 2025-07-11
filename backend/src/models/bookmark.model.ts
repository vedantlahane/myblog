import mongoose from "mongoose";
interface IBookmark {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  collections?: string[]; // user-defined collections
  notes?: string; // personal notes
  progress?: number; // reading progress percentage
  bookmarkedAt: Date;
}