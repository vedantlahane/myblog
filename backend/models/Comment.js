// models/Comment.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    // Comment Content
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxLength: [1000, 'Comment cannot be more than 1000 characters']
    },

    // Relationship with Post
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },

    // Author Information
    author: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        avatar: String
    },

    // Parent Comment (for nested comments/replies)
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },

    // Nested Replies
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],

    // Engagement Metrics
    likes: {
        type: Number,
        default: 0
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'spam', 'deleted'],
        default: 'pending'
    },

    // For soft delete
    isDeleted: {
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

// Pre-save middleware
CommentSchema.pre('save', async function(next) {
    if (this.isNew) {
        // If this is a reply, update parent comment
        if (this.parentComment) {
            await mongoose.model('Comment').findByIdAndUpdate(
                this.parentComment,
                { $push: { replies: this._id } }
            );
        }
        
        // Update post's comments array
        await mongoose.model('Post').findByIdAndUpdate(
            this.post,
            { $push: { comments: this._id } }
        );
    }
    next();
});

// Instance Methods
CommentSchema.methods.approve = async function() {
    this.status = 'approved';
    return this.save();
};

CommentSchema.methods.markAsSpam = async function() {
    this.status = 'spam';
    return this.save();
};

CommentSchema.methods.softDelete = async function() {
    this.isDeleted = true;
    return this.save();
};

// Static Methods
CommentSchema.statics.findByPost = function(postId) {
    return this.find({
        post: postId,
        status: 'approved',
        isDeleted: false
    }).sort({ createdAt: -1 });
};

CommentSchema.statics.findReplies = function(commentId) {
    return this.find({
        parentComment: commentId,
        status: 'approved',
        isDeleted: false
    }).sort({ createdAt: 1 });
};

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;