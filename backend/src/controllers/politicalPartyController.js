/**
 * Political Party Controller - Sequelize
 * Nepal Election Portal
 * 
 * CRUD operations for political parties.
 * Neutral presentation - no endorsements.
 */

const { PoliticalParty } = require('../models');
const { Op } = require('sequelize');
const {
  successResponse,
  paginatedResponse,
  errorResponse,
  getPagination,
  buildPaginationMeta,
} = require('../utils');

/**
 * @desc    Get all parties (published only)
 * @route   GET /api/parties
 * @access  Public
 */
const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

    const where = { published: true };

    const { count, rows } = await PoliticalParty.findAndCountAll({
      where,
      order: [['displayOrder', 'ASC'], ['partyName', 'ASC']],
      offset: skip,
      limit,
    });

    return paginatedResponse(
      res,
      rows,
      buildPaginationMeta(count, page, limit),
      'Political parties retrieved'
    );
  } catch (error) {
    console.error('Get parties error:', error);
    return errorResponse(res, 'Error retrieving parties', 500);
  }
};

/**
 * @desc    Get all (including unpublished - admin only)
 * @route   GET /api/admin/parties
 * @access  Private
 */
const adminGetAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { published } = req.query;

    const where = {};
    if (published !== undefined) where.published = published === 'true';

    const { count, rows } = await PoliticalParty.findAndCountAll({
      where,
      order: [['displayOrder', 'ASC'], ['partyName', 'ASC']],
      offset: skip,
      limit,
    });

    return paginatedResponse(
      res,
      rows,
      buildPaginationMeta(count, page, limit),
      'Political parties retrieved'
    );
  } catch (error) {
    console.error('Admin get parties error:', error);
    return errorResponse(res, 'Error retrieving parties', 500);
  }
};

/**
 * @desc    Get single party
 * @route   GET /api/parties/:id
 * @access  Public
 */
const getById = async (req, res) => {
  try {
    const party = await PoliticalParty.findOne({
      where: {
        id: req.params.id,
        published: true,
      },
    });

    if (!party) {
      return errorResponse(res, 'Party not found', 404);
    }

    return successResponse(res, party, 'Party retrieved');
  } catch (error) {
    console.error('Get party by ID error:', error);
    return errorResponse(res, 'Error retrieving party', 500);
  }
};

/**
 * @desc    Create party
 * @route   POST /api/admin/parties
 * @access  Private
 */
const create = async (req, res) => {
  try {
    const {
      partyName,
      partyNameNepali,
      abbreviation,
      partySymbolUrl,
      officialWebsite,
      manifestoPdfUrl,
      prListPdfUrl,
      description,
      displayOrder,
      published,
    } = req.body;

    const party = await PoliticalParty.create({
      partyName,
      partyNameNepali,
      abbreviation,
      partySymbolUrl,
      officialWebsite,
      manifestoPdfUrl,
      prListPdfUrl,
      description,
      displayOrder: displayOrder || 0,
      published: published || false,
      createdBy: req.admin.id,
    });

    return successResponse(res, party, 'Party created successfully', 201);
  } catch (error) {
    console.error('Create party error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error creating party', 500);
  }
};

/**
 * @desc    Update party
 * @route   PUT /api/admin/parties/:id
 * @access  Private
 */
const update = async (req, res) => {
  try {
    const {
      partyName,
      partyNameNepali,
      abbreviation,
      partySymbolUrl,
      officialWebsite,
      manifestoPdfUrl,
      prListPdfUrl,
      description,
      displayOrder,
      published,
    } = req.body;

    const party = await PoliticalParty.findByPk(req.params.id);

    if (!party) {
      return errorResponse(res, 'Party not found', 404);
    }

    await party.update({
      ...(partyName !== undefined && { partyName }),
      ...(partyNameNepali !== undefined && { partyNameNepali }),
      ...(abbreviation !== undefined && { abbreviation }),
      ...(partySymbolUrl !== undefined && { partySymbolUrl }),
      ...(officialWebsite !== undefined && { officialWebsite }),
      ...(manifestoPdfUrl !== undefined && { manifestoPdfUrl }),
      ...(prListPdfUrl !== undefined && { prListPdfUrl }),
      ...(description !== undefined && { description }),
      ...(displayOrder !== undefined && { displayOrder }),
      ...(published !== undefined && { published }),
      updatedBy: req.admin.id,
    });

    return successResponse(res, party, 'Party updated successfully');
  } catch (error) {
    console.error('Update party error:', error);
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Error updating party', 500);
  }
};

/**
 * @desc    Delete party
 * @route   DELETE /api/admin/parties/:id
 * @access  Private
 */
const remove = async (req, res) => {
  try {
    const party = await PoliticalParty.findByPk(req.params.id);

    if (!party) {
      return errorResponse(res, 'Party not found', 404);
    }

    await party.destroy();

    return successResponse(res, null, 'Party deleted successfully');
  } catch (error) {
    console.error('Delete party error:', error);
    return errorResponse(res, 'Error deleting party', 500);
  }
};

/**
 * @desc    Toggle publish status
 * @route   PATCH /api/admin/parties/:id/publish
 * @access  Private
 */
const togglePublish = async (req, res) => {
  try {
    const party = await PoliticalParty.findByPk(req.params.id);

    if (!party) {
      return errorResponse(res, 'Party not found', 404);
    }

    await party.update({
      published: !party.published,
      updatedBy: req.admin.id,
    });

    return successResponse(
      res,
      party,
      `Party ${party.published ? 'published' : 'unpublished'} successfully`
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
