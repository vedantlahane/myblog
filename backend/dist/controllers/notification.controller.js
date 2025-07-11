"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const notification_model_1 = require("../models/notification.model");
// ... continuing from getNotifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const query = { recipient: userId };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }
        const notifications = await notification_model_1.Notification.find(query)
            .populate('sender', 'name avatarUrl')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await notification_model_1.Notification.countDocuments(query);
        res.json({
            notifications,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalNotifications: total
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const notification = await notification_model_1.Notification.findOne({
            _id: id,
            recipient: userId
        });
        if (!notification) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        notification.isRead = true;
        await notification.save();
        res.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        await notification_model_1.Notification.markAllAsReadForUser(userId);
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.markAllAsRead = markAllAsRead;
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const notification = await notification_model_1.Notification.findOneAndDelete({
            _id: id,
            recipient: userId
        });
        if (!notification) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        res.json({ message: 'Notification deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteNotification = deleteNotification;
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const count = await notification_model_1.Notification.countDocuments({
            recipient: userId,
            isRead: false
        });
        res.json({ unreadCount: count });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUnreadCount = getUnreadCount;
