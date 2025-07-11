"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await user_model_1.User.findById(decoded.userId).select('isAdmin');
        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        req.user = {
            userId: decoded.userId,
            isAdmin: user.isAdmin
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (roles.includes('admin') && !req.user.isAdmin) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await user_model_1.User.findById(decoded.userId).select('isAdmin');
            if (user) {
                req.user = {
                    userId: decoded.userId,
                    isAdmin: user.isAdmin
                };
            }
        }
        next();
    }
    catch {
        // Continue without authentication
        next();
    }
};
exports.optionalAuth = optionalAuth;
