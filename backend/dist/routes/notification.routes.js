"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get('/', notification_controller_1.getNotifications);
router.get('/unread-count', notification_controller_1.getUnreadCount);
router.put('/:id/read', notification_controller_1.markAsRead);
router.put('/mark-all-read', notification_controller_1.markAllAsRead);
router.delete('/:id', notification_controller_1.deleteNotification);
exports.default = router;
