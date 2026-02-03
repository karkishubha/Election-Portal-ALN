/**
 * Violations Controller - Sequelize
 * Nepal Election Portal
 */

const { Violation } = require('../models');
const { successResponse, paginatedResponse, errorResponse, getPagination, buildPaginationMeta } = require('../utils');

// Public: GET /api/violations
const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { language } = req.query;

    const where = { published: true };
    if (language) where.language = language;

    const { count, rows } = await Violation.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
    });

    return paginatedResponse(res, rows, buildPaginationMeta(count, page, limit), 'Violations retrieved');
  } catch (error) {
    console.error('Get violations error:', error);
    return errorResponse(res, 'Error retrieving violations', 500);
  }
};

// Public: GET /api/violations/:id
const getById = async (req, res) => {
  try {
    const resource = await Violation.findOne({
      where: { id: req.params.id, published: true },
    });
    if (!resource) return errorResponse(res, 'Violation not found', 404);
    return successResponse(res, resource, 'Violation retrieved');
  } catch (error) {
    console.error('Get violation by ID error:', error);
    return errorResponse(res, 'Error retrieving violation', 500);
  }
};

// Admin: GET /api/admin/violations
const adminGetAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { language, published } = req.query;

    const where = {};
    if (language) where.language = language;
    if (published !== undefined) where.published = published === 'true';

    const { count, rows } = await Violation.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
    });

    return paginatedResponse(res, rows, buildPaginationMeta(count, page, limit), 'Violations retrieved');
  } catch (error) {
    console.error('Admin get violations error:', error);
    return errorResponse(res, 'Error retrieving violations', 500);
  }
};

// Admin: POST /api/admin/violations
const create = async (req, res) => {
  try {
    const { title, description, pdfUrl, language, published } = req.body;
    const resource = await Violation.create({
      title,
      description,
      pdfUrl,
      language: language || 'ne',
      published: published || false,
      createdBy: req.admin.id,
    });
    return successResponse(res, resource, 'Violation created successfully', 201);
  } catch (error) {
    console.error('Create violation error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error creating violation', 500);
  }
};

// Admin: PUT /api/admin/violations/:id
const update = async (req, res) => {
  try {
    const { title, description, pdfUrl, language, published } = req.body;
    const resource = await Violation.findByPk(req.params.id);
    if (!resource) return errorResponse(res, 'Violation not found', 404);

    await resource.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(pdfUrl !== undefined && { pdfUrl }),
      ...(language !== undefined && { language }),
      ...(published !== undefined && { published }),
      updatedBy: req.admin.id,
    });

    return successResponse(res, resource, 'Violation updated successfully');
  } catch (error) {
    console.error('Update violation error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error updating violation', 500);
  }
};

// Admin: DELETE /api/admin/violations/:id
const remove = async (req, res) => {
  try {
    const resource = await Violation.findByPk(req.params.id);
    if (!resource) return errorResponse(res, 'Violation not found', 404);
    await resource.destroy();
    return successResponse(res, null, 'Violation deleted successfully');
  } catch (error) {
    console.error('Delete violation error:', error);
    return errorResponse(res, 'Error deleting violation', 500);
  }
};

// Admin: PATCH /api/admin/violations/:id/publish
const togglePublish = async (req, res) => {
  try {
    const resource = await Violation.findByPk(req.params.id);
    if (!resource) return errorResponse(res, 'Violation not found', 404);

    await resource.update({ published: !resource.published, updatedBy: req.admin.id });
    return successResponse(res, resource, `Violation ${resource.published ? 'published' : 'unpublished'} successfully`);
  } catch (error) {
    console.error('Toggle publish violation error:', error);
    return errorResponse(res, 'Error toggling publish status', 500);
  }
};

module.exports = { getAll, getById, adminGetAll, create, update, remove, togglePublish };
