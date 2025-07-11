"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOAD_LIMITS = exports.PAGINATION = exports.NOTIFICATION_TYPES = exports.POST_STATUS = exports.ROLES = void 0;
exports.ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator'
};
exports.POST_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
};
exports.NOTIFICATION_TYPES = {
    LIKE: 'like',
    COMMENT: 'comment',
    FOLLOW: 'follow',
    MENTION: 'mention',
    POST: 'post'
};
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};
exports.UPLOAD_LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif']
};
