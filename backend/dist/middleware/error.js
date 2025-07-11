"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    // MongoDB duplicate key error
    if (err.code === '11000') {
        statusCode = 400;
        const field = Object.keys(err).find(key => key.includes('keyValue'));
        message = `${field} already exists`;
    }
    // MongoDB validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(err.errors).map((e) => e.message);
        message = errors.join(', ');
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
const notFound = (_req, res) => {
    res.status(404).json({ error: 'Route not found' });
};
exports.notFound = notFound;
