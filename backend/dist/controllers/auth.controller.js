"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getCurrentUser = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    const options = {
        expiresIn: (process.env.JWT_EXPIRE || '7d')
    };
    return jsonwebtoken_1.default.sign({ userId }, secret, options);
};
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const existingUser = await user_model_1.User.findByEmail(email);
        if (existingUser) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }
        const user = await user_model_1.User.create({ email, password, name });
        const token = generateToken(user._id.toString());
        res.status(201).json({
            user: user.toSafeObject(),
            token
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const user = await user_model_1.User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = generateToken(user._id.toString());
        res.json({
            user: user.toSafeObject(),
            token
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.login = login;
const getCurrentUser = async (req, res) => {
    try {
        const user = await user_model_1.User.findById(req.user.userId)
            .populate('followers', 'name avatarUrl')
            .populate('following', 'name avatarUrl');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user.toSafeObject());
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCurrentUser = getCurrentUser;
const logout = async (_req, res) => {
    // Since we're using JWT, logout is handled client-side
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
