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
exports.Tag = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const tagSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Tag name is required'],
        unique: true,
        trim: true,
        maxlength: [30, 'Tag name cannot exceed 30 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    postCount: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});
// Indexes
tagSchema.index({ name: 'text' });
tagSchema.index({ postCount: -1 });
// Pre-save middleware
tagSchema.pre('save', function (next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.generateSlug();
    }
    next();
});
// Instance methods
tagSchema.methods.generateSlug = function () {
    return this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
// Static methods
tagSchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug });
};
tagSchema.statics.incrementPostCount = async function (tagId) {
    await this.findByIdAndUpdate(tagId, { $inc: { postCount: 1 } });
};
tagSchema.statics.decrementPostCount = async function (tagId) {
    await this.findByIdAndUpdate(tagId, { $inc: { postCount: -1 } });
};
exports.Tag = mongoose_1.default.model('Tag', tagSchema);
