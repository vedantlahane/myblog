// models/Comment.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    // Comment Content
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,// Remove whitespace from both ends of a string
        maxLength: [1000, 'Comment cannot be more than 1000 characters']
    },

    // Relationship with Post
    post: {
        type: mongoose.Schema.Types.ObjectId,// Reference to Post model
        ref: 'Post',// Reference to Post model
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
    replies: [{// Array of Comment IDs
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],

    // Engagement Metrics
    likes: {
        type: Number,
        default: 0
    },

    // Status
    status: {//to check if the comment is approved or not
        type: String,
        enum: ['pending', 'approved', 'spam', 'deleted'],
        default: 'pending'
    },

    // For soft delete
    isDeleted: {//to check if the comment is deleted or not
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance optimization and to enforce uniqueness constraint if needed 
CommentSchema.index({ post: 1, createdAt: -1 });//to get the comments of a post in descending order of creation time
CommentSchema.index({ 'author.email': 1 });//to get the comments of a user
CommentSchema.index({ status: 1 });//to get the comments based on status

// Pre-save middleware
CommentSchema.pre('save', async function(next) {//it is used to update the parent comment and post's comments array
    if (this.isNew) {//if the comment is new then only update the parent comment and post's comments array
        // If this is a reply, update parent comment
        if (this.parentComment) {//if the comment is a reply then update the parent comment
            await mongoose.model('Comment').findByIdAndUpdate(//update the parent comment by pushing the reply id to the replies array
                this.parentComment,//parent comment id
                { $push: { replies: this._id } }//push the reply id to the replies array
            );
        }
        
        // Update post's comments array
        await mongoose.model('Post').findByIdAndUpdate(//update the post's comments array by pushing the comment id to the comments array
            this.post,
            { $push: { comments: this._id } }
        );
    }
    next();
});

// Instance Methods
CommentSchema.methods.approve = async function() {//to approve the comment
    this.status = 'approved';//change the status to approved
    return this.save();//save the comment
};

CommentSchema.methods.markAsSpam = async function() {//to mark the comment as spam
    this.status = 'spam';//change the status to spam
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