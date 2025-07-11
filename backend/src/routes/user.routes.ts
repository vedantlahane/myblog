import express from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserPosts,
  savePost,
  unsavePost,
  getSavedPosts,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
const router = express.Router();

// Basic CRUD operations
router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

// Public profile routes
router.get('/:id/posts', getUserPosts);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Protected routes
router.post('/:id/follow', authenticate, followUser);
router.delete('/:id/follow', authenticate, unfollowUser);
router.post('/posts/:postId/save', authenticate, savePost);
router.delete('/posts/:postId/save', authenticate, unsavePost);
router.get('/me/saved-posts', authenticate, getSavedPosts);
router.put('/me/profile', authenticate, updateProfile);
router.put('/me/password', authenticate, changePassword);
router.post('/me/avatar', authenticate, uploadAvatar);
router.delete('/me/avatar', authenticate, deleteAvatar);

export default router;
