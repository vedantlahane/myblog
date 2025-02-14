// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const {
    createComment,
    getPostComments,
    updateComment,
    deleteComment
} = require('../controllers/commentController');

// Comment routes
router.post('/', createComment);
router.get('/post/:postId', getPostComments);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;