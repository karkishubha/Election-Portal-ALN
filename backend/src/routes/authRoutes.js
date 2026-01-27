/**
 * Auth Routes
 * Nepal Election Portal
 * 
 * POST /api/auth/login     - Admin login
 * GET  /api/auth/me        - Get current admin (protected)
 * PUT  /api/auth/password  - Change password (protected)
 */

const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { protect } = require('../middleware');

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/password', protect, authController.changePassword);

module.exports = router;
