/**
 * File Upload Utility
 * Nepal Election Portal
 * 
 * Handles PDF uploads using Multer.
 * Currently stores locally - ready for Cloudinary migration.
 * 
 * Usage:
 *   const { uploadPDF } = require('./utils/upload');
 *   router.post('/upload', protect, uploadPDF.single('file'), handler);
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectory based on content type if provided
    const subDir = req.query.type || 'general';
    const fullPath = path.join(uploadDir, subDir);
    
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_') // Sanitize filename
      .substring(0, 50); // Limit length
    
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  },
});

// File filter - PDF only
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Configure multer
const uploadPDF = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024, // MB to bytes
  },
});

/**
 * Get public URL for uploaded file
 * @param {Object} file - Multer file object
 * @param {Object} req - Express request object
 * @returns {string} Public URL for the file
 */
const getFileUrl = (file, req) => {
  // Build URL from request
  const protocol = req.protocol;
  const host = req.get('host');
  const filePath = file.path.replace(/\\/g, '/'); // Normalize for Windows
  
  return `${protocol}://${host}/${filePath}`;
};

/**
 * Delete uploaded file
 * @param {string} fileUrl - URL of file to delete
 */
const deleteFile = (fileUrl) => {
  try {
    // Extract file path from URL
    const urlPath = new URL(fileUrl).pathname;
    const filePath = path.join(process.cwd(), urlPath);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error('Error deleting file:', error.message);
  }
  return false;
};

module.exports = {
  uploadPDF,
  getFileUrl,
  deleteFile,
};
