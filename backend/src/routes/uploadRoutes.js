/**
 * Upload Routes
 * Nepal Election Portal
 * 
 * POST /api/upload/pdf - Upload PDF file (protected)
 */

const express = require('express');
const router = express.Router();
const { uploadController } = require('../controllers');
const { protect } = require('../middleware');
const { uploadPDF } = require('../utils');

// Protected upload route
// Query param 'type' determines subdirectory: voter-education, election-integrity, newsletters, parties
router.post(
  '/pdf',
  protect,
  uploadPDF.single('file'),
  uploadController.uploadPDF
);

module.exports = router;
