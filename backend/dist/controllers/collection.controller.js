"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCollections = exports.reorderCollectionPosts = exports.removePostFromCollection = exports.addPostToCollection = exports.deleteCollection = exports.updateCollection = exports.getCollectionBySlug = exports.getCollectionById = exports.getCollections = exports.createCollection = void 0;
const collection_model_1 = require("../models/collection.model");
const post_model_1 = require("../models/post.model");
const createCollection = async (req, res) => {
    try {
        const { title, description, coverImage, isPublic = true } = req.body;
        const authorId = req.user.userId;
        const collection = await collection_model_1.Collection.create({
            title,
            description,
            author: authorId,
            coverImage,
            isPublic,
            posts: []
        });
        await collection.populate('author', 'name avatarUrl');
        res.status(201).json(collection);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createCollection = createCollection;
const getCollections = async (req, res) => {
    try {
        const { page = 1, limit = 10, author, isPublic, search } = req.query;
        const query = {};
        if (author) {
            query.author = author;
        }
        if (isPublic !== undefined) {
            query.isPublic = isPublic === 'true';
        }
        else {
            // Default to public collections only
            query.isPublic = true;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const collections = await collection_model_1.Collection.find(query)
            .populate('author', 'name avatarUrl')
            .populate({
            path: 'posts.post',
            select: 'title slug coverImage publishedAt',
            populate: { path: 'author', select: 'name avatarUrl' }
        })
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await collection_model_1.Collection.countDocuments(query);
        res.json({
            collections,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalCollections: total
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCollections = getCollections;
const getCollectionById = async (req, res) => {
    try {
        const collection = await collection_model_1.Collection.findById(req.params.id)
            .populate('author', 'name avatarUrl bio')
            .populate({
            path: 'posts.post',
            select: 'title slug excerpt coverImage publishedAt tags',
            populate: [
                { path: 'author', select: 'name avatarUrl' },
                { path: 'tags', select: 'name slug' }
            ]
        });
        if (!collection) {
            res.status(404).json({ error: 'Collection not found' });
            return;
        }
        // Check if user can view private collection
        if (!collection.isPublic && (!req.user || collection.author._id.toString() !== req.user.userId)) {
            res.status(403).json({ error: 'This collection is private' });
            return;
        }
        // Sort posts by order
        collection.posts.sort((a, b) => a.order - b.order);
        res.json(collection);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCollectionById = getCollectionById;
const getCollectionBySlug = async (req, res) => {
    try {
        const collection = await collection_model_1.Collection.findBySlug(req.params.slug);
        if (!collection) {
            res.status(404).json({ error: 'Collection not found' });
            return;
        }
        // Populate the fields
        await collection.populate('author', 'name avatarUrl bio');
        await collection.populate({
            path: 'posts.post',
            select: 'title slug excerpt coverImage publishedAt tags',
            populate: [
                { path: 'author', select: 'name avatarUrl' },
                { path: 'tags', select: 'name slug' }
            ]
        });
        // Check if user can view private collection
        if (!collection.isPublic && (!req.user || collection.author._id.toString() !== req.user.userId)) {
            res.status(403).json({ error: 'This collection is private' });
            return;
        }
        // Sort posts by order
        collection.posts.sort((a, b) => a.order - b.order);
        res.json(collection);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCollectionBySlug = getCollectionBySlug;
const updateCollection = async (req, res) => {
    try {
        const collectionId = req.params.id;
        const { title, description, coverImage, isPublic, isComplete } = req.body;
        const collection = await collection_model_1.Collection.findById(collectionId);
        if (!collection) {
            res.status(404).json({ error: 'Collection not found' });
            return;
        }
        // Only allow author to update
        if (collection.author.toString() !== req.user.userId) {
            res.status(403).json({ error: 'You can only update your own collections' });
            return;
        }
        const updatedCollection = await collection_model_1.Collection.findByIdAndUpdate(collectionId, { title, description, coverImage, isPublic, isComplete }, { new: true, runValidators: true })
            .populate('author', 'name avatarUrl')
            .populate({
            path: 'posts.post',
            select: 'title slug coverImage publishedAt'
        });
        res.json(updatedCollection);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateCollection = updateCollection;
const deleteCollection = async (req, res) => {
    try {
        const collectionId = req.params.id;
        const collection = await collection_model_1.Collection.findById(collectionId);
        if (!collection) {
            res.status(404).json({ error: 'Collection not found' });
            return;
        }
        // Only allow author to delete
        if (collection.author.toString() !== req.user.userId) {
            res.status(403).json({ error: 'You can only delete your own collections' });
            return;
        }
        await collection_model_1.Collection.findByIdAndDelete(collectionId);
        res.json({ message: 'Collection deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteCollection = deleteCollection;
const addPostToCollection = async (req, res) => {
    try {
        const { collectionId, postId, order } = req.body;
        const collection = await collection_model_1.Collection.findById(collectionId);
        if (!collection) {
            res.status(404).json({ error: 'Collection not found' });
            return;
        }
        // Only allow author to modify
        if (collection.author.toString() !== req.user.userId) {
            res.status(403).json({ error: 'You can only modify your own collections' });
            return;
        }
        // Verify post exists
        const post = await post_model_1.Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        // Check if post is already in collection
        const existingPost = collection.posts.find(p => p.post.toString() === postId);
        if (existingPost) {
            res.status(400).json({ error: 'Post is already in this collection' });
            return;
        }
        // Add post to collection
        const newOrder = order || collection.posts.length + 1;
        collection.posts.push({ post: postId, order: newOrder });
        await collection.save();
        await collection.populate({
            path: 'posts.post',
            select: 'title slug coverImage publishedAt'
        });
        res.json(collection);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.addPostToCollection = addPostToCollection;
const removePostFromCollection = async (req, res) => {
    try {
        const { collectionId, postId } = req.params;
        const collection = await collection_model_1.Collection.findById(collectionId);
        if (!collection) {
            res.status(404).json({ error: 'Collection not found' });
            return;
        }
        // Only allow author to modify
        if (collection.author.toString() !== req.user.userId) {
            res.status(403).json({ error: 'You can only modify your own collections' });
            return;
        }
        // Remove post from collection
        collection.posts = collection.posts.filter(p => p.post.toString() !== postId);
        await collection.save();
        await collection.populate({
            path: 'posts.post',
            select: 'title slug coverImage publishedAt'
        });
        res.json(collection);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.removePostFromCollection = removePostFromCollection;
const reorderCollectionPosts = async (req, res) => {
    try {
        const collectionId = req.params.id;
        const { posts } = req.body; // Array of { postId, order }
        const collection = await collection_model_1.Collection.findById(collectionId);
        if (!collection) {
            res.status(404).json({ error: 'Collection not found' });
            return;
        }
        // Only allow author to modify
        if (collection.author.toString() !== req.user.userId) {
            res.status(403).json({ error: 'You can only modify your own collections' });
            return;
        }
        // Update post orders
        posts.forEach((updatePost) => {
            const existingPost = collection.posts.find(p => p.post.toString() === updatePost.postId);
            if (existingPost) {
                existingPost.order = updatePost.order;
            }
        });
        await collection.save();
        await collection.populate({
            path: 'posts.post',
            select: 'title slug coverImage publishedAt'
        });
        res.json(collection);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.reorderCollectionPosts = reorderCollectionPosts;
const getUserCollections = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { includePrivate = true } = req.query;
        const query = { author: userId };
        if (!includePrivate) {
            query.isPublic = true;
        }
        const collections = await collection_model_1.Collection.find(query)
            .populate({
            path: 'posts.post',
            select: 'title slug coverImage'
        })
            .sort({ createdAt: -1 });
        res.json(collections);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserCollections = getUserCollections;
