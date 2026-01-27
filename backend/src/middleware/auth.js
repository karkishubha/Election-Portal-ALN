/**
 * Authentication Middleware - Sequelize
 * Nepal Election Portal
 * 
 * JWT-based authentication for admin routes.
 * Protects all write operations (POST, PUT, DELETE).
 */

const jwt = require('jsonwebtoken');
const { AdminUser } = require('../models');

/**
 * Protect route - requires valid JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - no token provided',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get admin user from token (Sequelize)
      const admin = await AdminUser.findByPk(decoded.id, {
        attributes: { exclude: ['hashedPassword'] },
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized - admin not found',
        });
      }

      if (!admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized - account deactivated',
        });
      }

      // Attach admin to request
      req.admin = admin;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized - invalid token',
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized - token expired',
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

/**
 * Generate JWT Token
 */
const generateToken = (adminId) => {
  return jwt.sign(
    { id: adminId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = {
  protect,
  generateToken,
};
