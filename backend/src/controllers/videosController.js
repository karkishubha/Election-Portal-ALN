/**
 * Videos Controller
 */

const { Video } = require('../models');
const { successResponse, paginatedResponse, errorResponse, getPagination, buildPaginationMeta } = require('../utils');

const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { language } = req.query;
    const where = { published: true };
    if (language) where.language = language;
    const { count, rows } = await Video.findAndCountAll({ where, order: [['createdAt', 'DESC']], offset: skip, limit });
    return paginatedResponse(res, rows, buildPaginationMeta(count, page, limit), 'Videos retrieved');
  } catch (error) {
    console.error('Get videos error:', error);
    return errorResponse(res, 'Error retrieving videos', 500);
  }
};

const getById = async (req, res) => {
  try {
    const item = await Video.findOne({ where: { id: req.params.id, published: true } });
    if (!item) return errorResponse(res, 'Video not found', 404);
    return successResponse(res, item, 'Video retrieved');
  } catch (error) {
    console.error('Get video by ID error:', error);
    return errorResponse(res, 'Error retrieving video', 500);
  }
};

const adminGetAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { language, published } = req.query;
    const where = {};
    if (language) where.language = language;
    if (published !== undefined) where.published = published === 'true';
    const { count, rows } = await Video.findAndCountAll({ where, order: [['createdAt', 'DESC']], offset: skip, limit });
    return paginatedResponse(res, rows, buildPaginationMeta(count, page, limit), 'Videos retrieved');
  } catch (error) {
    console.error('Admin get videos error:', error);
    return errorResponse(res, 'Error retrieving videos', 500);
  }
};

const create = async (req, res) => {
  try {
    const { title, description, resourceUrl, language, published } = req.body;
    const item = await Video.create({ title, description, resourceUrl, language: language || 'ne', published: published || false, createdBy: req.admin.id });
    return successResponse(res, item, 'Video created successfully', 201);
  } catch (error) {
    console.error('Create video error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error creating video', 500);
  }
};

const update = async (req, res) => {
  try {
    const { title, description, resourceUrl, language, published } = req.body;
    const item = await Video.findByPk(req.params.id);
    if (!item) return errorResponse(res, 'Video not found', 404);
    await item.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(resourceUrl !== undefined && { resourceUrl }),
      ...(language !== undefined && { language }),
      ...(published !== undefined && { published }),
      updatedBy: req.admin.id,
    });
    return successResponse(res, item, 'Video updated successfully');
  } catch (error) {
    console.error('Update video error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error updating video', 500);
  }
};

const remove = async (req, res) => {
  try {
    const item = await Video.findByPk(req.params.id);
    if (!item) return errorResponse(res, 'Video not found', 404);
    await item.destroy();
    return successResponse(res, null, 'Video deleted successfully');
  } catch (error) {
    console.error('Delete video error:', error);
    return errorResponse(res, 'Error deleting video', 500);
  }
};

const togglePublish = async (req, res) => {
  try {
    const item = await Video.findByPk(req.params.id);
    if (!item) return errorResponse(res, 'Video not found', 404);
    await item.update({ published: !item.published, updatedBy: req.admin.id });
    return successResponse(res, item, `Video ${item.published ? 'published' : 'unpublished'} successfully`);
  } catch (error) {
    console.error('Toggle publish video error:', error);
    return errorResponse(res, 'Error toggling publish status', 500);
  }
};

module.exports = { getAll, getById, adminGetAll, create, update, remove, togglePublish };
