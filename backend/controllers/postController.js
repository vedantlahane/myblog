// controllers/postController.js
const Post = require('../models/Post');

// Get all posts with filtering, sorting, and pagination
const getAllPosts = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            category, 
            status,
            featured,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};

        // Add filters
        if (category) query.category = category;
        if (status) query.status = status;
        if (featured) query.featured = featured === 'true';

        // Add search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Execute query with pagination
        const posts = await Post.find(query)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // Get total documents
        const count = await Post.countDocuments(query);

        res.json({
            posts,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalPosts: count
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching posts',
            error: error.message
        });
    }
};

const getPostById = async (req, res) => {

    try {
  
      const post = await Post.findById(req.params.id);
  
      if (!post) {
  
        return res.status(404).json({
  
          success: false,
  
          message: 'Post not found'
  
        });
  
      }
  
      res.json({
  
        success: true,
  
        post
  
      });
  
    } catch (error) {
  
      res.status(500).json({
  
        success: false,
  
        message: error.message
  
      });
  
    }
  
  };
  
  
  const getPostBySlug = async (req, res) => {
  
    try {
  
      const post = await Post.findOne({ slug: req.params.slug });
  
      if (!post) {
  
        return res.status(404).json({
  
          success: false,
  
          message: 'Post not found'
  
        });
  
      }
  
      res.json({
  
        success: true,
  
        post
  
      });
  
    } catch (error) {
  
      res.status(500).json({
  
        success: false,
  
        message: error.message
  
      });
  
    }
  
  };

// Create new post
const createPost = async (req, res) => {
    try {
        const postData = {
            title: req.body.title,
            subtitle: req.body.subtitle,
            content: req.body.content,
            author: {
                name: req.body.authorName || req.body.author?.name,
                email: req.body.authorEmail || req.body.author?.email,
                bio: req.body.authorBio || req.body.author?.bio,
                avatar: req.body.authorAvatar || req.body.author?.avatar
            },
            category: req.body.category || 'Other',
            tags: req.body.tags || [],
            status: req.body.status || 'draft',
            thumbnail: req.body.thumbnail,
            seo: {
                metaTitle: req.body.seo?.metaTitle || req.body.title,
                metaDescription: req.body.seo?.metaDescription || req.body.subtitle,
                keywords: req.body.seo?.keywords || req.body.tags
            }
        };

        // Handle scheduled publishing
        if (req.body.scheduledFor) {
            postData.scheduledFor = new Date(req.body.scheduledFor);
            postData.status = 'scheduled';
        }

        const post = new Post(postData);
        const savedPost = await post.save();

        res.status(201).json(savedPost);
    } catch (error) {
        res.status(400).json({
            message: 'Error creating post',
            error: error.message,
            details: error.errors
        });
    }
};

// Update post
const updatePost = async (req, res) => {
    try {
        // Don't allow updating slug directly
        if (req.body.slug) delete req.body.slug;

        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Track version if content is being updated
        if (req.body.content && req.body.content !== post.content) {
            post.previousVersions.push({
                content: post.content,
                updatedAt: post.updatedAt,
                version: post.version
            });
            post.version += 1;
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            post[key] = req.body[key];
        });

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        res.status(400).json({
            message: 'Error updating post',
            error: error.message
        });
    }
};

// Delete post
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Optional: Soft delete
        post.status = 'archived';
        await post.save();

        // Or hard delete
        // await Post.findByIdAndDelete(req.params.id);

        res.json({ message: 'Post archived successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting post',
            error: error.message
        });
    }
};

// Additional useful methods
const getFeaturedPosts = async (req, res) => {
    try {
        const posts = await Post.findFeatured();
        res.json(posts);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching featured posts',
            error: error.message
        });
    }
};

const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.stats.likes += 1;
        await post.save();

        res.json({ likes: post.stats.likes });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating likes',
            error: error.message
        });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    getFeaturedPosts,
    toggleLike,
    
};