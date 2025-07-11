"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBookmarkStatus = exports.getUserCollections = exports.removeBookmarkByPost = exports.deleteBookmark = exports.updateBookmark = exports.getBookmarkById = exports.getBookmarks = exports.createBookmark = void 0;
const bookmark_model_1 = require("../models/bookmark.model");
const post_model_1 = require("../models/post.model");
const mongoose_1 = __importDefault(require("mongoose"));
const createBookmark = async (req, res) => {
    try {
        const { postId, collections, notes, progress } = req.body;
        const userId = req.user.userId;
        // Validate post exists
        const post = await post_model_1.Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        // Check if bookmark already exists
        const existingBookmark = await bookmark_model_1.Bookmark.findOne({ user: userId, post: postId });
        if (existingBookmark) {
            res.status(400).json({ error: 'Post already bookmarked' });
            return;
        }
        const bookmark = await bookmark_model_1.Bookmark.create({
            user: userId,
            post: postId,
            collections,
            notes,
            progress
        });
        await bookmark.populate('post', 'title slug coverImage author');
        await bookmark.populate('post.author', 'name avatarUrl');
        res.status(201).json(bookmark);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createBookmark = createBookmark;
const getBookmarks = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10, collection, search } = req.query;
        const query = { user: userId };
        if (collection) {
            query.collections = collection;
        }
        let bookmarks = await bookmark_model_1.Bookmark.find(query)
            .populate({
            path: 'post',
            select: 'title slug excerpt coverImage author tags publishedAt',
            populate: [
                { path: 'author', select: 'name avatarUrl' },
                { path: 'tags', select: 'name slug' }
            ]
        })
            .sort({ bookmarkedAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        // Filter by search if provided
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            bookmarks = bookmarks.filter(bookmark => searchRegex.test(bookmark.post.title) ||
                searchRegex.test(bookmark.post.excerpt || '') ||
                searchRegex.test(bookmark.notes || ''));
        }
        const total = await bookmark_model_1.Bookmark.countDocuments(query);
        res.json({
            bookmarks,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalBookmarks: total
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getBookmarks = getBookmarks;
const getBookmarkById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const bookmarkId = req.params.id;
        const bookmark = await bookmark_model_1.Bookmark.findOne({
            _id: bookmarkId,
            user: userId
        })
            .populate({
            path: 'post',
            select: 'title slug content excerpt coverImage author tags publishedAt',
            populate: [
                { path: 'author', select: 'name avatarUrl' },
                { path: 'tags', select: 'name slug' }
            ]
        });
        if (!bookmark) {
            res.status(404).json({ error: 'Bookmark not found' });
            return;
        }
        res.json(bookmark);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getBookmarkById = getBookmarkById;
const updateBookmark = async (req, res) => {
    try {
        const userId = req.user.userId;
        const bookmarkId = req.params.id;
        const { collections, notes, progress } = req.body;
        const bookmark = await bookmark_model_1.Bookmark.findOneAndUpdate({ _id: bookmarkId, user: userId }, { collections, notes, progress }, { new: true, runValidators: true })
            .populate({
            path: 'post',
            select: 'title slug coverImage author',
            populate: { path: 'author', select: 'name avatarUrl' }
        });
        if (!bookmark) {
            res.status(404).json({ error: 'Bookmark not found' });
            return;
        }
        res.json(bookmark);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateBookmark = updateBookmark;
const deleteBookmark = async (req, res) => {
    try {
        const userId = req.user.userId;
        const bookmarkId = req.params.id;
        const bookmark = await bookmark_model_1.Bookmark.findOneAndDelete({
            _id: bookmarkId,
            user: userId
        });
        if (!bookmark) {
            res.status(404).json({ error: 'Bookmark not found' });
            return;
        }
        res.json({ message: 'Bookmark deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteBookmark = deleteBookmark;
const removeBookmarkByPost = async (req, res) => {
    try {
        const userId = req.user.userId;
        const postId = req.params.postId;
        const bookmark = await bookmark_model_1.Bookmark.findOneAndDelete({
            user: userId,
            post: postId
        });
        if (!bookmark) {
            res.status(404).json({ error: 'Bookmark not found' });
            return;
        }
        res.json({ message: 'Bookmark removed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.removeBookmarkByPost = removeBookmarkByPost;
const getUserCollections = async (req, res) => {
    try {
        const userId = req.user.userId;
        const collections = await bookmark_model_1.Bookmark.aggregate([
            { $match: { user: new mongoose_1.default.Types.ObjectId(userId) } },
            { $unwind: '$collections' },
            {
                $group: {
                    _id: '$collections',
                    count: { $sum: 1 },
                    lastUpdated: { $max: '$updatedAt' }
                }
            },
            { $sort: { lastUpdated: -1 } }
        ]);
        res.json(collections);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserCollections = getUserCollections;
const checkBookmarkStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const postId = req.params.postId;
        const bookmark = await bookmark_model_1.Bookmark.findOne({
            user: userId,
            post: postId
        });
        res.json({
            isBookmarked: !!bookmark,
            bookmark: bookmark || null
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.checkBookmarkStatus = checkBookmarkStatus;
