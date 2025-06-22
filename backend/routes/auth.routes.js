// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');
const adminMiddleware = require('../middlewares/admin.auth.middleware.js');
router.post('/signup', adminMiddleware, authController.signup);
router.post('/login', authController.login);

module.exports = router;
