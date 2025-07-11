import express from 'express';
import {
  uploadMedia,
  uploadMultipleMedia,
  getMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  getUserMedia
} from '../controllers/media.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Protected routes (require authentication)
router.post('/upload', authenticate, uploadMedia);
router.post('/upload/multiple', authenticate, uploadMultipleMedia);
router.get('/my-media', authenticate, getUserMedia);
router.get('/', authenticate, getMedia);
router.get('/:id', authenticate, getMediaById);
router.put('/:id', authenticate, updateMedia);
router.delete('/:id', authenticate, deleteMedia);

export default router;
