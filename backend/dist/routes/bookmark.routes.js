"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookmark_controller_1 = require("../controllers/bookmark.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication
router.post('/', auth_1.authenticate, bookmark_controller_1.createBookmark);
router.get('/', auth_1.authenticate, bookmark_controller_1.getBookmarks);
router.get('/collections', auth_1.authenticate, bookmark_controller_1.getUserCollections);
router.get('/check/:postId', auth_1.authenticate, bookmark_controller_1.checkBookmarkStatus);
router.get('/:id', auth_1.authenticate, bookmark_controller_1.getBookmarkById);
router.put('/:id', auth_1.authenticate, bookmark_controller_1.updateBookmark);
router.delete('/:id', auth_1.authenticate, bookmark_controller_1.deleteBookmark);
router.delete('/post/:postId', auth_1.authenticate, bookmark_controller_1.removeBookmarkByPost);
exports.default = router;
