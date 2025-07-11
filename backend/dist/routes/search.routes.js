"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const search_controller_1 = require("../controllers/search.controller");
const router = express_1.default.Router();
router.get('/posts', search_controller_1.searchPosts);
router.get('/users', search_controller_1.searchUsers);
router.get('/tags', search_controller_1.searchTags);
router.get('/all', search_controller_1.globalSearch);
exports.default = router;
