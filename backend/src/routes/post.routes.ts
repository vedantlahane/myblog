import express from 'express';
import  { createPost, getPosts, getPostById,updatePost } from '../controllers/post.controller';

const router = express.Router();

// Route to create a new post
router.post('/', createPost);   
// Route to get all posts
router.get('/', getPosts);
// Route to get a post by ID
// router.get('/:id', getPostById);
// Route to update a post by ID
// router.put('/:id', updatePost);


// Export the router to be used in the main app
export default router;
