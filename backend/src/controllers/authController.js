/**
 * Auth Controller - Sequelize
 * Nepal Election Portal
 * 
 * Handles admin authentication (login/logout).
 */

const { AdminUser } = require('../models');
const { generateToken } = require('../middleware');
const { successResponse, errorResponse } = require('../utils');

/**
 * @desc    Admin login
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    // Find admin by email
    const admin = await AdminUser.findOne({ where: { email } });

    if (!admin) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if account is active
    if (!admin.isActive) {
      return errorResponse(res, 'Account is deactivated', 401);
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Update last login
    await admin.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(admin.id);

    return successResponse(res, {
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      token,
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Server error during login', 500);
  }
};

/**
 * @desc    Get current admin profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    return successResponse(res, {
      admin: req.admin,
    }, 'Admin profile retrieved');
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Change admin password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Please provide current and new password', 400);
    }

    if (newPassword.length < 8) {
      return errorResponse(res, 'New password must be at least 8 characters', 400);
    }

    // Get admin with password
    const admin = await AdminUser.findByPk(req.admin.id);

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 401);
    }

    // Update password (will be hashed by hook)
    await admin.update({ hashedPassword: newPassword });

    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

module.exports = {
  login,
  getMe,
  changePassword,
};
