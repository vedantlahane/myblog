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