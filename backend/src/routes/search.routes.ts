import express from 'express';
import {
  searchPosts,
  searchUsers,
  searchTags,
  globalSearch,
} from '../controllers/search.controller';

const router = express.Router();

router.get('/posts', searchPosts);
router.get('/users', searchUsers);
router.get('/tags', searchTags);
router.get('/all', globalSearch);

export default router;