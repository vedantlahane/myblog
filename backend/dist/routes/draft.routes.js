"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const draft_controller_1 = require("../controllers/draft.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication
router.post('/', auth_1.authenticate, draft_controller_1.createDraft);
router.get('/', auth_1.authenticate, draft_controller_1.getDrafts);
router.get('/:id', auth_1.authenticate, draft_controller_1.getDraftById);
router.put('/:id', auth_1.authenticate, draft_controller_1.updateDraft);
router.delete('/:id', auth_1.authenticate, draft_controller_1.deleteDraft);
router.post('/:id/publish', auth_1.authenticate, draft_controller_1.publishDraft);
router.get('/versions/:postId', auth_1.authenticate, draft_controller_1.getDraftVersions);
exports.default = router;
