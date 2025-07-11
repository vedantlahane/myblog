"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comment_controller_1 = require("../controllers/comment.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/post/:postId', comment_controller_1.getComments);
router.get('/:id/replies', comment_controller_1.getCommentReplies);
// Protected routes
router.use(auth_1.authenticate);
router.post('/', comment_controller_1.createComment);
router.put('/:id', comment_controller_1.updateComment);
router.delete('/:id', comment_controller_1.deleteComment);
router.post('/:id/like', comment_controller_1.likeComment);
router.delete('/:id/like', comment_controller_1.unlikeComment);
exports.default = router;
