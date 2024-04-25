const express = require('express');
const blogController = require('../controllers/blog.controller');

// backend/routes/post.routes.js

const router = express.Router();

// Route to get all blogs
router.get('/', blogController.getAllBlogs);

// Route to create a new blog
router.post('/', blogController.createBlog);

// Route to update a blog by its ID
router.put('/:id', blogController.updateBlog);

// Route to delete a blog by its ID
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
