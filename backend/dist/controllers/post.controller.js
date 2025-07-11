"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelatedPosts = exports.getTrendingPosts = exports.unlikePost = exports.likePost = exports.deletePost = exports.updatePost = exports.getPostBySlug = exports.getPostById = exports.getPosts = exports.createPost = void 0;
const post_model_1 = require("../models/post.model");
const tag_model_1 = require("../models/tag.model");
const notification_model_1 = require("../models/notification.model");
const mongoose_1 = require("mongoose");
const user_model_1 = require("../models/user.model");
const createPost = async (req, res) => {
    try {
        const { title, content, excerpt, coverImage, tags, status } = req.body;
        const authorId = req.user.userId;
        // Validate tags
        if (!tags || tags.length === 0) {
            res.status(400).json({ error: 'At least one tag is required' });
            return;
        }
        const post = await post_model_1.Post.create({
            title,
            content,
            excerpt,
            coverImage,
            tags,
            status,
            author: authorId
        });
        // Update tag post counts
        await Promise.all(tags.map((tagId) => tag_model_1.Tag.incrementPostCount(tagId)));
        // Notify followers if published
        if (status === 'published') {
            const author = await user_model_1.User.findById(authorId);
            if (author) {
                const notifications = author.followers.map(followerId => ({
                    recipient: followerId,
                    sender: authorId,
                    type: 'post',
                    message: `${author.name} published a new post: ${title}`,
                    entityType: 'post',
                    entityId: post._id
                }));
                await notification_model_1.Notification.insertMany(notifications);
            }
        }
        const populatedPost = await post_model_1.Post.findById(post._id)
            .populate('author', 'name avatarUrl')
            .populate('tags', 'name slug');
        res.status(201).json(populatedPost);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createPost = createPost;
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-publishedAt', status = 'published' } = req.query;
        const query = status ? { status } : {};
        const posts = await post_model_1.Post.find(query)
            .populate('author', 'name avatarUrl')
            .populate('tags', 'name slug')
            .sort(sort)
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await post_model_1.Post.countDocuments(query);
        res.json({
            posts,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalPosts: total
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPosts = getPosts;
const getPostById = async (req, res) => {
    try {
        if (!(0, mongoose_1.isValidObjectId)(req.params.id)) {
            res.status(400).json({ error: 'Invalid post ID' });
            return;
        }
        const post = await post_model_1.Post.findById(req.params.id)
            .populate('author', 'name avatarUrl bio')
            .populate('tags', 'name slug')
            .populate({
            path: 'comments',
            populate: { path: 'author', select: 'name avatarUrl' }
        });
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        // Increment view count
        post.viewCount += 1;
        await post.save();
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPostById = getPostById;
const getPostBySlug = async (req, res) => {
    try {
        const post = await post_model_1.Post.findBySlug(req.params.slug);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        await post.populate('author', 'name avatarUrl bio');
        await post.populate('tags', 'name slug');
        // Increment view count
        post.viewCount += 1;
        await post.save();
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPostBySlug = getPostBySlug;
const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId;
        const post = await post_model_1.Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        if (post.author.toString() !== userId && !req.user.isAdmin) {
            res.status(403).json({ error: 'You can only edit your own posts' });
            return;
        }
        const oldTags = post.tags;
        const newTags = req.body.tags || oldTags;
        const updatedPost = await post_model_1.Post.findByIdAndUpdate(postId, req.body, { new: true, runValidators: true });
        // Update tag counts if tags changed
        if (JSON.stringify(oldTags) !== JSON.stringify(newTags)) {
            await Promise.all([
                ...oldTags.filter((tag) => !newTags.includes(tag))
                    .map((tag) => tag_model_1.Tag.decrementPostCount(tag)),
                ...newTags.filter((tag) => !oldTags.includes(tag))
                    .map((tag) => tag_model_1.Tag.incrementPostCount(tag))
            ]);
        }
        await updatedPost.populate('author', 'name avatarUrl');
        await updatedPost.populate('tags', 'name slug');
        res.json(updatedPost);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId;
        const post = await post_model_1.Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        if (post.author.toString() !== userId && !req.user.isAdmin) {
            res.status(403).json({ error: 'You can only delete your own posts' });
            return;
        }
        await post_model_1.Post.findByIdAndDelete(postId);
        // Update tag counts
        await Promise.all(post.tags.map(tag => tag_model_1.Tag.decrementPostCount(tag)));
        res.json({ message: 'Post deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deletePost = deletePost;
const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId;
        const post = await post_model_1.Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        if (post.likes.some((id) => id.equals(userId))) {
            res.status(400).json({ error: 'Post already liked' });
            return;
        }
        post.likes.push(userId);
        await post.save();
        // Create notification
        if (post.author.toString() !== userId) {
            await notification_model_1.Notification.create({
                recipient: post.author,
                sender: userId,
                type: 'like',
                message: 'liked your post',
                entityType: 'post',
                entityId: post._id
            });
        }
        res.json({ message: 'Post liked successfully', likes: post.likes.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.likePost = likePost;
const unlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId;
        const post = await post_model_1.Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        post.likes = post.likes.filter((id) => !id.equals(userId));
        await post.save();
        res.json({ message: 'Post unliked successfully', likes: post.likes.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.unlikePost = unlikePost;
const getTrendingPosts = async (_req, res) => {
    try {
        const posts = await post_model_1.Post.find({ status: 'published' })
            .populate('author', 'name avatarUrl')
            .populate('tags', 'name slug')
            .sort({ viewCount: -1, likeCount: -1 })
            .limit(10);
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getTrendingPosts = getTrendingPosts;
const getRelatedPosts = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await post_model_1.Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        const relatedPosts = await post_model_1.Post.find({
            _id: { $ne: postId },
            tags: { $in: post.tags },
            status: 'published'
        })
            .populate('author', 'name avatarUrl')
            .populate('tags', 'name slug')
            .limit(5);
        res.json(relatedPosts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getRelatedPosts = getRelatedPosts;
