import { Request, Response } from 'express';
import { Draft } from '../models/draft.model';
import { Post } from '../models/post.model';
import { isValidObjectId } from 'mongoose';

export const createDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      postId, 
      title, 
      content, 
      excerpt, 
      coverImage, 
      tags, 
      changes,
      autoSave = false 
    } = req.body;
    
    const authorId = req.user!.userId;

    // If postId is provided, ensure the user owns the post
    if (postId) {
      const post = await Post.findById(postId);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      if (post.author.toString() !== authorId) {
        res.status(403).json({ error: 'You can only create drafts for your own posts' });
        return;
      }
    }

    // Get the latest version number for this post/author
    const latestDraft = await Draft.findOne({
      $or: [
        { post: postId || null },
        { author: authorId, post: { $exists: false } }
      ]
    }).sort({ version: -1 });

    const version = latestDraft ? latestDraft.version + 1 : 1;

    const draft = await Draft.create({
      post: postId || undefined,
      author: authorId,
      title,
      content,
      excerpt,
      coverImage,
      tags,
      version,
      changes,
      autoSave
    });

    await draft.populate('author', 'name avatarUrl');
    await draft.populate('tags', 'name slug');
    if (draft.post) {
      await draft.populate('post', 'title slug');
    }

    res.status(201).json(draft);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getDrafts = async (req: Request, res: Response): Promise<void> => {
  try {
    const authorId = req.user!.userId;
    const { 
      page = 1, 
      limit = 10, 
      postId,
      autoSave 
    } = req.query;

    const query: any = { author: authorId };
    
    if (postId) {
      query.post = postId;
    }
    
    if (autoSave !== undefined) {
      query.autoSave = autoSave === 'true';
    }

    const drafts = await Draft.find(query)
      .populate('author', 'name avatarUrl')
      .populate('tags', 'name slug')
      .populate('post', 'title slug')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Draft.countDocuments(query);

    res.json({
      drafts,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalDrafts: total
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getDraftById = async (req: Request, res: Response): Promise<void> => {
  try {
    const draft = await Draft.findById(req.params.id)
      .populate('author', 'name avatarUrl')
      .populate('tags', 'name slug')
      .populate('post', 'title slug');
    
    if (!draft) {
      res.status(404).json({ error: 'Draft not found' });
      return;
    }

    // Only allow author to view their own drafts
    if (draft.author._id.toString() !== req.user!.userId) {
      res.status(403).json({ error: 'You can only view your own drafts' });
      return;
    }

    res.json(draft);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const draftId = req.params.id;
    const {
      title,
      content,
      excerpt,
      coverImage,
      tags,
      changes,
      autoSave
    } = req.body;

    const draft = await Draft.findById(draftId);
    if (!draft) {
      res.status(404).json({ error: 'Draft not found' });
      return;
    }

    // Only allow author to update their own drafts
    if (draft.author.toString() !== req.user!.userId) {
      res.status(403).json({ error: 'You can only update your own drafts' });
      return;
    }

    const updatedDraft = await Draft.findByIdAndUpdate(
      draftId,
      {
        title,
        content,
        excerpt,
        coverImage,
        tags,
        changes,
        autoSave
      },
      { new: true, runValidators: true }
    )
      .populate('author', 'name avatarUrl')
      .populate('tags', 'name slug')
      .populate('post', 'title slug');

    res.json(updatedDraft);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const draftId = req.params.id;

    const draft = await Draft.findById(draftId);
    if (!draft) {
      res.status(404).json({ error: 'Draft not found' });
      return;
    }

    // Only allow author to delete their own drafts
    if (draft.author.toString() !== req.user!.userId) {
      res.status(403).json({ error: 'You can only delete your own drafts' });
      return;
    }

    await Draft.findByIdAndDelete(draftId);
    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const publishDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const draftId = req.params.id;

    const draft = await Draft.findById(draftId);
    if (!draft) {
      res.status(404).json({ error: 'Draft not found' });
      return;
    }

    // Only allow author to publish their own drafts
    if (draft.author.toString() !== req.user!.userId) {
      res.status(403).json({ error: 'You can only publish your own drafts' });
      return;
    }

    // Create or update the post
    let post;
    if (draft.post) {
      // Update existing post
      post = await Post.findByIdAndUpdate(
        draft.post,
        {
          title: draft.title,
          content: draft.content,
          excerpt: draft.excerpt,
          coverImage: draft.coverImage,
          tags: draft.tags,
          status: 'published',
          publishedAt: new Date()
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new post
      post = await Post.create({
        title: draft.title,
        content: draft.content,
        excerpt: draft.excerpt,
        coverImage: draft.coverImage,
        tags: draft.tags,
        author: draft.author,
        status: 'published',
        publishedAt: new Date()
      });
    }

    // Delete the draft after publishing
    await Draft.findByIdAndDelete(draftId);

    await post!.populate('author', 'name avatarUrl');
    await post!.populate('tags', 'name slug');

    res.json({ 
      message: 'Draft published successfully', 
      post 
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getDraftVersions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const authorId = req.user!.userId;

    // Verify user owns the post
    if (postId) {
      const post = await Post.findById(postId);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      if (post.author.toString() !== authorId) {
        res.status(403).json({ error: 'You can only view drafts for your own posts' });
        return;
      }
    }

    const drafts = await Draft.find({
      $or: [
        { post: postId },
        { author: authorId, post: { $exists: false } }
      ]
    })
      .populate('author', 'name avatarUrl')
      .sort({ version: -1 });

    res.json(drafts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
