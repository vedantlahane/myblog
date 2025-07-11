import { Request, Response } from 'express';
import { Media } from '../models/media.model';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/media';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|mp4|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
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
      
      const media = await Media.create({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/media/${req.file.filename}`,
        uploadedBy: req.user!.userId,
        altText,
        description
      });

      res.status(201).json(media);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
};

export const uploadMultipleMedia = async (req: Request, res: Response): Promise<void> => {
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
      const mediaPromises = req.files.map(file => 
        Media.create({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/media/${file.filename}`,
          uploadedBy: req.user!.userId
        })
      );

      const mediaFiles = await Promise.all(mediaPromises);
      res.status(201).json(mediaFiles);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
};

export const getMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      mimeType,
      uploadedBy 
    } = req.query;

    const query: any = {};
    
    if (mimeType) {
      query.mimeType = { $regex: mimeType, $options: 'i' };
    }
    
    if (uploadedBy) {
      query.uploadedBy = uploadedBy;
    }

    const media = await Media.find(query)
      .populate('uploadedBy', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Media.countDocuments(query);

    res.json({
      media,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalMedia: total
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getMediaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const media = await Media.findById(req.params.id)
      .populate('uploadedBy', 'name avatarUrl')
      .populate('usedIn.modelId');
    
    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    res.json(media);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { altText, description } = req.body;
    const mediaId = req.params.id;

    const media = await Media.findById(mediaId);
    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    // Only allow owner or admin to update
    if (media.uploadedBy.toString() !== req.user!.userId && !req.user!.isAdmin) {
      res.status(403).json({ error: 'You can only update your own media' });
      return;
    }

    const updatedMedia = await Media.findByIdAndUpdate(
      mediaId,
      { altText, description },
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name avatarUrl');

    res.json(updatedMedia);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const mediaId = req.params.id;

    const media = await Media.findById(mediaId);
    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    // Only allow owner or admin to delete
    if (media.uploadedBy.toString() !== req.user!.userId && !req.user!.isAdmin) {
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
    const filePath = path.join(process.cwd(), 'uploads/media', media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Media.findByIdAndDelete(mediaId);
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getUserMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { 
      page = 1, 
      limit = 20, 
      mimeType 
    } = req.query;

    const query: any = { uploadedBy: userId };
    
    if (mimeType) {
      query.mimeType = { $regex: mimeType, $options: 'i' };
    }

    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Media.countDocuments(query);

    res.json({
      media,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalMedia: total
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
