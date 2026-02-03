/**
 * Explainers Controller
 */

const { Explainer } = require('../models');
const { successResponse, paginatedResponse, errorResponse, getPagination, buildPaginationMeta } = require('../utils');

const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { language } = req.query;
    const where = { published: true };
    if (language) where.language = language;
    const { count, rows } = await Explainer.findAndCountAll({ where, order: [['createdAt', 'DESC']], offset: skip, limit });
    return paginatedResponse(res, rows, buildPaginationMeta(count, page, limit), 'Explainers retrieved');
  } catch (error) {
    console.error('Get explainers error:', error);
    return errorResponse(res, 'Error retrieving explainers', 500);
  }
};

const getById = async (req, res) => {
  try {
    const item = await Explainer.findOne({ where: { id: req.params.id, published: true } });
    if (!item) return errorResponse(res, 'Explainer not found', 404);
    return successResponse(res, item, 'Explainer retrieved');
  } catch (error) {
    console.error('Get explainer by ID error:', error);
    return errorResponse(res, 'Error retrieving explainer', 500);
  }
};

const adminGetAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { language, published } = req.query;
    const where = {};
    if (language) where.language = language;
    if (published !== undefined) where.published = published === 'true';
    const { count, rows } = await Explainer.findAndCountAll({ where, order: [['createdAt', 'DESC']], offset: skip, limit });
    return paginatedResponse(res, rows, buildPaginationMeta(count, page, limit), 'Explainers retrieved');
  } catch (error) {
    console.error('Admin get explainers error:', error);
    return errorResponse(res, 'Error retrieving explainers', 500);
  }
};

const create = async (req, res) => {
  try {
    const { title, description, resourceUrl, language, published } = req.body;
    const item = await Explainer.create({ title, description, resourceUrl, language: language || 'ne', published: published || false, createdBy: req.admin.id });
    return successResponse(res, item, 'Explainer created successfully', 201);
  } catch (error) {
    console.error('Create explainer error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error creating explainer', 500);
  }
};

const update = async (req, res) => {
  try {
    const { title, description, resourceUrl, language, published } = req.body;
    const item = await Explainer.findByPk(req.params.id);
    if (!item) return errorResponse(res, 'Explainer not found', 404);
    await item.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(resourceUrl !== undefined && { resourceUrl }),
      ...(language !== undefined && { language }),
      ...(published !== undefined && { published }),
      updatedBy: req.admin.id,
    });
    return successResponse(res, item, 'Explainer updated successfully');
  } catch (error) {
    console.error('Update explainer error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error updating explainer', 500);
  }
};

const remove = async (req, res) => {
  try {
    const item = await Explainer.findByPk(req.params.id);
    if (!item) return errorResponse(res, 'Explainer not found', 404);
    await item.destroy();
    return successResponse(res, null, 'Explainer deleted successfully');
  } catch (error) {
    console.error('Delete explainer error:', error);
    return errorResponse(res, 'Error deleting explainer', 500);
  }
};

const togglePublish = async (req, res) => {
  try {
    const item = await Explainer.findByPk(req.params.id);
    if (!item) return errorResponse(res, 'Explainer not found', 404);
    await item.update({ published: !item.published, updatedBy: req.admin.id });
    return successResponse(res, item, `Explainer ${item.published ? 'published' : 'unpublished'} successfully`);
  } catch (error) {
    console.error('Toggle publish explainer error:', error);
    return errorResponse(res, 'Error toggling publish status', 500);
  }
};

module.exports = { getAll, getById, adminGetAll, create, update, remove, togglePublish };
