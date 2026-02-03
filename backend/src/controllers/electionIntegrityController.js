/**
 * Election Integrity Controller - Sequelize
 * Nepal Election Portal
 * 
 * CRUD operations for election integrity resources.
 */

const { ElectionIntegrity } = require('../models');
const { Op } = require('sequelize');
const {
  successResponse,
  paginatedResponse,
  errorResponse,
  getPagination,
  buildPaginationMeta,
} = require('../utils');

/**
 * @desc    Get all election integrity resources (published only)
 * @route   GET /api/election-integrity
 * @access  Public
 */
const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { category, language } = req.query;

    const where = { published: true };
    if (category) where.category = category;
    if (language) where.language = language;

    const { count, rows } = await ElectionIntegrity.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
    });

    return paginatedResponse(
      res,
      rows,
      buildPaginationMeta(count, page, limit),
      'Election integrity resources retrieved'
    );
  } catch (error) {
    console.error('Get election integrity error:', error);
    return errorResponse(res, 'Error retrieving resources', 500);
  }
};

/**
 * @desc    Get all (including unpublished - admin only)
 * @route   GET /api/admin/election-integrity
 * @access  Private
 */
const adminGetAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { category, language, published } = req.query;

    const where = {};
    if (category) where.category = category;
    if (language) where.language = language;
    if (published !== undefined) where.published = published === 'true';

    const { count, rows } = await ElectionIntegrity.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
    });

    return paginatedResponse(
      res,
      rows,
      buildPaginationMeta(count, page, limit),
      'Election integrity resources retrieved'
    );
  } catch (error) {
    console.error('Admin get election integrity error:', error);
    return errorResponse(res, 'Error retrieving resources', 500);
  }
};

/**
 * @desc    Get single resource
 * @route   GET /api/election-integrity/:id
 * @access  Public
 */
const getById = async (req, res) => {
  try {
    const resource = await ElectionIntegrity.findOne({
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
    console.error('Get election integrity by ID error:', error);
    return errorResponse(res, 'Error retrieving resource', 500);
  }
};

/**
 * @desc    Create resource
 * @route   POST /api/admin/election-integrity
 * @access  Private
 */
const create = async (req, res) => {
  try {
    const { title, description, pdfUrl, category, language, published } = req.body;

    const resource = await ElectionIntegrity.create({
      title,
      description,
      pdfUrl,
      category,
      language: language || 'ne',
      published: published || false,
      createdBy: req.admin.id,
    });

    return successResponse(res, resource, 'Resource created successfully', 201);
  } catch (error) {
    console.error('Create election integrity error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error creating resource', 500);
  }
};

/**
 * @desc    Update resource
 * @route   PUT /api/admin/election-integrity/:id
 * @access  Private
 */
const update = async (req, res) => {
  try {
    const { title, description, pdfUrl, category, language, published } = req.body;

    const resource = await ElectionIntegrity.findByPk(req.params.id);

    if (!resource) {
      return errorResponse(res, 'Resource not found', 404);
    }

    await resource.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(pdfUrl !== undefined && { pdfUrl }),
      ...(category !== undefined && { category }),
      ...(language !== undefined && { language }),
      ...(published !== undefined && { published }),
      updatedBy: req.admin.id,
    });

    return successResponse(res, resource, 'Resource updated successfully');
  } catch (error) {
    console.error('Update election integrity error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error updating resource', 500);
  }
};

/**
 * @desc    Delete resource
 * @route   DELETE /api/admin/election-integrity/:id
 * @access  Private
 */
const remove = async (req, res) => {
  try {
    const resource = await ElectionIntegrity.findByPk(req.params.id);

    if (!resource) {
      return errorResponse(res, 'Resource not found', 404);
    }

    await resource.destroy();

    return successResponse(res, null, 'Resource deleted successfully');
  } catch (error) {
    console.error('Delete election integrity error:', error);
    return errorResponse(res, 'Error deleting resource', 500);
  }
};

/**
 * @desc    Toggle publish status
 * @route   PATCH /api/admin/election-integrity/:id/publish
 * @access  Private
 */
const togglePublish = async (req, res) => {
  try {
    const resource = await ElectionIntegrity.findByPk(req.params.id);

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

/**
 * @desc    Get available categories
 * @route   GET /api/election-integrity/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  const categories = [
    { value: 'code_of_conduct', label: 'Code of Conduct' },
    { value: 'violations', label: 'Violations' },
    { value: 'misinformation', label: 'Misinformation' },
    { value: 'transparency', label: 'Transparency' },
    { value: 'observer_guide', label: 'Observer Guide' },
    { value: 'complaint_mechanism', label: 'Complaint Mechanism' },
    { value: 'legal_framework', label: 'Legal Framework' },
    { value: 'other', label: 'Other' },
  ];

  return successResponse(res, categories, 'Categories retrieved');
};

module.exports = {
  getAll,
  adminGetAll,
  getById,
  create,
  update,
  remove,
  togglePublish,
  getCategories,
};
