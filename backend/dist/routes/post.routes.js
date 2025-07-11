"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const post_controller_1 = require("../controllers/post.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = express_1.default.Router();
// Validation rules
const postValidation = [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
    (0, express_validator_1.body)('tags').isArray({ min: 1 }).withMessage('At least one tag is required'),
    (0, express_validator_1.body)('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
];
// Public routes
router.get('/', auth_1.optionalAuth, post_controller_1.getPosts);
router.get('/trending', post_controller_1.getTrendingPosts);
router.get('/slug/:slug', auth_1.optionalAuth, post_controller_1.getPostBySlug);
router.get('/:id', auth_1.optionalAuth, post_controller_1.getPostById);
router.get('/:id/related', post_controller_1.getRelatedPosts);
// Protected routes
router.use(auth_1.authenticate);
router.post('/', rateLimiter_1.createPostLimiter, postValidation, validation_1.validate, post_controller_1.createPost);
router.put('/:id', postValidation, validation_1.validate, post_controller_1.updatePost);
router.delete('/:id', post_controller_1.deletePost);
router.post('/:id/like', post_controller_1.likePost);
router.delete('/:id/like', post_controller_1.unlikePost);
exports.default = router;
