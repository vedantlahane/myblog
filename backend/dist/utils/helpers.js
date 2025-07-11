"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.calculatePaginationOffset = exports.sanitizeHtml = exports.generateRandomString = void 0;
const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
exports.generateRandomString = generateRandomString;
const sanitizeHtml = (html) => {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
};
exports.sanitizeHtml = sanitizeHtml;
const calculatePaginationOffset = (page, limit) => {
    return (page - 1) * limit;
};
exports.calculatePaginationOffset = calculatePaginationOffset;
const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};
exports.formatDate = formatDate;
