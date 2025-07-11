"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = express_1.default.Router();
// Validation rules
const registerValidation = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number and special character')
];
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
];
// Routes
router.post('/register', rateLimiter_1.authLimiter, registerValidation, validation_1.validate, auth_controller_1.register);
router.post('/login', rateLimiter_1.authLimiter, loginValidation, validation_1.validate, auth_controller_1.login);
router.post('/logout', auth_1.authenticate, auth_controller_1.logout);
router.get('/me', auth_1.authenticate, auth_controller_1.getCurrentUser);
exports.default = router;
