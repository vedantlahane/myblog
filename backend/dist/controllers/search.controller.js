"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalSearch = exports.searchTags = exports.searchUsers = exports.searchPosts = void 0;
const post_model_1 = require("../models/post.model");
const user_model_1 = require("../models/user.model");
const tag_model_1 = require("../models/tag.model");
const searchPosts = async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        if (!q) {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }
        const searchQuery = {
            $and: [
                { status: 'published' },
                {
                    $or: [
                        { title: { $regex: q, $options: 'i' } },
                        { content: { $regex: q, $options: 'i' } },
                        { excerpt: { $regex: q, $options: 'i' } }
                    ]
                }
            ]
        };
        const posts = await post_model_1.Post.find(searchQuery)
            .populate('author', 'name avatarUrl')
            .populate('tags', 'name slug')
            .sort({ publishedAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await post_model_1.Post.countDocuments(searchQuery);
        res.json({
            posts,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalResults: total
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.searchPosts = searchPosts;
const searchUsers = async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        if (!q) {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }
        const searchQuery = {
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { bio: { $regex: q, $options: 'i' } }
            ]
        };
        const users = await user_model_1.User.find(searchQuery)
            .select('-password')
            .sort({ followerCount: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await user_model_1.User.countDocuments(searchQuery);
        res.json({
            users: users.map(user => user.toSafeObject()),
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalResults: total
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.searchUsers = searchUsers;
const searchTags = async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        if (!q) {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }
        const searchQuery = {
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ]
        };
        const tags = await tag_model_1.Tag.find(searchQuery)
            .sort({ postCount: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await tag_model_1.Tag.countDocuments(searchQuery);
        res.json({
            tags,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalResults: total
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.searchTags = searchTags;
const globalSearch = async (req, res) => {
    try {
        const { q, limit = 5 } = req.query;
        if (!q) {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }
        const [posts, users, tags] = await Promise.all([
            post_model_1.Post.find({
                status: 'published',
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { content: { $regex: q, $options: 'i' } }
                ]
            })
                .populate('author', 'name avatarUrl')
                .limit(Number(limit))
                .sort({ publishedAt: -1 }),
            user_model_1.User.find({
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { bio: { $regex: q, $options: 'i' } }
                ]
            })
                .select('-password')
                .limit(Number(limit))
                .sort({ followerCount: -1 }),
            tag_model_1.Tag.find({
                name: { $regex: q, $options: 'i' }
            })
                .limit(Number(limit))
                .sort({ postCount: -1 })
        ]);
        res.json({
            posts,
            users: users.map(user => user.toSafeObject()),
            tags
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.globalSearch = globalSearch;
