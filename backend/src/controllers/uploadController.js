/**
 * Upload Controller
 * Nepal Election Portal
 * 
 * Handles PDF file uploads for all content types.
 */

const { getFileUrl, successResponse, errorResponse } = require('../utils');

/**
 * @desc    Upload a PDF file
 * @route   POST /api/upload/pdf
 * @access  Private
 */
const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    // Get public URL for the uploaded file
    const fileUrl = getFileUrl(req.file, req);

    return successResponse(res, {
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    }, 'File uploaded successfully', 201);
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse(res, 'Error uploading file', 500);
  }
};

module.exports = {
  uploadPDF,
};
