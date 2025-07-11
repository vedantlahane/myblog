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
exports.Draft = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const draftSchema = new mongoose_1.Schema({
    post: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Post',
        default: null
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    excerpt: {
        type: String,
        maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    coverImage: {
        type: String
    },
    tags: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Tag'
        }],
    version: {
        type: Number,
        default: 1
    },
    changes: {
        type: String,
        maxlength: [500, 'Changes description cannot exceed 500 characters']
    },
    autoSave: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Indexes
draftSchema.index({ author: 1, createdAt: -1 });
draftSchema.index({ post: 1, version: -1 });
draftSchema.index({ author: 1, post: 1 });
draftSchema.index({ autoSave: 1, createdAt: -1 });
exports.Draft = mongoose_1.default.model('Draft', draftSchema);
