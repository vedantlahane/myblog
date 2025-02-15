// controllers/commentController.js
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Create new comment
const createComment = async (req, res) => {
    try {
        const { postId, content, parentCommentId } = req.body;

        // Validate content
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ 
                message: 'Comment content cannot be empty' 
            });
        }

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // If it's a reply, check if parent comment exists
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({ 
                    message: 'Parent comment not found' 
                });
            }
            // Check if parent comment belongs to the same post
            if (parentComment.post.toString() !== postId) {
                return res.status(400).json({ 
                    message: 'Parent comment does not belong to this post' 
                });
            }
        }

        const comment = new Comment({
            content: content.trim(),
            post: postId,
            author: {
                name: req.body.authorName,
                email: req.body.authorEmail,
                avatar: req.body.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.body.authorName)}`
            },
            parentComment: parentCommentId || null,
            status: process.env.AUTO_APPROVE_COMMENTS === 'true' ? 'approved' : 'pending'
        });

        const savedComment = await comment.save();

        // Populate necessary fields for response
        const populatedComment = await Comment.findById(savedComment._id)
            .populate('parentComment', 'content author');

        // Send notification if needed
        // await sendCommentNotification(post, savedComment);

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(400).json({
            message: 'Error creating comment',
            error: error.message,
            details: error.errors
        });
    }
};

// Get comments for a post with pagination and filtering
const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const { 
            page = 1, 
            limit = 10, 
            sort = 'newest',
            status = 'approved'
        } = req.query;

        // Build query
        const query = {
            post: postId,
            parentComment: null,
            isDeleted: false
        };

        // Add status filter if provided
        if (status !== 'all') {
            query.status = status;
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Determine sort order
        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            mostLiked: { likes: -1 }
        };

        const comments = await Comment.find(query)
            .sort(sortOptions[sort])
            .skip(skip)
            .limit(parseInt(limit))
            .populate({
                path: 'replies',
                match: { status: 'approved', isDeleted: false },
                options: { sort: { createdAt: 1 } },
                populate: {
                    path: 'author',
                    select: 'name avatar'
                }
            })
            .populate('author', 'name avatar');

        // Get total count for pagination
        const total = await Comment.countDocuments(query);

        res.json({
            comments,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching comments',
            error: error.message
        });
    }
};

// Update comment
const updateComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Validate content
        if (!req.body.content || req.body.content.trim().length === 0) {
            return res.status(400).json({ 
                message: 'Comment content cannot be empty' 
            });
        }

        // Store previous version
        comment.previousVersions.push({
            content: comment.content,
            editedAt: comment.updatedAt
        });

        // Update content
        comment.content = req.body.content.trim();
        comment.isEdited = true;

        const updatedComment = await comment.save();

        res.json(updatedComment);
    } catch (error) {
        res.status(400).json({
            message: 'Error updating comment',
            error: error.message
        });
    }
};

// Delete comment (soft delete)
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Soft delete the comment and all its replies
        await Comment.updateMany(
            { 
                $or: [
                    { _id: comment._id },
                    { parentComment: comment._id }
                ]
            },
            { 
                isDeleted: true,
                deletedAt: new Date()
            }
        );

        res.json({ message: 'Comment and its replies deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting comment',
            error: error.message
        });
    }
};

// Additional useful methods

// Like/Unlike comment
const toggleLike = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comment.likes += 1;
        await comment.save();

        res.json({ likes: comment.likes });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating likes',
            error: error.message
        });
    }
};

// Moderate comment
const moderateComment = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected', 'spam'].includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status' 
            });
        }

        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comment.status = status;
        comment.moderatedAt = new Date();
        // comment.moderatedBy = req.user.id; // If you have auth

        await comment.save();

        res.json({ message: `Comment marked as ${status}` });
    } catch (error) {
        res.status(500).json({
            message: 'Error moderating comment',
            error: error.message
        });
    }
};

module.exports = {
    createComment,
    getPostComments,
    updateComment,
    deleteComment,
    toggleLike,
    moderateComment
};