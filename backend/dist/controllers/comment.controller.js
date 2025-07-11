"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentReplies = exports.unlikeComment = exports.likeComment = exports.deleteComment = exports.updateComment = exports.getComments = exports.createComment = void 0;
const comment_model_1 = require("../models/comment.model");
const post_model_1 = require("../models/post.model");
const notification_model_1 = require("../models/notification.model");
const mongoose_1 = require("mongoose");
const createComment = async (req, res) => {
    try {
        const { content, postId, parentId } = req.body;
        const authorId = req.user.userId;
        if (!content || !postId) {
            res.status(400).json({ error: 'Content and postId are required' });
            return;
        }
        const post = await post_model_1.Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        const comment = await comment_model_1.Comment.create({
            content,
            author: authorId,
            post: postId,
            parent: parentId
        });
        await comment.populate('author', 'name avatarUrl');
        // Create notification for post author
        if (post.author.toString() !== authorId) {
            await notification_model_1.Notification.create({
                recipient: post.author,
                sender: authorId,
                type: 'comment',
                message: parentId ? 'replied to a comment on your post' : 'commented on your post',
                entityType: 'comment',
                entityId: comment._id
            });
        }
        // If replying to a comment, notify parent comment author
        if (parentId) {
            const parentComment = await comment_model_1.Comment.findById(parentId);
            if (parentComment && parentComment.author.toString() !== authorId) {
                await notification_model_1.Notification.create({
                    recipient: parentComment.author,
                    sender: authorId,
                    type: 'comment',
                    message: 'replied to your comment',
                    entityType: 'comment',
                    entityId: comment._id
                });
            }
        }
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createComment = createComment;
const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        if (!(0, mongoose_1.isValidObjectId)(postId)) {
            res.status(400).json({ error: 'Invalid post ID' });
            return;
        }
        const comments = await comment_model_1.Comment.find({
            post: postId,
            parent: null,
            isDeleted: false
        })
            .populate('author', 'name avatarUrl')
            .populate({
            path: 'replies',
            match: { isDeleted: false },
            populate: { path: 'author', select: 'name avatarUrl' }
        })
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await comment_model_1.Comment.countDocuments({
            post: postId,
            parent: null,
            isDeleted: false
        });
        res.json({
            comments,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalComments: total
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getComments = getComments;
const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;
        const comment = await comment_model_1.Comment.findById(id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        if (comment.author.toString() !== userId) {
            res.status(403).json({ error: 'You can only edit your own comments' });
            return;
        }
        comment.content = content;
        await comment.save();
        await comment.populate('author', 'name avatarUrl');
        res.json(comment);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateComment = updateComment;
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const comment = await comment_model_1.Comment.findById(id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        if (comment.author.toString() !== userId && !req.user.isAdmin) {
            res.status(403).json({ error: 'You can only delete your own comments' });
            return;
        }
        // Soft delete to preserve thread structure
        comment.isDeleted = true;
        comment.content = '[This comment has been deleted]';
        await comment.save();
        res.json({ message: 'Comment deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteComment = deleteComment;
const likeComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const comment = await comment_model_1.Comment.findById(id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        if (comment.likes.includes(userId)) {
            res.status(400).json({ error: 'Comment already liked' });
            return;
        }
        comment.likes.push(userId);
        await comment.save();
        res.json({ message: 'Comment liked successfully', likes: comment.likes.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.likeComment = likeComment;
const unlikeComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const comment = await comment_model_1.Comment.findById(id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        comment.likes = comment.likes.filter(id => !id.equals(userId));
        await comment.save();
        res.json({ message: 'Comment unliked successfully', likes: comment.likes.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.unlikeComment = unlikeComment;
const getCommentReplies = async (req, res) => {
    try {
        const { id } = req.params;
        const replies = await comment_model_1.Comment.find({
            parent: id,
            isDeleted: false
        })
            .populate('author', 'name avatarUrl')
            .sort({ createdAt: 1 });
        res.json(replies);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCommentReplies = getCommentReplies;
