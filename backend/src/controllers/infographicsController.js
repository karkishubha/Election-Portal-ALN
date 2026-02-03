/**
 * Infographics Controller
 */

const { Infographic } = require('../models');
const { successResponse, paginatedResponse, errorResponse, getPagination, buildPaginationMeta } = require('../utils');

const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { language } = req.query;
    const where = { published: true };
    if (language) where.language = language;
    const { count, rows } = await Infographic.findAndCountAll({ where, order: [['createdAt', 'DESC']], offset: skip, limit });
    return paginatedResponse(res, rows, buildPaginationMeta(count, page, limit), 'Infographics retrieved');
  } catch (error) {
    console.error('Get infographics error:', error);
    return errorResponse(res, 'Error retrieving infographics', 500);
  }
};

const getById = async (req, res) => {
  try {
    const item = await Infographic.findOne({ where: { id: req.params.id, published: true } });
    if (!item) return errorResponse(res, 'Infographic not found', 404);
    return successResponse(res, item, 'Infographic retrieved');
  } catch (error) {
    console.error('Get infographic by ID error:', error);
    return errorResponse(res, 'Error retrieving infographic', 500);
  }
};

const adminGetAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { language, published } = req.query;
    const where = {};
    if (language) where.language = language;
    if (published !== undefined) where.published = published === 'true';
    const { count, rows } = await Infographic.findAndCountAll({ where, order: [['createdAt', 'DESC']], offset: skip, limit });
    return paginatedResponse(res, rows, buildPaginationMeta(count, page, limit), 'Infographics retrieved');
  } catch (error) {
    console.error('Admin get infographics error:', error);
    return errorResponse(res, 'Error retrieving infographics', 500);
  }
};

const create = async (req, res) => {
  try {
    const { title, description, resourceUrl, language, published } = req.body;
    const item = await Infographic.create({ title, description, resourceUrl, language: language || 'ne', published: published || false, createdBy: req.admin.id });
    return successResponse(res, item, 'Infographic created successfully', 201);
  } catch (error) {
    console.error('Create infographic error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error creating infographic', 500);
  }
};

const update = async (req, res) => {
  try {
    const { title, description, resourceUrl, language, published } = req.body;
    const item = await Infographic.findByPk(req.params.id);
    if (!item) return errorResponse(res, 'Infographic not found', 404);
    await item.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(resourceUrl !== undefined && { resourceUrl }),
      ...(language !== undefined && { language }),
      ...(published !== undefined && { published }),
      updatedBy: req.admin.id,
    });
    return successResponse(res, item, 'Infographic updated successfully');
  } catch (error) {
    console.error('Update infographic error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error updating infographic', 500);
  }
};

const remove = async (req, res) => {
  try {
    const item = await Infographic.findByPk(req.params.id);
    if (!item) return errorResponse(res, 'Infographic not found', 404);
    await item.destroy();
    return successResponse(res, null, 'Infographic deleted successfully');
  } catch (error) {
    console.error('Delete infographic error:', error);
    return errorResponse(res, 'Error deleting infographic', 500);
  }
};

const togglePublish = async (req, res) => {
  try {
    const item = await Infographic.findByPk(req.params.id);
    if (!item) return errorResponse(res, 'Infographic not found', 404);
    await item.update({ published: !item.published, updatedBy: req.admin.id });
    return successResponse(res, item, `Infographic ${item.published ? 'published' : 'unpublished'} successfully`);
  } catch (error) {
    console.error('Toggle publish infographic error:', error);
    return errorResponse(res, 'Error toggling publish status', 500);
  }
};

module.exports = { getAll, getById, adminGetAll, create, update, remove, togglePublish };
