import express from 'express';
import { body } from 'express-validator';
import {
  createPost,
  getPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getTrendingPosts,
  getRelatedPosts
} from '../controllers/post.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createPostLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Validation rules
const postValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('tags').isArray({ min: 1 }).withMessage('At least one tag is required'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
];

// Public routes
router.get('/', optionalAuth, getPosts);
router.get('/trending', getTrendingPosts);
router.get('/slug/:slug', optionalAuth, getPostBySlug);
router.get('/:id', optionalAuth, getPostById);
router.get('/:id/related', getRelatedPosts);

// Protected routes
router.use(authenticate);
router.post('/', createPostLimiter, postValidation, validate, createPost);
router.put('/:id', postValidation, validate, updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.delete('/:id/like', unlikePost);

export default router;