import express from 'express';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  getCommentReplies,
} from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/post/:postId', getComments);
router.get('/:id/replies', getCommentReplies);

// Protected routes
router.use(authenticate);
router.post('/', createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);
router.post('/:id/like', likeComment);
router.delete('/:id/like', unlikeComment);

export default router;