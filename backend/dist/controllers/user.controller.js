"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAvatar = exports.uploadAvatar = exports.changePassword = exports.updateProfile = exports.getSavedPosts = exports.unsavePost = exports.savePost = exports.getUserPosts = exports.getFollowing = exports.getFollowers = exports.unfollowUser = exports.followUser = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
const user_model_1 = require("../models/user.model");
const post_model_1 = require("../models/post.model");
const notification_model_1 = require("../models/notification.model");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/avatars');
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
}).single('avatar');
// Basic CRUD operations
const createUser = async (req, res) => {
    try {
        const { email, password, name, isAdmin = false } = req.body;
        const existingUser = await user_model_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }
        const user = await user_model_1.User.create({ email, password, name, isAdmin });
        res.status(201).json(user.toSafeObject());
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createUser = createUser;
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, isAdmin } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (isAdmin !== undefined) {
            query.isAdmin = isAdmin === 'true';
        }
        const users = await user_model_1.User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await user_model_1.User.countDocuments(query);
        res.json({
            users,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalUsers: total
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res) => {
    try {
        const user = await user_model_1.User.findById(req.params.id)
            .populate('followers', 'name avatarUrl')
            .populate('following', 'name avatarUrl');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user.toSafeObject());
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const currentUserId = req.user.userId;
        const { name, bio, avatarUrl, isAdmin } = req.body;
        // Only allow users to update their own profile or admins to update any profile
        if (userId !== currentUserId && !req.user.isAdmin) {
            res.status(403).json({ error: 'You can only update your own profile' });
            return;
        }
        const updateData = { name, bio, avatarUrl };
        // Only admins can change admin status
        if (req.user.isAdmin && isAdmin !== undefined) {
            updateData.isAdmin = isAdmin;
        }
        const user = await user_model_1.User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user.toSafeObject());
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const currentUserId = req.user.userId;
        // Only allow users to delete their own account or admins to delete any account
        if (userId !== currentUserId && !req.user.isAdmin) {
            res.status(403).json({ error: 'You can only delete your own account' });
            return;
        }
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Prevent deleting the last admin
        if (user.isAdmin) {
            const adminCount = await user_model_1.User.countDocuments({ isAdmin: true });
            if (adminCount === 1) {
                res.status(400).json({ error: 'Cannot delete the last admin user' });
                return;
            }
        }
        await user_model_1.User.findByIdAndDelete(userId);
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteUser = deleteUser;
// Follow/Unfollow functionality
const followUser = async (req, res) => {
    try {
        const { id: targetUserId } = req.params;
        const currentUserId = req.user.userId;
        if (currentUserId === targetUserId) {
            res.status(400).json({ error: 'You cannot follow yourself' });
            return;
        }
        const [currentUser, targetUser] = await Promise.all([
            user_model_1.User.findById(currentUserId),
            user_model_1.User.findById(targetUserId)
        ]);
        if (!currentUser || !targetUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (currentUser.following.some((id) => id.equals(targetUser._id))) {
            res.status(400).json({ error: 'Already following this user' });
            return;
        }
        currentUser.following.push(targetUser._id);
        targetUser.followers.push(currentUser._id);
        await Promise.all([
            currentUser.save(),
            targetUser.save(),
            notification_model_1.Notification.create({
                recipient: targetUser._id,
                sender: currentUser._id,
                type: 'follow',
                message: `${currentUser.name} started following you`,
                entityType: 'user',
                entityId: currentUser._id
            })
        ]);
        res.json({ message: 'Successfully followed user' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.followUser = followUser;
const unfollowUser = async (req, res) => {
    try {
        const { id: targetUserId } = req.params;
        const currentUserId = req.user.userId;
        const [currentUser, targetUser] = await Promise.all([
            user_model_1.User.findById(currentUserId),
            user_model_1.User.findById(targetUserId)
        ]);
        if (!currentUser || !targetUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        currentUser.following = currentUser.following.filter((id) => !id.equals(targetUser._id));
        targetUser.followers = targetUser.followers.filter((id) => !id.equals(currentUser._id));
        await Promise.all([
            currentUser.save(),
            targetUser.save()
        ]);
        res.json({ message: 'Successfully unfollowed user' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.unfollowUser = unfollowUser;
// ... continuing from getFollowers
const getFollowers = async (req, res) => {
    try {
        const user = await user_model_1.User.findById(req.params.id)
            .populate('followers', 'name avatarUrl bio');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user.followers);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getFollowers = getFollowers;
const getFollowing = async (req, res) => {
    try {
        const user = await user_model_1.User.findById(req.params.id)
            .populate('following', 'name avatarUrl bio');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user.following);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getFollowing = getFollowing;
const getUserPosts = async (req, res) => {
    try {
        const posts = await post_model_1.Post.find({
            author: req.params.id,
            status: 'published'
        })
            .populate('author', 'name avatarUrl')
            .populate('tags', 'name slug')
            .sort({ publishedAt: -1 });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserPosts = getUserPosts;
const savePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (user.savedPosts.includes(postId)) {
            res.status(400).json({ error: 'Post already saved' });
            return;
        }
        user.savedPosts.push(postId);
        await user.save();
        res.json({ message: 'Post saved successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.savePost = savePost;
const unsavePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        user.savedPosts = user.savedPosts.filter(id => !id.equals(postId));
        await user.save();
        res.json({ message: 'Post unsaved successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.unsavePost = unsavePost;
const getSavedPosts = async (req, res) => {
    try {
        const user = await user_model_1.User.findById(req.user.userId)
            .populate({
            path: 'savedPosts',
            populate: [
                { path: 'author', select: 'name avatarUrl' },
                { path: 'tags', select: 'name slug' }
            ]
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user.savedPosts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getSavedPosts = getSavedPosts;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, bio, avatarUrl } = req.body;
        const user = await user_model_1.User.findByIdAndUpdate(userId, { name, bio, avatarUrl }, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user.toSafeObject());
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;
        const user = await user_model_1.User.findById(userId).select('+password');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Current password is incorrect' });
            return;
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.changePassword = changePassword;
const uploadAvatar = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        try {
            const userId = req.user.userId;
            const avatarUrl = `/uploads/avatars/${req.file.filename}`;
            const user = await user_model_1.User.findByIdAndUpdate(userId, { avatarUrl }, { new: true });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json({ avatarUrl: user.avatarUrl });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};
exports.uploadAvatar = uploadAvatar;
const deleteAvatar = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await user_model_1.User.findByIdAndUpdate(userId, { $unset: { avatarUrl: '' } }, { new: true });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ message: 'Avatar deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteAvatar = deleteAvatar;
