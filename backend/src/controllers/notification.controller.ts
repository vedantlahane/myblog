import { Request, Response } from 'express';
import { Notification } from '../models/notification.model';

// ... continuing from getNotifications

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query: any = { recipient: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalNotifications: total
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const notification = await Notification.findOne({ 
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
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    await Notification.markAllAsReadForUser(userId as any);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const notification = await Notification.findOneAndDelete({ 
      _id: id, 
      recipient: userId 
    });

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const count = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};