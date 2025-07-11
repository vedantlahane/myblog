import { Request, Response } from 'express';
import { Bookmark } from '../models/bookmark.model';
import { Post } from '../models/post.model';
import { isValidObjectId } from 'mongoose';

export const createBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId, collections, notes, progress } = req.body;
    const userId = req.user!.userId;

    // Validate post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({ user: userId, post: postId });
    if (existingBookmark) {
      res.status(400).json({ error: 'Post already bookmarked' });
      return;
    }

    const bookmark = await Bookmark.create({
      user: userId,
      post: postId,
      collections,
      notes,
      progress
    });

    await bookmark.populate('post', 'title slug coverImage author');
    await bookmark.populate('post.author', 'name avatarUrl');

    res.status(201).json(bookmark);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { 
      page = 1, 
      limit = 10, 
      collection,
      search 
    } = req.query;

    const query: any = { user: userId };
    
    if (collection) {
      query.collections = collection;
    }

    let bookmarks = await Bookmark.find(query)
      .populate({
        path: 'post',
        select: 'title slug excerpt coverImage author tags publishedAt',
        populate: [
          { path: 'author', select: 'name avatarUrl' },
          { path: 'tags', select: 'name slug' }
        ]
      })
      .sort({ bookmarkedAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    // Filter by search if provided
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      bookmarks = bookmarks.filter(bookmark => 
        searchRegex.test(bookmark.post.title) || 
        searchRegex.test(bookmark.post.excerpt || '') ||
        searchRegex.test(bookmark.notes || '')
      );
    }

    const total = await Bookmark.countDocuments(query);

    res.json({
      bookmarks,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalBookmarks: total
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getBookmarkById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const bookmarkId = req.params.id;

    const bookmark = await Bookmark.findOne({ 
      _id: bookmarkId, 
      user: userId 
    })
      .populate({
        path: 'post',
        select: 'title slug content excerpt coverImage author tags publishedAt',
        populate: [
          { path: 'author', select: 'name avatarUrl' },
          { path: 'tags', select: 'name slug' }
        ]
      });
    
    if (!bookmark) {
      res.status(404).json({ error: 'Bookmark not found' });
      return;
    }

    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const bookmarkId = req.params.id;
    const { collections, notes, progress } = req.body;

    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: bookmarkId, user: userId },
      { collections, notes, progress },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'post',
        select: 'title slug coverImage author',
        populate: { path: 'author', select: 'name avatarUrl' }
      });

    if (!bookmark) {
      res.status(404).json({ error: 'Bookmark not found' });
      return;
    }

    res.json(bookmark);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const bookmarkId = req.params.id;

    const bookmark = await Bookmark.findOneAndDelete({ 
      _id: bookmarkId, 
      user: userId 
    });

    if (!bookmark) {
      res.status(404).json({ error: 'Bookmark not found' });
      return;
    }

    res.json({ message: 'Bookmark deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const removeBookmarkByPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const postId = req.params.postId;

    const bookmark = await Bookmark.findOneAndDelete({ 
      user: userId, 
      post: postId 
    });

    if (!bookmark) {
      res.status(404).json({ error: 'Bookmark not found' });
      return;
    }

    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getUserCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const collections = await Bookmark.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$collections' },
      { 
        $group: { 
          _id: '$collections', 
          count: { $sum: 1 },
          lastUpdated: { $max: '$updatedAt' }
        } 
      },
      { $sort: { lastUpdated: -1 } }
    ]);

    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const checkBookmarkStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const postId = req.params.postId;

    const bookmark = await Bookmark.findOne({ 
      user: userId, 
      post: postId 
    });

    res.json({ 
      isBookmarked: !!bookmark,
      bookmark: bookmark || null
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
