"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsByTag = exports.getPopularTags = exports.deleteTag = exports.updateTag = exports.getTagBySlug = exports.getTagById = exports.getTags = exports.createTag = void 0;
const tag_model_1 = require("../models/tag.model");
const post_model_1 = require("../models/post.model");
const mongoose_1 = require("mongoose");
// ... continuing from createTag
const createTag = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existingTag = await tag_model_1.Tag.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (existingTag) {
            res.status(400).json({ error: 'Tag already exists' });
            return;
        }
        const tag = await tag_model_1.Tag.create({ name, description });
        res.status(201).json(tag);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createTag = createTag;
const getTags = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = 'name' } = req.query;
        const tags = await tag_model_1.Tag.find()
            .sort(sort)
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await tag_model_1.Tag.countDocuments();
        res.json({
            tags,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalTags: total
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getTags = getTags;
const getTagById = async (req, res) => {
    try {
        if (!(0, mongoose_1.isValidObjectId)(req.params.id)) {
            res.status(400).json({ error: 'Invalid tag ID' });
            return;
        }
        const tag = await tag_model_1.Tag.findById(req.params.id);
        if (!tag) {
            res.status(404).json({ error: 'Tag not found' });
            return;
        }
        res.json(tag);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getTagById = getTagById;
const getTagBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const tag = await tag_model_1.Tag.findOne({ slug });
        if (!tag) {
            res.status(404).json({ error: 'Tag not found' });
            return;
        }
        res.json(tag);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getTagBySlug = getTagBySlug;
const updateTag = async (req, res) => {
    try {
        const { name, description } = req.body;
        const tag = await tag_model_1.Tag.findByIdAndUpdate(req.params.id, { name, description }, { new: true, runValidators: true });
        if (!tag) {
            res.status(404).json({ error: 'Tag not found' });
            return;
        }
        res.json(tag);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateTag = updateTag;
const deleteTag = async (req, res) => {
    try {
        const tagId = req.params.id;
        // Check if tag is being used by any posts
        const postsUsingTag = await post_model_1.Post.countDocuments({ tags: tagId });
        if (postsUsingTag > 0) {
            res.status(400).json({
                error: `Cannot delete tag. It's being used by ${postsUsingTag} posts.`
            });
            return;
        }
        const tag = await tag_model_1.Tag.findByIdAndDelete(tagId);
        if (!tag) {
            res.status(404).json({ error: 'Tag not found' });
            return;
        }
        res.json({ message: 'Tag deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteTag = deleteTag;
const getPopularTags = async (_req, res) => {
    try {
        const tags = await tag_model_1.Tag.find()
            .sort({ postCount: -1 })
            .limit(10);
        res.json(tags);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPopularTags = getPopularTags;
const getPostsByTag = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const tagId = req.params.id;
        const posts = await post_model_1.Post.find({
            tags: tagId,
            status: 'published'
        })
            .populate('author', 'name avatarUrl')
            .populate('tags', 'name slug')
            .sort({ publishedAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await post_model_1.Post.countDocuments({
            tags: tagId,
            status: 'published'
        });
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
exports.getPostsByTag = getPostsByTag;
