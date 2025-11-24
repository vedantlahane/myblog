"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tag_controller_1 = require("../controllers/tag.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', tag_controller_1.getTags);
router.get('/popular', tag_controller_1.getPopularTags);
router.get('/slug/:slug', tag_controller_1.getTagBySlug);
router.get('/:id', tag_controller_1.getTagById);
router.get('/:id/posts', tag_controller_1.getPostsByTag);
// Admin only
router.use(auth_1.authenticate, (0, auth_1.authorize)('admin'));
router.post('/', tag_controller_1.createTag);
router.put('/:id', tag_controller_1.updateTag);
router.delete('/:id', tag_controller_1.deleteTag);
exports.default = router;
