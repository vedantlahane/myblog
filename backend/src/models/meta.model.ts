import mongoose, { Document, Schema, Model } from 'mongoose';
interface ISeoMeta {
  targetType: 'post' | 'category' | 'tag' | 'page';
  targetId: mongoose.Types.ObjectId;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}