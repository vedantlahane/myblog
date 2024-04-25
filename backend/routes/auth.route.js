const express = require('express');
const authController = require('../controllers/auth.controller');

// backend/routes/auth.routes.js

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
