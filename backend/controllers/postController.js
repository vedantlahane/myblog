// controllers/postController.js
const Post = require('../models/Post');

// Get all posts
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching posts',
            error: error.message
        });
    }
};

// Get single post
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching post',
            error: error.message
        });
    }
};

// Create new post
const createPost = async (req, res) => {
    try {
        const post = new Post({
            title: req.body.title,
            subtitle: req.body.subtitle,
            content: req.body.content,
            author: {
                name: req.body.authorName,
                email: req.body.authorEmail
            },
            tags: req.body.tags,
            thumbnail: req.body.thumbnail
        });

        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(400).json({
            message: 'Error creating post',
            error: error.message
        });
    }
};

// Update post
const updatePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        res.status(400).json({
            message: 'Error updating post',
            error: error.message
        });
    }
};

// Delete post
const deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting post',
            error: error.message
        });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};