// ✅ post.routes.ts (Router)
import express from 'express';
import {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
  addComment,
  getComments
} from '../controllers/post.controller';

const router = express.Router();

router.post('/', createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/comments', addComment);
router.get('/:id/comments', getComments);
// router.delete('/:id/comments/:commentId', deleteComment);

export default router;