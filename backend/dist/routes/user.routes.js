"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Basic CRUD operations
router.post('/', user_controller_1.createUser);
router.get('/', user_controller_1.getUsers);
router.get('/:id', user_controller_1.getUserById);
router.put('/:id', auth_1.authenticate, user_controller_1.updateUser);
router.delete('/:id', auth_1.authenticate, user_controller_1.deleteUser);
// Public profile routes
router.get('/:id/posts', user_controller_1.getUserPosts);
router.get('/:id/followers', user_controller_1.getFollowers);
router.get('/:id/following', user_controller_1.getFollowing);
// Protected routes
router.post('/:id/follow', auth_1.authenticate, user_controller_1.followUser);
router.delete('/:id/follow', auth_1.authenticate, user_controller_1.unfollowUser);
router.post('/posts/:postId/save', auth_1.authenticate, user_controller_1.savePost);
router.delete('/posts/:postId/save', auth_1.authenticate, user_controller_1.unsavePost);
router.get('/me/saved-posts', auth_1.authenticate, user_controller_1.getSavedPosts);
router.put('/me/profile', auth_1.authenticate, user_controller_1.updateProfile);
router.put('/me/password', auth_1.authenticate, user_controller_1.changePassword);
router.post('/me/avatar', auth_1.authenticate, user_controller_1.uploadAvatar);
router.delete('/me/avatar', auth_1.authenticate, user_controller_1.deleteAvatar);
exports.default = router;
