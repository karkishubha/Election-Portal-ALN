/**
 * Misinformation Controller - Sequelize
 * Nepal Election Portal
 */

const { Misinformation } = require('../models');
const { successResponse, paginatedResponse, errorResponse, getPagination, buildPaginationMeta } = require('../utils');

// Public: GET /api/misinformation
const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { language } = req.query;

    const where = { published: true };
    if (language) where.language = language;

    const { count, rows } = await Misinformation.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
    });

    return paginatedResponse(res, rows, buildPaginationMeta(count, page, limit), 'Misinformation retrieved');
  } catch (error) {
    console.error('Get misinformation error:', error);
    return errorResponse(res, 'Error retrieving misinformation', 500);
  }
};

// Public: GET /api/misinformation/:id
const getById = async (req, res) => {
  try {
    const resource = await Misinformation.findOne({
      where: { id: req.params.id, published: true },
    });
    if (!resource) return errorResponse(res, 'Misinformation not found', 404);
    return successResponse(res, resource, 'Misinformation retrieved');
  } catch (error) {
    console.error('Get misinformation by ID error:', error);
    return errorResponse(res, 'Error retrieving misinformation', 500);
  }
};

// Admin: GET /api/admin/misinformation
const adminGetAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { language, published } = req.query;

    const where = {};
    if (language) where.language = language;
    if (published !== undefined) where.published = published === 'true';

    const { count, rows } = await Misinformation.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
    });

    return paginatedResponse(res, rows, buildPaginationMeta(count, page, limit), 'Misinformation retrieved');
  } catch (error) {
    console.error('Admin get misinformation error:', error);
    return errorResponse(res, 'Error retrieving misinformation', 500);
  }
};

// Admin: POST /api/admin/misinformation
const create = async (req, res) => {
  try {
    const { title, description, pdfUrl, language, published } = req.body;
    const resource = await Misinformation.create({
      title,
      description,
      pdfUrl,
      language: language || 'ne',
      published: published || false,
      createdBy: req.admin.id,
    });
    return successResponse(res, resource, 'Misinformation created successfully', 201);
  } catch (error) {
    console.error('Create misinformation error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error creating misinformation', 500);
  }
};

// Admin: PUT /api/admin/misinformation/:id
const update = async (req, res) => {
  try {
    const { title, description, pdfUrl, language, published } = req.body;
    const resource = await Misinformation.findByPk(req.params.id);
    if (!resource) return errorResponse(res, 'Misinformation not found', 404);

    await resource.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(pdfUrl !== undefined && { pdfUrl }),
      ...(language !== undefined && { language }),
      ...(published !== undefined && { published }),
      updatedBy: req.admin.id,
    });

    return successResponse(res, resource, 'Misinformation updated successfully');
  } catch (error) {
    console.error('Update misinformation error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error updating misinformation', 500);
  }
};

// Admin: DELETE /api/admin/misinformation/:id
const remove = async (req, res) => {
  try {
    const resource = await Misinformation.findByPk(req.params.id);
    if (!resource) return errorResponse(res, 'Misinformation not found', 404);
    await resource.destroy();
    return successResponse(res, null, 'Misinformation deleted successfully');
  } catch (error) {
    console.error('Delete misinformation error:', error);
    return errorResponse(res, 'Error deleting misinformation', 500);
  }
};

// Admin: PATCH /api/admin/misinformation/:id/publish
const togglePublish = async (req, res) => {
  try {
    const resource = await Misinformation.findByPk(req.params.id);
    if (!resource) return errorResponse(res, 'Misinformation not found', 404);

    await resource.update({ published: !resource.published, updatedBy: req.admin.id });
    return successResponse(res, resource, `Misinformation ${resource.published ? 'published' : 'unpublished'} successfully`);
  } catch (error) {
    console.error('Toggle publish misinformation error:', error);
    return errorResponse(res, 'Error toggling publish status', 500);
  }
};

module.exports = { getAll, getById, adminGetAll, create, update, remove, togglePublish };
