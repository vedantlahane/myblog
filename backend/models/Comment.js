// models/Comment.js
const mongoose = require('mongoose');

// Schema for previous versions of comments (for edit history)
const CommentVersionSchema = new mongoose.Schema({
    content: String,
    editedAt: Date,
    editedBy: String
});

const CommentSchema = new mongoose.Schema({
    // Content Information
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxLength: [1000, 'Comment cannot be more than 1000 characters'],
        minLength: [2, 'Comment must be at least 2 characters long']
    },
    
    // Version Control
    previousVersions: [CommentVersionSchema],
    isEdited: {
        type: Boolean,
        default: false
    },

    // Relationship with Post
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true // For faster queries
    },

    // Author Information
    author: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        avatar: {
            type: String,
            default: function() {
                return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.author.name)}`;
            }
        },
        ip: String, // For spam prevention
        userAgent: String // For spam prevention
    },

    // Nested Comments Structure
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    depth: {
        type: Number,
        default: 0,
        max: 3 // Limit nesting depth
    },

    // Engagement Metrics
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{ // Track who liked the comment
        type: String, // Email or userId
        required: true
    }],
    reports: [{ // Track reported comments
        reportedBy: String,
        reason: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Status and Moderation
    status: {
        type: String,
        enum: ['pending', 'approved', 'spam', 'deleted', 'flagged'],
        default: 'pending'
    },
    moderatedBy: {
        type: String, // Admin/moderator who took action
        default: null
    },
    moderatedAt: Date,
    moderationReason: String,

    // Soft Delete
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deletedBy: String,

    // Spam Prevention
    spamScore: {
        type: Number,
        default: 0
    },
    isSpam: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ 'author.email': 1 });
CommentSchema.index({ status: 1 });
CommentSchema.index({ parentComment: 1 });
CommentSchema.index({ isDeleted: 1 });
CommentSchema.index({ spamScore: 1 });

// Virtuals
CommentSchema.virtual('replyCount').get(function() {
    return this.replies.length;
});

// Pre-save middleware
CommentSchema.pre('save', async function(next) {
    try {
        if (this.isNew) {
            // Set depth for nested comments
            if (this.parentComment) {
                const parentComment = await this.constructor.findById(this.parentComment);
                if (parentComment) {
                    this.depth = parentComment.depth + 1;
                    // Update parent comment
                    await this.constructor.findByIdAndUpdate(
                        this.parentComment,
                        { $push: { replies: this._id } }
                    );
                }
            }

            // Update post's comments array
            await mongoose.model('Post').findByIdAndUpdate(
                this.post,
                { $push: { comments: this._id } }
            );
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Instance Methods
CommentSchema.methods = {
    async approve() {
        this.status = 'approved';
        this.moderatedAt = new Date();
        return this.save();
    },

    async markAsSpam() {
        this.status = 'spam';
        this.isSpam = true;
        this.moderatedAt = new Date();
        return this.save();
    },

    async softDelete(deletedBy) {
        this.isDeleted = true;
        this.deletedAt = new Date();
        this.deletedBy = deletedBy;
        return this.save();
    },

    async toggleLike(userEmail) {
        const liked = this.likedBy.includes(userEmail);
        if (liked) {
            this.likedBy.pull(userEmail);
            this.likes -= 1;
        } else {
            this.likedBy.push(userEmail);
            this.likes += 1;
        }
        return this.save();
    },

    async report(reportedBy, reason) {
        this.reports.push({ reportedBy, reason });
        if (this.reports.length >= 3) { // Auto-flag after 3 reports
            this.status = 'flagged';
        }
        return this.save();
    }
};

// Static Methods
CommentSchema.statics = {
    async findByPost(postId, options = {}) {
        const {
            status = 'approved',
            sort = { createdAt: -1 },
            page = 1,
            limit = 10
        } = options;

        return this.find({
            post: postId,
            status,
            isDeleted: false,
            parentComment: null
        })
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('replies');
    },

    async findReplies(commentId) {
        return this.find({
            parentComment: commentId,
            status: 'approved',
            isDeleted: false
        })
        .sort({ createdAt: 1 });
    },

    async findSpam() {
        return this.find({
            $or: [
                { status: 'spam' },
                { spamScore: { $gt: 5 } }
            ]
        });
    }
};

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;