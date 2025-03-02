// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllPosts,
    getPostById,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    getFeaturedPosts,
    toggleLike
} = require('../controllers/postController');

// Important: Order matters! Put more specific routes first
// Featured posts
router.get('/featured', getFeaturedPosts);

// Slug-based route
router.get('/slug/:slug', getPostBySlug);

// Like post
router.post('/:id/like', toggleLike);

// CRUD operations
router.route('/')
    .get(getAllPosts)
    .post(createPost);

router.route('/:id')
    .get(getPostById)
    .put(updatePost)
    .delete(deletePost);

module.exports = router;