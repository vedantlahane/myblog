
// ✅ post.controller.ts (Controller)
import { Request, Response } from 'express';
import { Post } from '../models/post.model';

export const createPost = async (req: Request, res: Response) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find().populate('author', 'name');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({ message: 'Post updated', post: updated });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      user: req.body.user,
      content: req.body.content,
      createdAt: new Date()
    });

    await post.save();
    res.status(201).json({ message: 'Comment added successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate('comments.user', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// export const deleteComment = async (req: Request, res: Response) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: 'Post not found' });

//     post.comments = post.comments.filter(comment => comment._id?.toString() !== req.params.commentId);
//     await post.save();

//     res.status(200).json({ message: 'Comment deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error', error });
//   }
// };
