"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const media_controller_1 = require("../controllers/media.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Protected routes (require authentication)
router.post('/upload', auth_1.authenticate, media_controller_1.uploadMedia);
router.post('/upload/multiple', auth_1.authenticate, media_controller_1.uploadMultipleMedia);
router.get('/my-media', auth_1.authenticate, media_controller_1.getUserMedia);
router.get('/', auth_1.authenticate, media_controller_1.getMedia);
router.get('/:id', auth_1.authenticate, media_controller_1.getMediaById);
router.put('/:id', auth_1.authenticate, media_controller_1.updateMedia);
router.delete('/:id', auth_1.authenticate, media_controller_1.deleteMedia);
exports.default = router;
