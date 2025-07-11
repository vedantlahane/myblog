import { Request, Response } from 'express';
import { Post } from '../models/post.model';
import { Tag } from '../models/tag.model';
import { Notification } from '../models/notification.model';
import { isValidObjectId } from 'mongoose';

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, excerpt, coverImage, tags, status } = req.body;
    const authorId = req.user!.userId;

    // Validate tags
    if (!tags || tags.length === 0) {
      res.status(400).json({ error: 'At least one tag is required' });
      return;
    }

    const post = await Post.create({
      title,
      content,
      excerpt,
      coverImage,
      tags,
      status,
      author: authorId
    });

    // Update tag post counts
    await Promise.all(
      tags.map((tagId: string) => Tag.incrementPostCount(tagId as any))
    );

    // Notify followers if published
    if (status === 'published') {
      const author = await User.findById(authorId);
      if (author) {
        const notifications = author.followers.map(followerId => ({
          recipient: followerId,
          sender: authorId,
          type: 'post',
          message: `${author.name} published a new post: ${title}`,
          entityType: 'post',
          entityId: post._id
        }));
        await Notification.insertMany(notifications);
      }
    }

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name avatarUrl')
      .populate('tags', 'name slug');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-publishedAt',
      status = 'published'
    } = req.query;

    const query = status ? { status } : {};
    
    const posts = await Post.find(query)
      .populate('author', 'name avatarUrl')
      .populate('tags', 'name slug')
      .sort(sort as string)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalPosts: total
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatarUrl bio')
      .populate('tags', 'name slug')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name avatarUrl' }
      });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findBySlug(req.params.slug);
    
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    await post.populate('author', 'name avatarUrl bio');
    await post.populate('tags', 'name slug');

    // Increment view count
    post.viewCount += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    const userId = req.user!.userId;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.author.toString() !== userId && !req.user!.isAdmin) {
      res.status(403).json({ error: 'You can only edit your own posts' });
      return;
    }

    const oldTags = post.tags;
    const newTags = req.body.tags || oldTags;

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      req.body,
      { new: true, runValidators: true }
    );

    // Update tag counts if tags changed
    if (JSON.stringify(oldTags) !== JSON.stringify(newTags)) {
      await Promise.all([
        ...oldTags.filter(tag => !newTags.includes(tag))
          .map(tag => Tag.decrementPostCount(tag)),
        ...newTags.filter(tag => !oldTags.includes(tag))
          .map(tag => Tag.incrementPostCount(tag))
      ]);
    }

    await updatedPost!.populate('author', 'name avatarUrl');
    await updatedPost!.populate('tags', 'name slug');

    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    const userId = req.user!.userId;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.author.toString() !== userId && !req.user!.isAdmin) {
      res.status(403).json({ error: 'You can only delete your own posts' });
      return;
    }

    await Post.findByIdAndDelete(postId);

    // Update tag counts
    await Promise.all(
      post.tags.map(tag => Tag.decrementPostCount(tag))
    );

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const likePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    const userId = req.user!.userId;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.likes.includes(userId as any)) {
      res.status(400).json({ error: 'Post already liked' });
      return;
    }

    post.likes.push(userId as any);
    await post.save();

    // Create notification
    if (post.author.toString() !== userId) {
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'like',
        message: 'liked your post',
        entityType: 'post',
        entityId: post._id
      });
    }

    res.json({ message: 'Post liked successfully', likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const unlikePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    const userId = req.user!.userId;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    post.likes = post.likes.filter(id => !id.equals(userId));
    await post.save();

    res.json({ message: 'Post unliked successfully', likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getTrendingPosts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name avatarUrl')
      .populate('tags', 'name slug')
      .sort({ viewCount: -1, likeCount: -1 })
      .limit(10);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getRelatedPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const relatedPosts = await Post.find({
      _id: { $ne: postId },
      tags: { $in: post.tags },
      status: 'published'
    })
      .populate('author', 'name avatarUrl')
      .populate('tags', 'name slug')
      .limit(5);

    res.json(relatedPosts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};