/**
 * Candidates Routes
 * Public endpoint to fetch candidates data
 */

const express = require('express');
const { getCandidates } = require('../controllers/candidatesController');

const router = express.Router();

/**
 * @route   GET /api/candidates
 * @desc    Get all election candidates from Election Commission API
 * @access  Public
 */
router.get('/', getCandidates);

module.exports = router;
