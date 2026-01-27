/**
 * Voter Education Controller - Sequelize
 * Nepal Election Portal
 * 
 * CRUD operations for voter education resources.
 */

const { VoterEducation } = require('../models');
const { Op } = require('sequelize');
const {
  successResponse,
  paginatedResponse,
  errorResponse,
  getPagination,
  buildPaginationMeta,
} = require('../utils');

/**
 * @desc    Get all voter education resources (published only for public)
 * @route   GET /api/voter-education
 * @access  Public
 */
const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { language } = req.query;

    // Build where clause - public sees only published
    const where = { published: true };
    if (language) where.language = language;

    const { count, rows } = await VoterEducation.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
    });

    return paginatedResponse(
      res,
      rows,
      buildPaginationMeta(count, page, limit),
      'Voter education resources retrieved'
    );
  } catch (error) {
    console.error('Get voter education error:', error);
    return errorResponse(res, 'Error retrieving resources', 500);
  }
};

/**
 * @desc    Get all voter education (including unpublished - admin only)
 * @route   GET /api/admin/voter-education
 * @access  Private
 */
const adminGetAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { language, published } = req.query;

    const where = {};
    if (language) where.language = language;
    if (published !== undefined) where.published = published === 'true';

    const { count, rows } = await VoterEducation.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
    });

    return paginatedResponse(
      res,
      rows,
      buildPaginationMeta(count, page, limit),
      'Voter education resources retrieved'
    );
  } catch (error) {
    console.error('Admin get voter education error:', error);
    return errorResponse(res, 'Error retrieving resources', 500);
  }
};

/**
 * @desc    Get single voter education resource
 * @route   GET /api/voter-education/:id
 * @access  Public
 */
const getById = async (req, res) => {
  try {
    const resource = await VoterEducation.findOne({
      where: {
        id: req.params.id,
        published: true,
      },
    });

    if (!resource) {
      return errorResponse(res, 'Resource not found', 404);
    }

    return successResponse(res, resource, 'Resource retrieved');
  } catch (error) {
    console.error('Get voter education by ID error:', error);
    return errorResponse(res, 'Error retrieving resource', 500);
  }
};

/**
 * @desc    Create voter education resource
 * @route   POST /api/admin/voter-education
 * @access  Private
 */
const create = async (req, res) => {
  try {
    const { title, description, pdfUrl, language, published } = req.body;

    const resource = await VoterEducation.create({
      title,
      description,
      pdfUrl,
      language: language || 'ne',
      published: published || false,
      createdBy: req.admin.id,
    });

    return successResponse(res, resource, 'Resource created successfully', 201);
  } catch (error) {
    console.error('Create voter education error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error creating resource', 500);
  }
};

/**
 * @desc    Update voter education resource
 * @route   PUT /api/admin/voter-education/:id
 * @access  Private
 */
const update = async (req, res) => {
  try {
    const { title, description, pdfUrl, language, published } = req.body;

    const resource = await VoterEducation.findByPk(req.params.id);

    if (!resource) {
      return errorResponse(res, 'Resource not found', 404);
    }

    // Update fields
    await resource.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(pdfUrl !== undefined && { pdfUrl }),
      ...(language !== undefined && { language }),
      ...(published !== undefined && { published }),
      updatedBy: req.admin.id,
    });

    return successResponse(res, resource, 'Resource updated successfully');
  } catch (error) {
    console.error('Update voter education error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error updating resource', 500);
  }
};

/**
 * @desc    Delete voter education resource
 * @route   DELETE /api/admin/voter-education/:id
 * @access  Private
 */
const remove = async (req, res) => {
  try {
    const resource = await VoterEducation.findByPk(req.params.id);

    if (!resource) {
      return errorResponse(res, 'Resource not found', 404);
    }

    await resource.destroy();

    return successResponse(res, null, 'Resource deleted successfully');
  } catch (error) {
    console.error('Delete voter education error:', error);
    return errorResponse(res, 'Error deleting resource', 500);
  }
};

/**
 * @desc    Toggle publish status
 * @route   PATCH /api/admin/voter-education/:id/publish
 * @access  Private
 */
const togglePublish = async (req, res) => {
  try {
    const resource = await VoterEducation.findByPk(req.params.id);

    if (!resource) {
      return errorResponse(res, 'Resource not found', 404);
    }

    await resource.update({
      published: !resource.published,
      updatedBy: req.admin.id,
    });

    return successResponse(
      res,
      resource,
      `Resource ${resource.published ? 'published' : 'unpublished'} successfully`
    );
  } catch (error) {
    console.error('Toggle publish error:', error);
    return errorResponse(res, 'Error toggling publish status', 500);
  }
};

module.exports = {
  getAll,
  adminGetAll,
  getById,
  create,
  update,
  remove,
  togglePublish,
};
