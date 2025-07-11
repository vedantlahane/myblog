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
exports.Collection = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const collectionSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Collection title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    posts: [{
            post: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Post',
                required: true
            },
            order: {
                type: Number,
                required: true
            }
        }],
    coverImage: {
        type: String
    },
    isComplete: {
        type: Boolean,
        default: false
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// Indexes
collectionSchema.index({ author: 1, createdAt: -1 });
collectionSchema.index({ isPublic: 1, createdAt: -1 });
collectionSchema.index({ title: 'text', description: 'text' });
// Pre-save middleware
collectionSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.generateSlug();
    }
    next();
});
// Instance methods
collectionSchema.methods.generateSlug = function () {
    return this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};
// Static methods
collectionSchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug });
};
exports.Collection = mongoose_1.default.model('Collection', collectionSchema);
