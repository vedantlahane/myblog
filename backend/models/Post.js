// models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxLength: [100, 'Title cannot be more than 100 characters']
    },
    subtitle: {
        type: String,
        required: [true, 'Subtitle is required'],
        trim: true,
        maxLength: [200, 'Subtitle cannot be more than 200 characters']
    },
    slug: {// URL friendly version of title for SEO and URL routing purposes 
        type: String,
        // unique: true,
        lowercase: true
    },

    // Content
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    contentType: {
        type: String,
        enum: ['text', 'html', 'markdown'],
        default: 'html'
    },

    // Media
    thumbnail: {// Thumbnail image for the post
        url: {
            type: String,
            default: 'default-thumbnail.jpg'
        },
        alt: String,
        caption: String
    },
    coverImage: {// Cover image for the post
        url: String,
        alt: String,
        caption: String
    },
    images: [{// Array of images in the post
        url: String,
        alt: String,
        caption: String
    }],

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
        bio: String,
        avatar: String
    },

    // Publication Details
    publication: {
        name: String,
        logo: String,
        website: String
    },

    // Categorization
    category: {
        type: String,
        default: 'Other',
        enum: ['Technology', 'Programming', 'Design', 'Business', 'Lifestyle', 'Other']
    },
    tags: [{
        type: String,
        trim: true
    }],

    // Meta Information
    readTime: {
        type: Number,  // in minutes
        default: 0
    },
    seo: {// Search Engine Optimization fields for the post 
        metaTitle: String,// Title for search engines 
        metaDescription: {
            type: String,
            maxLength: 160
        },
        keywords: [String],
        canonicalUrl: String// Canonical URL for SEO
    },

    // Statistics
    stats: {
        views: {
            type: Number,
            default: 0
        },
        likes: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        },
        readingTime: Number
    },

    // Comments (Reference to separate collection)
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],

    // Status and Visibility
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'members'],
        default: 'public'
    },
    featured: {
        type: Boolean,
        default: false
    },

    // Publishing Schedule
    scheduledFor: Date,
    publishedAt: Date,

    // Version Control
    version: {// Version number of the post i.e. 1, 2, 3, etc.
        type: Number,
        default: 1
    },
    previousVersions: [{
        content: String,
        updatedAt: Date,
        version: Number
    }]
}, {
    timestamps: true,  // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
PostSchema.index({ title: 'text', content: 'text' });
PostSchema.index({ slug: 1 }, { unique: true });
PostSchema.index({ 'author.email': 1 });
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ category: 1 });
PostSchema.index({ tags: 1 });

// Pre-save middleware
PostSchema.pre('save', function(next) {
    // Generate slug from title
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    // Calculate reading time
    if (this.isModified('content')) {
        const wordsPerMinute = 200;
        const wordCount = this.content.split(/\s+/).length;
        this.stats.readingTime = Math.ceil(wordCount / wordsPerMinute);
    }

    next();
});

// Virtual for comment count
PostSchema.virtual('commentCount').get(function() {
    return this.comments.length;
});

// Instance method to format post
PostSchema.methods.toJSON = function() {
    const post = this.toObject();
    
    // Format dates
    if (post.createdAt) {
        post.createdAt = post.createdAt.toLocaleDateString();
    }
    if (post.updatedAt) {
        post.updatedAt = post.updatedAt.toLocaleDateString();
    }
    
    return post;
};
// Get approved comments count

PostSchema.virtual('approvedCommentsCount').get(async function() {

    const Comment = mongoose.model('Comment');

    return await Comment.countDocuments({

        post: this._id,

        status: 'approved',

        isDeleted: false

    });

});


// Get comments with replies

PostSchema.methods.getCommentsWithReplies = async function() {

    const Comment = mongoose.model('Comment');

    

    // Get top-level comments

    const comments = await Comment.find({

        post: this._id,

        parentComment: null,

        status: 'approved',

        isDeleted: false

    })

    .sort({ createdAt: -1 })

    .populate({

        path: 'replies',

        match: { 

            status: 'approved',

            isDeleted: false

        },

        options: { sort: { createdAt: 1 } }

    });


    return comments;

};
// Static method to find published posts
PostSchema.statics.findPublished = function() {
    return this.find({ 
        status: 'published',
        $or: [
            { scheduledFor: { $lte: new Date() } },
            { scheduledFor: null }
        ]
    }).sort({ createdAt: -1 });
};

// Static method to find featured posts
PostSchema.statics.findFeatured = function() {
    return this.find({ 
        status: 'published',
        featured: true 
    }).sort({ createdAt: -1 });
};

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;

