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


export const getPostById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id).populate('author', 'name email').populate('likes', 'name email');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const updatePost = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    try {
        const post = await Post.findByIdAndUpdate(id, { title, content, tags }, { new: true });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const deletePost = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const post = await Post.findByIdAndDelete(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
