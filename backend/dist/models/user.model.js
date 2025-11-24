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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// Mongoose schema for User, this defines the structure of the user document in the database, including field types, validation rules, and default values, it also includes indexes for better query performance and middleware for password hashing
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
            message: 'Please provide a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: (password) => {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
            },
            message: 'Password must contain at least one uppercase letter, lowercase letter, number, and special character'
        },
        select: false
    },
    avatarUrl: {
        type: String,
        validate: {
            validator: (url) => !url || /^https?:\/\/.+/.test(url),
            message: 'Please provide a valid URL'
        }
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    savedPosts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Post' }],
    followers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
}, {
    timestamps: true,
});
// Indexes for better query performance
userSchema.index({ name: 'text' });
userSchema.index({ createdAt: -1 });
userSchema.index({ email: 1, isVerified: 1 });
userSchema.index({ isAdmin: 1, isVerified: 1 });
// Configure virtuals to appear in JSON
// virtuals are properties that are not stored in the database but can be computed from the document's data, here we are using virtuals to get the ollower and following counts, .set method is used to configure the schema to include virtuals when converting to JSON or an object
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });
// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcrypt_1.default.genSalt(12);
        this.password = await bcrypt_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        throw new Error('Password comparison failed');
    }
};
userSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};
// Static methods
userSchema.statics.findByEmail = async function (email) {
    return this.findOne({ email: email.toLowerCase() });
};
// Virtual for follower count
// so here we are creating virtual properties for the number of followers and following, these 
userSchema.virtual('followerCount').get(function () {
    return this.followers?.length || 0;
});
userSchema.virtual('followingCount').get(function () {
    return this.following?.length || 0;
});
exports.User = mongoose_1.default.model('User', userSchema);
