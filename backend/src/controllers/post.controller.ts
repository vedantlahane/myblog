import { Request, Response } from 'express';
import { Post, IPostDocument } from '../models/post.model';
import mongoose from 'mongoose';

// Helper function for error responses
const handleError = (res: Response, status: number, message: string) => {
  res.status(status).json({ success: false, error: message });
};

// Create a new post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, author, tags = [], status = 'draft' } = req.body;
    
    const newPost = await Post.create({
      title,
      content,
      author,
      tags,
      status,
      // Slug and readTime will be auto-generated in pre-save hook
    });

    res.status(201).json(newPost);
  } catch (error: any) {
    handleError(res, 400, error.message);
  }
};

// Get all posts (with filtering)
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { status, author, tag, search } = req.query;
    const filter: any = {};
    
    if (status) filter.status = status;
    if (author) filter.author = new mongoose.Types.ObjectId(author as string);
    if (tag) filter.tags = tag;
    if (search) filter.$text = { $search: search as string };

    const posts = await Post.find(filter)
      .populate('author', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};

// Get a single post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email avatarUrl')
      .populate('likes', 'name email avatarUrl');
    
    if (!post) return handleError(res, 404, 'Post not found');
    
    res.json(post);
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};

// Update a post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!post) return handleError(res, 404, 'Post not found');
    res.json(post);
  } catch (error: any) {
    handleError(res, 400, error.message);
  }
};

// Delete a post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return handleError(res, 404, 'Post not found');
    res.json({ success: true, message: 'Post deleted' });
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};

// Like a post
export const likePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.body.userId; // Typically from auth middleware
    
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    );
    
    if (!updatedPost) return handleError(res, 404, 'Post not found');
    res.json(updatedPost);
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};

// Unlike a post
export const unlikePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.body.userId;
    
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );
    
    if (!updatedPost) return handleError(res, 404, 'Post not found');
    res.json(updatedPost);
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};

// Increment view count
export const viewPost = async (req: Request, res: Response) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    
    if (!updatedPost) return handleError(res, 404, 'Post not found');
    res.json(updatedPost);
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};


export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name email avatarUrl')
      .populate('likes', 'name email avatarUrl');
    
    if (!post) return handleError(res, 404, 'Post not found');
    res.json(post);
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};


export const getPublishedPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .populate('author', 'name email avatarUrl');
    
    res.json(posts);
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};
