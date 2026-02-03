/**
 * Official Announcements Controller
 */

const { OfficialAnnouncement } = require('../models');
const { successResponse, paginatedResponse, errorResponse, getPagination, buildPaginationMeta } = require('../utils');

const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { priority } = req.query;
    const where = { published: true };
    if (priority) where.priority = priority;
    const { count, rows } = await OfficialAnnouncement.findAndCountAll({ where, order: [['date', 'DESC']], offset: skip, limit });
    return paginatedResponse(res, rows, buildPaginationMeta(count, page, limit), 'Announcements retrieved');
  } catch (error) {
    console.error('Get announcements error:', error);
    return errorResponse(res, 'Error retrieving announcements', 500);
  }
};

const getById = async (req, res) => {
  try {
    const item = await OfficialAnnouncement.findOne({ where: { id: req.params.id, published: true } });
    if (!item) return errorResponse(res, 'Announcement not found', 404);
    return successResponse(res, item, 'Announcement retrieved');
  } catch (error) {
    console.error('Get announcement by ID error:', error);
    return errorResponse(res, 'Error retrieving announcement', 500);
  }
};

const adminGetAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { priority, published } = req.query;
    const where = {};
    if (priority) where.priority = priority;
    if (published !== undefined) where.published = published === 'true';
    const { count, rows } = await OfficialAnnouncement.findAndCountAll({ where, order: [['date', 'DESC']], offset: skip, limit });
    return paginatedResponse(res, rows, buildPaginationMeta(count, page, limit), 'Announcements retrieved');
  } catch (error) {
    console.error('Admin get announcements error:', error);
    return errorResponse(res, 'Error retrieving announcements', 500);
  }
};

const create = async (req, res) => {
  try {
    const { title, date, source, link, priority, published } = req.body;
    const item = await OfficialAnnouncement.create({ title, date, source, link, priority: priority || 'medium', published: published ?? true, createdBy: req.admin.id });
    return successResponse(res, item, 'Announcement created successfully', 201);
  } catch (error) {
    console.error('Create announcement error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error creating announcement', 500);
  }
};

const update = async (req, res) => {
  try {
    const { title, date, source, link, priority, published } = req.body;
    const item = await OfficialAnnouncement.findByPk(req.params.id);
    if (!item) return errorResponse(res, 'Announcement not found', 404);
    await item.update({
      ...(title !== undefined && { title }),
      ...(date !== undefined && { date }),
      ...(source !== undefined && { source }),
      ...(link !== undefined && { link }),
      ...(priority !== undefined && { priority }),
      ...(published !== undefined && { published }),
      updatedBy: req.admin.id,
    });
    return successResponse(res, item, 'Announcement updated successfully');
  } catch (error) {
    console.error('Update announcement error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error updating announcement', 500);
  }
};

const remove = async (req, res) => {
  try {
    const item = await OfficialAnnouncement.findByPk(req.params.id);
    if (!item) return errorResponse(res, 'Announcement not found', 404);
    await item.destroy();
    return successResponse(res, null, 'Announcement deleted successfully');
  } catch (error) {
    console.error('Delete announcement error:', error);
    return errorResponse(res, 'Error deleting announcement', 500);
  }
};

const togglePublish = async (req, res) => {
  try {
    const item = await OfficialAnnouncement.findByPk(req.params.id);
    if (!item) return errorResponse(res, 'Announcement not found', 404);
    await item.update({ published: !item.published, updatedBy: req.admin.id });
    return successResponse(res, item, `Announcement ${item.published ? 'published' : 'unpublished'} successfully`);
  } catch (error) {
    console.error('Toggle publish announcement error:', error);
    return errorResponse(res, 'Error toggling publish status', 500);
  }
};

module.exports = { getAll, getById, adminGetAll, create, update, remove, togglePublish };
