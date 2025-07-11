import { Request, Response } from 'express';
import { Post } from '../models/post.model';
import { User } from '../models/user.model';
import { Tag } from '../models/tag.model';

export const searchPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const searchQuery = {
      $and: [
        { status: 'published' },
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { content: { $regex: q, $options: 'i' } },
            { excerpt: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    };

    const posts = await Post.find(searchQuery)
      .populate('author', 'name avatarUrl')
      .populate('tags', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Post.countDocuments(searchQuery);

    res.json({
      posts,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalResults: total
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const searchQuery = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ]
    };

    const users = await User.find(searchQuery)
      .select('-password')
      .sort({ followerCount: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(searchQuery);

    res.json({
      users: users.map(user => user.toSafeObject()),
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalResults: total
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const searchTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const searchQuery = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    };

    const tags = await Tag.find(searchQuery)
      .sort({ postCount: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Tag.countDocuments(searchQuery);

    res.json({
      tags,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalResults: total
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const globalSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const [posts, users, tags] = await Promise.all([
      Post.find({
        status: 'published',
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } }
        ]
      })
        .populate('author', 'name avatarUrl')
        .limit(Number(limit))
        .sort({ publishedAt: -1 }),

      User.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { bio: { $regex: q, $options: 'i' } }
        ]
      })
        .select('-password')
        .limit(Number(limit))
        .sort({ followerCount: -1 }),

      Tag.find({
        name: { $regex: q, $options: 'i' }
      })
        .limit(Number(limit))
        .sort({ postCount: -1 })
    ]);

    res.json({
      posts,
      users: users.map(user => user.toSafeObject()),
      tags
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};