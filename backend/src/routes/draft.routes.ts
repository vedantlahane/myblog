import express from 'express';
import {
  createDraft,
  getDrafts,
  getDraftById,
  updateDraft,
  deleteDraft,
  publishDraft,
  getDraftVersions
} from '../controllers/draft.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.post('/', authenticate, createDraft);
router.get('/', authenticate, getDrafts);
router.get('/:id', authenticate, getDraftById);
router.put('/:id', authenticate, updateDraft);
router.delete('/:id', authenticate, deleteDraft);
router.post('/:id/publish', authenticate, publishDraft);
router.get('/versions/:postId', authenticate, getDraftVersions);

export default router;
