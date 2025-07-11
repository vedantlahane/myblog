import { Request, Response } from 'express';
import { Tag } from '../models/tag.model';
import { Post } from '../models/post.model';
import { isValidObjectId } from 'mongoose';

// ... continuing from createTag

export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    const existingTag = await Tag.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existingTag) {
      res.status(400).json({ error: 'Tag already exists' });
      return;
    }

    const tag = await Tag.create({ name, description });
    res.status(201).json(tag);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, sort = 'name' } = req.query;

    const tags = await Tag.find()
      .sort(sort as string)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Tag.countDocuments();

    res.json({
      tags,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalTags: total
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getTagById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ error: 'Invalid tag ID' });
      return;
    }

    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.json(tag);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const tagId = req.params.id;

    // Check if tag is being used by any posts
    const postsUsingTag = await Post.countDocuments({ tags: tagId });
    if (postsUsingTag > 0) {
      res.status(400).json({ 
        error: `Cannot delete tag. It's being used by ${postsUsingTag} posts.` 
      });
      return;
    }

    const tag = await Tag.findByIdAndDelete(tagId);
    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getPopularTags = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tags = await Tag.find()
      .sort({ postCount: -1 })
      .limit(10);

    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getPostsByTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const tagId = req.params.id;

    const posts = await Post.find({ 
      tags: tagId, 
      status: 'published' 
    })
      .populate('author', 'name avatarUrl')
      .populate('tags', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Post.countDocuments({ 
      tags: tagId, 
      status: 'published' 
    });

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