import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  viewPost,
  getPostBySlug,
  getPublishedPosts
} from '../controllers/post.controller';

const router = express.Router();

// Create a new post
router.post('/', createPost);

// Get all posts (with optional filters)
router.get('/', getPosts);

// Get all published posts
router.get('/published', getPublishedPosts);

// Get a single post by ID
router.get('/:id', getPostById);

// Get a post by slug
router.get('/slug/:slug', getPostBySlug);

// Update a post by ID
router.put('/:id', updatePost);

// Delete a post by ID
router.delete('/:id', deletePost);

// Like a post
router.post('/:id/like', likePost);

// Unlike a post
router.post('/:id/unlike', unlikePost);

// Increment view count for a post
router.post('/:id/view', viewPost);

export default router;
