import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const user = await User.create({ email, password, name });
    const token = generateToken(user._id.toString());

    res.status(201).json({
      user: user.toSafeObject(),
      token
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      user: user.toSafeObject(),
      token
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.userId)
      .populate('followers', 'name avatarUrl')
      .populate('following', 'name avatarUrl');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user.toSafeObject());
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // Since we're using JWT, logout is handled client-side
  res.json({ message: 'Logged out successfully' });
};