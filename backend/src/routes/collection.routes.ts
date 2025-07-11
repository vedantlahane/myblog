import express from 'express';
import {
  createCollection,
  getCollections,
  getCollectionById,
  getCollectionBySlug,
  updateCollection,
  deleteCollection,
  addPostToCollection,
  removePostFromCollection,
  reorderCollectionPosts,
  getUserCollections
} from '../controllers/collection.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getCollections);
router.get('/slug/:slug', getCollectionBySlug);
router.get('/:id', getCollectionById);

// Protected routes
router.post('/', authenticate, createCollection);
router.get('/user/my-collections', authenticate, getUserCollections);
router.put('/:id', authenticate, updateCollection);
router.delete('/:id', authenticate, deleteCollection);
router.post('/add-post', authenticate, addPostToCollection);
router.delete('/:collectionId/posts/:postId', authenticate, removePostFromCollection);
router.put('/:id/reorder', authenticate, reorderCollectionPosts);

export default router;
