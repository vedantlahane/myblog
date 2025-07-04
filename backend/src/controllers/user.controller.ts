import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { isValidObjectId } from 'mongoose';

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {

    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    } 
    const user = await User.create(req.body);
    res.status(201).json(user.toSafeObject());
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Get all users
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users.map(user => user.toSafeObject()));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get a user by ID
export const getUserById = async (req: Request, res: Response): Promise<void>=> {
  try {

    if(!isValidObjectId(req.params.id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user.toSafeObject());
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update a user by ID
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!user){
      res.status(404).json({ error: 'User not found' });
      return;
    } 
    res.json(user.toSafeObject());
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Delete a user by ID
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    } 
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
