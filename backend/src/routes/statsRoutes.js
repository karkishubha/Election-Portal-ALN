/**
 * Stats Routes
 * Nepal Election Portal
 */

const express = require('express');
const router = express.Router();
const { getPublicStats, getAdminStats } = require('../controllers/statsController');
const { protect } = require('../middleware');

// Public route
router.get('/', getPublicStats);

// Admin route
router.get('/admin', protect, getAdminStats);

module.exports = router;
