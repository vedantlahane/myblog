import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/user.model';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as SignOptions['expiresIn']
  };
  
  return jwt.sign({ userId }, secret, options);
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
    const token = generateToken((user._id as any).toString());

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

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken((user._id as any).toString());

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