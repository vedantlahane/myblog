import { Request, Response } from 'express';
import { Collection } from '../models/collection.model';
import { Post } from '../models/post.model';
import { isValidObjectId } from 'mongoose';

export const createCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, coverImage, isPublic = true } = req.body;
    const authorId = req.user!.userId;

    const collection = await Collection.create({
      title,
      description,
      author: authorId,
      coverImage,
      isPublic,
      posts: []
    });

    await collection.populate('author', 'name avatarUrl');
    res.status(201).json(collection);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      author,
      isPublic,
      search 
    } = req.query;

    const query: any = {};
    
    if (author) {
      query.author = author;
    }
    
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    } else {
      // Default to public collections only
      query.isPublic = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const collections = await Collection.find(query)
      .populate('author', 'name avatarUrl')
      .populate({
        path: 'posts.post',
        select: 'title slug coverImage publishedAt',
        populate: { path: 'author', select: 'name avatarUrl' }
      })
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Collection.countDocuments(query);

    res.json({
      collections,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalCollections: total
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCollectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('author', 'name avatarUrl bio')
      .populate({
        path: 'posts.post',
        select: 'title slug excerpt coverImage publishedAt tags',
        populate: [
          { path: 'author', select: 'name avatarUrl' },
          { path: 'tags', select: 'name slug' }
        ]
      });
    
    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    // Check if user can view private collection
    if (!collection.isPublic && (!req.user || collection.author._id.toString() !== req.user.userId)) {
      res.status(403).json({ error: 'This collection is private' });
      return;
    }

    // Sort posts by order
    collection.posts.sort((a: any, b: any) => a.order - b.order);

    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCollectionBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const collection = await Collection.findBySlug(req.params.slug);
    
    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    // Populate the fields
    await collection.populate('author', 'name avatarUrl bio');
    await collection.populate({
      path: 'posts.post',
      select: 'title slug excerpt coverImage publishedAt tags',
      populate: [
        { path: 'author', select: 'name avatarUrl' },
        { path: 'tags', select: 'name slug' }
      ]
    });

    // Check if user can view private collection
    if (!collection.isPublic && (!req.user || collection.author._id.toString() !== req.user.userId)) {
      res.status(403).json({ error: 'This collection is private' });
      return;
    }

    // Sort posts by order
    collection.posts.sort((a: any, b: any) => a.order - b.order);

    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const collectionId = req.params.id;
    const { title, description, coverImage, isPublic, isComplete } = req.body;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    // Only allow author to update
    if (collection.author.toString() !== req.user!.userId) {
      res.status(403).json({ error: 'You can only update your own collections' });
      return;
    }

    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      { title, description, coverImage, isPublic, isComplete },
      { new: true, runValidators: true }
    )
      .populate('author', 'name avatarUrl')
      .populate({
        path: 'posts.post',
        select: 'title slug coverImage publishedAt'
      });

    res.json(updatedCollection);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const collectionId = req.params.id;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    // Only allow author to delete
    if (collection.author.toString() !== req.user!.userId) {
      res.status(403).json({ error: 'You can only delete your own collections' });
      return;
    }

    await Collection.findByIdAndDelete(collectionId);
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const addPostToCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionId, postId, order } = req.body;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    // Only allow author to modify
    if (collection.author.toString() !== req.user!.userId) {
      res.status(403).json({ error: 'You can only modify your own collections' });
      return;
    }

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Check if post is already in collection
    const existingPost = collection.posts.find(p => p.post.toString() === postId);
    if (existingPost) {
      res.status(400).json({ error: 'Post is already in this collection' });
      return;
    }

    // Add post to collection
    const newOrder = order || collection.posts.length + 1;
    collection.posts.push({ post: postId, order: newOrder });
    await collection.save();

    await collection.populate({
      path: 'posts.post',
      select: 'title slug coverImage publishedAt'
    });

    res.json(collection);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const removePostFromCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionId, postId } = req.params;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    // Only allow author to modify
    if (collection.author.toString() !== req.user!.userId) {
      res.status(403).json({ error: 'You can only modify your own collections' });
      return;
    }

    // Remove post from collection
    collection.posts = collection.posts.filter(p => p.post.toString() !== postId);
    await collection.save();

    await collection.populate({
      path: 'posts.post',
      select: 'title slug coverImage publishedAt'
    });

    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const reorderCollectionPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const collectionId = req.params.id;
    const { posts } = req.body; // Array of { postId, order }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    // Only allow author to modify
    if (collection.author.toString() !== req.user!.userId) {
      res.status(403).json({ error: 'You can only modify your own collections' });
      return;
    }

    // Update post orders
    posts.forEach((updatePost: any) => {
      const existingPost = collection.posts.find(p => p.post.toString() === updatePost.postId);
      if (existingPost) {
        existingPost.order = updatePost.order;
      }
    });

    await collection.save();

    await collection.populate({
      path: 'posts.post',
      select: 'title slug coverImage publishedAt'
    });

    res.json(collection);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getUserCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { includePrivate = true } = req.query;

    const query: any = { author: userId };
    if (!includePrivate) {
      query.isPublic = true;
    }

    const collections = await Collection.find(query)
      .populate({
        path: 'posts.post',
        select: 'title slug coverImage'
      })
      .sort({ createdAt: -1 });

    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
