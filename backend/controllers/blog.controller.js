const Blog = require('../models/blog.model');

// backend/controllers/blog.controller.js


exports.getAllBlogs = (req, res) => {
    // Implementation to get all blog posts
    Blog.find()
        .then(blogs => {
            res.status(200).json(blogs);
        })
        .catch(error => {
            res.status(500).json({ error: 'Internal server error' });
        });
};

exports.createBlog = (req, res) => {
    // Implementation to create a new blog post
    const { title, content } = req.body;
    const newBlog = new Blog({ title, content });

    newBlog.save()
        .then(blog => {
            res.status(201).json(blog);
        })
        .catch(error => {
            res.status(500).json({ error: 'Internal server error' });
        });
};

exports.updateBlog = (req, res) => {
    // Implementation to update a blog post
    const { id } = req.params;
    const { title, content } = req.body;

    Blog.findByIdAndUpdate(id, { title, content }, { new: true })
        .then(blog => {
            if (!blog) {
                return res.status(404).json({ error: 'Blog not found' });
            }
            res.status(200).json(blog);
        })
        .catch(error => {
            res.status(500).json({ error: 'Internal server error' });
        });
};

exports.deleteBlog = (req, res) => {
    // Implementation to delete a blog post
    const { id } = req.params;

    Blog.findByIdAndDelete(id)
        .then(blog => {
            if (!blog) {
                return res.status(404).json({ error: 'Blog not found' });
            }
            res.status(200).json({ message: 'Blog deleted successfully' });
        })
        .catch(error => {
            res.status(500).json({ error: 'Internal server error' });
        });
};
