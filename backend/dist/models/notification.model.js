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
exports.Notification = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const notificationSchema = new mongoose_1.Schema({
    recipient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'follow', 'mention', 'post'],
        required: true
    },
    message: {
        type: String,
        required: true,
        maxlength: [200, 'Message cannot exceed 200 characters']
    },
    entityType: {
        type: String,
        enum: ['post', 'comment', 'user']
    },
    entityId: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'entityType'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
// Static methods
notificationSchema.statics.findUnreadByUser = function (userId) {
    return this.find({ recipient: userId, isRead: false })
        .populate('sender', 'name avatarUrl')
        .sort({ createdAt: -1 });
};
notificationSchema.statics.markAsRead = async function (notificationId) {
    await this.findByIdAndUpdate(notificationId, { isRead: true });
};
notificationSchema.statics.markAllAsReadForUser = async function (userId) {
    await this.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};
exports.Notification = mongoose_1.default.model('Notification', notificationSchema);
