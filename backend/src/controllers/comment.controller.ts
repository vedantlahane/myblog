import { Request, Response } from 'express';
import { Comment } from '../models/comment.model';
import { Post } from '../models/post.model';
import { Notification } from '../models/notification.model';
import { isValidObjectId } from 'mongoose';

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, postId, parentId } = req.body;
    const authorId = req.user!.userId;

    if (!content || !postId) {
      res.status(400).json({ error: 'Content and postId are required' });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const comment = await Comment.create({
      content,
      author: authorId,
      post: postId,
      parent: parentId
    });

    await comment.populate('author', 'name avatarUrl');

    // Create notification for post author
    if (post.author.toString() !== authorId) {
      await Notification.create({
        recipient: post.author,
        sender: authorId,
        type: 'comment',
        message: parentId ? 'replied to a comment on your post' : 'commented on your post',
        entityType: 'comment',
        entityId: comment._id
      });
    }

    // If replying to a comment, notify parent comment author
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (parentComment && parentComment.author.toString() !== authorId) {
        await Notification.create({
          recipient: parentComment.author,
          sender: authorId,
          type: 'comment',
          message: 'replied to your comment',
          entityType: 'comment',
          entityId: comment._id
        });
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!isValidObjectId(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const comments = await Comment.find({ 
      post: postId, 
      parent: null,
      isDeleted: false 
    })
      .populate('author', 'name avatarUrl')
      .populate({
        path: 'replies',
        match: { isDeleted: false },
        populate: { path: 'author', select: 'name avatarUrl' }
      })
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Comment.countDocuments({ 
      post: postId, 
      parent: null,
      isDeleted: false 
    });

    res.json({
      comments,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalComments: total
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.author.toString() !== userId) {
      res.status(403).json({ error: 'You can only edit your own comments' });
      return;
    }

    comment.content = content;
    await comment.save();

    await comment.populate('author', 'name avatarUrl');

    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.author.toString() !== userId && !req.user!.isAdmin) {
      res.status(403).json({ error: 'You can only delete your own comments' });
      return;
    }

    // Soft delete to preserve thread structure
    comment.isDeleted = true;
    comment.content = '[This comment has been deleted]';
    await comment.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const likeComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.likes.includes(userId as any)) {
      res.status(400).json({ error: 'Comment already liked' });
      return;
    }

    comment.likes.push(userId as any);
    await comment.save();

    res.json({ message: 'Comment liked successfully', likes: comment.likes.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const unlikeComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    comment.likes = comment.likes.filter(id => !id.equals(userId));
    await comment.save();

    res.json({ message: 'Comment unliked successfully', likes: comment.likes.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCommentReplies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const replies = await Comment.find({ 
      parent: id,
      isDeleted: false 
    })
      .populate('author', 'name avatarUrl')
      .sort({ createdAt: 1 });

    res.json(replies);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};