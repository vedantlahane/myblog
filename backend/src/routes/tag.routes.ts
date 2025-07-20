import express from 'express';
import {
  getTags,
  getTagById,
  getTagBySlug,
  createTag,
  updateTag,
  deleteTag,
  getPopularTags,
  getPostsByTag,
} from '../controllers/tag.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', getTags);
router.get('/popular', getPopularTags);
router.get('/slug/:slug', getTagBySlug);
router.get('/:id', getTagById);
router.get('/:id/posts', getPostsByTag);

// Admin only
router.use(authenticate, authorize('admin'));
router.post('/', createTag);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

export default router;