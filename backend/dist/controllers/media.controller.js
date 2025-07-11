"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserMedia = exports.deleteMedia = exports.updateMedia = exports.getMediaById = exports.getMedia = exports.uploadMultipleMedia = exports.uploadMedia = void 0;
const media_model_1 = require("../models/media.model");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/media';
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|mp4|mp3|wav/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
const uploadMedia = async (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        try {
            const { altText, description } = req.body;
            const media = await media_model_1.Media.create({
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                url: `/uploads/media/${req.file.filename}`,
                uploadedBy: req.user.userId,
                altText,
                description
            });
            res.status(201).json(media);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};
exports.uploadMedia = uploadMedia;
const uploadMultipleMedia = async (req, res) => {
    upload.array('files', 10)(req, res, async (err) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({ error: 'No files uploaded' });
            return;
        }
        try {
            const mediaPromises = req.files.map(file => media_model_1.Media.create({
                filename: file.filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                url: `/uploads/media/${file.filename}`,
                uploadedBy: req.user.userId
            }));
            const mediaFiles = await Promise.all(mediaPromises);
            res.status(201).json(mediaFiles);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};
exports.uploadMultipleMedia = uploadMultipleMedia;
const getMedia = async (req, res) => {
    try {
        const { page = 1, limit = 20, mimeType, uploadedBy } = req.query;
        const query = {};
        if (mimeType) {
            query.mimeType = { $regex: mimeType, $options: 'i' };
        }
        if (uploadedBy) {
            query.uploadedBy = uploadedBy;
        }
        const media = await media_model_1.Media.find(query)
            .populate('uploadedBy', 'name avatarUrl')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await media_model_1.Media.countDocuments(query);
        res.json({
            media,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalMedia: total
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMedia = getMedia;
const getMediaById = async (req, res) => {
    try {
        const media = await media_model_1.Media.findById(req.params.id)
            .populate('uploadedBy', 'name avatarUrl')
            .populate('usedIn.modelId');
        if (!media) {
            res.status(404).json({ error: 'Media not found' });
            return;
        }
        res.json(media);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMediaById = getMediaById;
const updateMedia = async (req, res) => {
    try {
        const { altText, description } = req.body;
        const mediaId = req.params.id;
        const media = await media_model_1.Media.findById(mediaId);
        if (!media) {
            res.status(404).json({ error: 'Media not found' });
            return;
        }
        // Only allow owner or admin to update
        if (media.uploadedBy.toString() !== req.user.userId && !req.user.isAdmin) {
            res.status(403).json({ error: 'You can only update your own media' });
            return;
        }
        const updatedMedia = await media_model_1.Media.findByIdAndUpdate(mediaId, { altText, description }, { new: true, runValidators: true }).populate('uploadedBy', 'name avatarUrl');
        res.json(updatedMedia);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateMedia = updateMedia;
const deleteMedia = async (req, res) => {
    try {
        const mediaId = req.params.id;
        const media = await media_model_1.Media.findById(mediaId);
        if (!media) {
            res.status(404).json({ error: 'Media not found' });
            return;
        }
        // Only allow owner or admin to delete
        if (media.uploadedBy.toString() !== req.user.userId && !req.user.isAdmin) {
            res.status(403).json({ error: 'You can only delete your own media' });
            return;
        }
        // Check if media is being used
        if (media.usedIn && media.usedIn.length > 0) {
            res.status(400).json({
                error: 'Cannot delete media that is being used in posts or other content'
            });
            return;
        }
        // Delete file from filesystem
        const filePath = path_1.default.join(process.cwd(), 'uploads/media', media.filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        await media_model_1.Media.findByIdAndDelete(mediaId);
        res.json({ message: 'Media deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteMedia = deleteMedia;
const getUserMedia = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 20, mimeType } = req.query;
        const query = { uploadedBy: userId };
        if (mimeType) {
            query.mimeType = { $regex: mimeType, $options: 'i' };
        }
        const media = await media_model_1.Media.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await media_model_1.Media.countDocuments(query);
        res.json({
            media,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalMedia: total
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserMedia = getUserMedia;
