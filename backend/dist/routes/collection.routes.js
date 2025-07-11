"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const collection_controller_1 = require("../controllers/collection.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/', collection_controller_1.getCollections);
router.get('/slug/:slug', collection_controller_1.getCollectionBySlug);
router.get('/:id', collection_controller_1.getCollectionById);
// Protected routes
router.post('/', auth_1.authenticate, collection_controller_1.createCollection);
router.get('/user/my-collections', auth_1.authenticate, collection_controller_1.getUserCollections);
router.put('/:id', auth_1.authenticate, collection_controller_1.updateCollection);
router.delete('/:id', auth_1.authenticate, collection_controller_1.deleteCollection);
router.post('/add-post', auth_1.authenticate, collection_controller_1.addPostToCollection);
router.delete('/:collectionId/posts/:postId', auth_1.authenticate, collection_controller_1.removePostFromCollection);
router.put('/:id/reorder', auth_1.authenticate, collection_controller_1.reorderCollectionPosts);
exports.default = router;
