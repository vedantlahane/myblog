// controllers/commentController.js
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Create new comment
const createComment = async (req, res) => {
    try {
        const { postId, content, parentCommentId } = req.body;

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = new Comment({
            content,
            post: postId,
            author: {
                name: req.body.authorName,
                email: req.body.authorEmail,
                avatar: req.body.authorAvatar
            },
            parentComment: parentCommentId || null
        });

        const savedComment = await comment.save();
        res.status(201).json(savedComment);
    } catch (error) {
        res.status(400).json({
            message: 'Error creating comment',
            error: error.message
        });
    }
};

// Get comments for a post
const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({
            post: postId,
            parentComment: null,
            status: 'approved',
            isDeleted: false
        })
        .sort({ createdAt: -1 })
        .populate('replies');

        res.json(comments);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching comments',
            error: error.message
        });
    }
};

// Update comment
const updateComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Only update content
        comment.content = req.body.content;
        const updatedComment = await comment.save();

        res.json(updatedComment);
    } catch (error) {
        res.status(400).json({
            message: 'Error updating comment',
            error: error.message
        });
    }
};

// Delete comment
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        await comment.softDelete();
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting comment',
            error: error.message
        });
    }
};

module.exports = {
    createComment,
    getPostComments,
    updateComment,
    deleteComment
};