import { Request, Response } from 'express';
import { Post} from '../models/post.model';
import { User } from '../models/user.model';


export const createPost = async (req: Request, res: Response) => {
    const { title, content, tags } = req.body;

    try {
        const post = new Post({ title, content, author: User, tags });
        await post.save();
        res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const getPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find().populate('author', 'name email').populate('likes', 'name email');
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};