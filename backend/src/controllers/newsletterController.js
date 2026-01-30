/**
 * Newsletter Controller - Sequelize
 * Nepal Election Portal
 * 
 * CRUD operations for newsletters (ALN/DRN).
 */

const { Newsletter } = require('../models');
const { Op } = require('sequelize');
const {
  successResponse,
  paginatedResponse,
  errorResponse,
  getPagination,
  buildPaginationMeta,
} = require('../utils');

/**
 * @desc    Get all newsletters (published only)
 * @route   GET /api/newsletters
 * @access  Public
 */
const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { source, language } = req.query;

    const where = { published: true };
    if (source) where.source = source;
    if (language) where.language = language;

    const { count, rows } = await Newsletter.findAndCountAll({
      where,
      attributes: { exclude: ['pdfData'] }, // Exclude large PDF data from list
      order: [['publishedDate', 'DESC']],
      offset: skip,
      limit,
    });

    return paginatedResponse(
      res,
      rows,
      buildPaginationMeta(count, page, limit),
      'Newsletters retrieved'
    );
  } catch (error) {
    console.error('Get newsletters error:', error);
    return errorResponse(res, 'Error retrieving newsletters', 500);
  }
};

/**
 * @desc    Get all (including unpublished - admin only)
 * @route   GET /api/admin/newsletters
 * @access  Private
 */
const adminGetAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { source, language, published } = req.query;

    const where = {};
    if (source) where.source = source;
    if (language) where.language = language;
    if (published !== undefined) where.published = published === 'true';

    const { count, rows } = await Newsletter.findAndCountAll({
      where,
      attributes: { exclude: ['pdfData'] }, // Exclude large PDF data from list
      order: [['publishedDate', 'DESC']],
      offset: skip,
      limit,
    });

    return paginatedResponse(
      res,
      rows,
      buildPaginationMeta(count, page, limit),
      'Newsletters retrieved'
    );
  } catch (error) {
    console.error('Admin get newsletters error:', error);
    return errorResponse(res, 'Error retrieving newsletters', 500);
  }
};

/**
 * @desc    Get single newsletter with PDF data
 * @route   GET /api/newsletters/:id
 * @access  Public
 */
const getById = async (req, res) => {
  try {
    const newsletter = await Newsletter.findOne({
      where: {
        id: req.params.id,
        published: true,
      },
    });

    if (!newsletter) {
      return errorResponse(res, 'Newsletter not found', 404);
    }

    return successResponse(res, newsletter, 'Newsletter retrieved');
  } catch (error) {
    console.error('Get newsletter by ID error:', error);
    return errorResponse(res, 'Error retrieving newsletter', 500);
  }
};

/**
 * @desc    Create newsletter
 * @route   POST /api/admin/newsletters
 * @access  Private
 */
const create = async (req, res) => {
  try {
    const { title, summary, pdfUrl, pdfData, pdfFileName, source, publishedDate, language, published } = req.body;

    const newsletter = await Newsletter.create({
      title,
      summary,
      pdfUrl,
      pdfData,
      pdfFileName,
      source: source || 'ALN_DRN',
      publishedDate,
      language: language || 'ne',
      published: published || false,
      createdBy: req.admin.id,
    });

    // Don't return pdfData in response (too large)
    const responseData = newsletter.toJSON();
    delete responseData.pdfData;

    return successResponse(res, responseData, 'Newsletter created successfully', 201);
  } catch (error) {
    console.error('Create newsletter error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error creating newsletter', 500);
  }
};

/**
 * @desc    Update newsletter
 * @route   PUT /api/admin/newsletters/:id
 * @access  Private
 */
const update = async (req, res) => {
  try {
    const { title, summary, pdfUrl, source, publishedDate, language, published } = req.body;

    const newsletter = await Newsletter.findByPk(req.params.id);

    if (!newsletter) {
      return errorResponse(res, 'Newsletter not found', 404);
    }

    await newsletter.update({
      ...(title !== undefined && { title }),
      ...(summary !== undefined && { summary }),
      ...(pdfUrl !== undefined && { pdfUrl }),
      ...(source !== undefined && { source }),
      ...(publishedDate !== undefined && { publishedDate }),
      ...(language !== undefined && { language }),
      ...(published !== undefined && { published }),
      updatedBy: req.admin.id,
    });

    return successResponse(res, newsletter, 'Newsletter updated successfully');
  } catch (error) {
    console.error('Update newsletter error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error updating newsletter', 500);
  }
};

/**
 * @desc    Delete newsletter
 * @route   DELETE /api/admin/newsletters/:id
 * @access  Private
 */
const remove = async (req, res) => {
  try {
    const newsletter = await Newsletter.findByPk(req.params.id);

    if (!newsletter) {
      return errorResponse(res, 'Newsletter not found', 404);
    }

    await newsletter.destroy();

    return successResponse(res, null, 'Newsletter deleted successfully');
  } catch (error) {
    console.error('Delete newsletter error:', error);
    return errorResponse(res, 'Error deleting newsletter', 500);
  }
};

/**
 * @desc    Toggle publish status
 * @route   PATCH /api/admin/newsletters/:id/publish
 * @access  Private
 */
const togglePublish = async (req, res) => {
  try {
    const newsletter = await Newsletter.findByPk(req.params.id);

    if (!newsletter) {
      return errorResponse(res, 'Newsletter not found', 404);
    }

    await newsletter.update({
      published: !newsletter.published,
      updatedBy: req.admin.id,
    });

    return successResponse(
      res,
      newsletter,
      `Newsletter ${newsletter.published ? 'published' : 'unpublished'} successfully`
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
