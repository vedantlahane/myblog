import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Post } from '../models/post.model';
import { Notification } from '../models/notification.model';
import { isValidObjectId } from 'mongoose';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
}).single('avatar');

// Existing CRUD operations (already implemented)
// ... (keep your existing createUser, getUsers, getUserById, updateUser, deleteUser)

// Follow/Unfollow functionality
export const followUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user!.userId;

    if (currentUserId === targetUserId) {
      res.status(400).json({ error: 'You cannot follow yourself' });
      return;
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!currentUser || !targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (currentUser.following.includes(targetUser._id)) {
      res.status(400).json({ error: 'Already following this user' });
      return;
    }

    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);

    await Promise.all([
      currentUser.save(),
      targetUser.save(),
      Notification.create({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: 'follow',
        message: `${currentUser.name} started following you`,
        entityType: 'user',
        entityId: currentUser._id
      })
    ]);

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const unfollowUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user!.userId;

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!currentUser || !targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    currentUser.following = currentUser.following.filter(
      id => !id.equals(targetUser._id)
    );
    targetUser.followers = targetUser.followers.filter(
      id => !id.equals(currentUser._id)
    );

    await Promise.all([
      currentUser.save(),
      targetUser.save()
    ]);

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ... continuing from getFollowers

export const getFollowers = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name avatarUrl bio');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getFollowing = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name avatarUrl bio');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getUserPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find({ 
      author: req.params.id, 
      status: 'published' 
    })
      .populate('author', 'name avatarUrl')
      .populate('tags', 'name slug')
      .sort({ publishedAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const savePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user!.userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.savedPosts.includes(postId as any)) {
      res.status(400).json({ error: 'Post already saved' });
      return;
    }

    user.savedPosts.push(postId as any);
    await user.save();

    res.json({ message: 'Post saved successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const unsavePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user!.userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.savedPosts = user.savedPosts.filter(
      id => !id.equals(postId)
    );
    await user.save();

    res.json({ message: 'Post unsaved successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getSavedPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.userId)
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
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, bio, avatarUrl } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, bio, avatarUrl },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user.toSafeObject());
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
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
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
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
      const userId = req.user!.userId;
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        userId,
        { avatarUrl },
        { new: true }
      );

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ avatarUrl: user.avatarUrl });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
};

export const deleteAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { $unset: { avatarUrl: '' } },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};