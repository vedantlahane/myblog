import express from 'express';
import {
  createBookmark,
  getBookmarks,
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
  removeBookmarkByPost,
  getUserCollections,
  checkBookmarkStatus
} from '../controllers/bookmark.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.post('/', authenticate, createBookmark);
router.get('/', authenticate, getBookmarks);
router.get('/collections', authenticate, getUserCollections);
router.get('/check/:postId', authenticate, checkBookmarkStatus);
router.get('/:id', authenticate, getBookmarkById);
router.put('/:id', authenticate, updateBookmark);
router.delete('/:id', authenticate, deleteBookmark);
router.delete('/post/:postId', authenticate, removeBookmarkByPost);

export default router;
