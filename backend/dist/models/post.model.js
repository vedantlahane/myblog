"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const postSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        minlength: [10, 'Content must be at least 10 characters']
    },
    excerpt: {
        type: String,
        maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    coverImage: {
        type: String,
        validate: {
            validator: (url) => !url || /^https?:\/\/.+/.test(url),
            message: 'Please provide a valid URL'
        }
    },
    tags: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Tag' }],
        validate: {
            validator: (tags) => tags.length > 0,
            message: 'At least one tag is required'
        }
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    likes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    viewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    readTime: {
        type: Number,
        default: 0,
        min: 0
    },
    publishedAt: Date
}, {
    timestamps: true,
});
// Indexes
postSchema.index({ author: 1, status: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ title: 'text', content: 'text' });
// Pre-save middleware
postSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.generateSlug();
    }
    if (this.isModified('content')) {
        this.readTime = this.calculateReadTime();
    }
    if (this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});
// Instance methods
postSchema.methods.generateSlug = function () {
    return this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Date.now();
};
postSchema.methods.calculateReadTime = function () {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
};
// Static methods
postSchema.statics.findPublished = function () {
    return this.find({ status: 'published' }).sort({ publishedAt: -1 });
};
postSchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug, status: 'published' });
};
// Virtuals
postSchema.virtual('likeCount').get(function () {
    return this.likes?.length || 0;
});
postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
});
exports.Post = mongoose_1.default.model('Post', postSchema);
