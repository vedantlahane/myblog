// src/app/models/post.model.ts

// Image interface for reusability
export interface Image {
    url: string;
    alt?: string;
    caption?: string;
  }
  
  // Author interface
  export interface Author {
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
  }
  
  // SEO interface
  export interface SEO {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
  }
  
  // Statistics interface
  export interface PostStats {
    views: number;
    likes: number;
    shares: number;
    readingTime?: number;
  }
  
  // Previous version interface
  export interface PreviousVersion {
    content: string;
    updatedAt: Date;
    version: number;
  }
  
  // Main Post interface
  export interface Post {
    _id: string;
    title: string;
    subtitle: string;
    slug: string;
    content: string;
    contentType: 'text' | 'html' | 'markdown';
    
    // Media
    thumbnail: Image;
    coverImage?: Image;
    images?: Image[];
    
    // Author and Publication
    author: Author;
    
    // Categorization
    category: 'Technology' | 'Programming' | 'Design' | 'Business' | 'Lifestyle' | 'Other';
    tags?: string[];
    
    // Meta Information
    readTime: number;
    seo?: SEO;
    
    // Statistics
    stats: PostStats;
    
    // Status and Visibility
    status: 'draft' | 'published' | 'archived';
    visibility: 'public' | 'private' | 'members';
    featured: boolean;
    
    // Dates
    scheduledFor?: Date;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    
    // Version Control
    version: number;
    previousVersions?: PreviousVersion[];
  }
  
  // You might also want to create a PostResponse interface for API responses
  export interface PostResponse {
    success: boolean;
    data: Post;
    message?: string;
  }
  
  export interface PostsResponse {
    success: boolean;
    data: Post[];
    message?: string;
    pagination?: {
      total: number;
      page: number;
      limit: number;
    };
  }