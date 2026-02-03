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
      attributes: { exclude: ['manifestoPdfData'] }, // Don't send binary data in list
      order: [['displayOrder', 'ASC'], ['partyName', 'ASC']],
      offset: skip,
      limit,
    });

    // Add hasManifestoPdf flag to each party
    const partiesWithFlag = rows.map(party => {
      const partyData = party.toJSON();
      partyData.hasManifestoPdf = !!party.manifestoPdfFilename;
      return partyData;
    });

    return paginatedResponse(
      res,
      partiesWithFlag,
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
      attributes: { exclude: ['manifestoPdfData'] }, // Don't send binary data in list
      order: [['displayOrder', 'ASC'], ['partyName', 'ASC']],
      offset: skip,
      limit,
    });

    // Add hasManifestoPdf flag to each party
    const partiesWithFlag = rows.map(party => {
      const partyData = party.toJSON();
      partyData.hasManifestoPdf = !!party.manifestoPdfFilename;
      return partyData;
    });

    return paginatedResponse(
      res,
      partiesWithFlag,
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

/**
 * @desc    Upload manifesto PDF to database
 * @route   POST /api/admin/parties/:id/manifesto
 * @access  Private
 */
const uploadManifesto = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const party = await PoliticalParty.findByPk(req.params.id);

    if (!party) {
      return errorResponse(res, 'Party not found', 404);
    }

    // Store the PDF binary data in the database
    await party.update({
      manifestoPdfData: req.file.buffer,
      manifestoPdfFilename: req.file.originalname,
      updatedBy: req.admin.id,
    });

    return successResponse(res, { 
      message: 'Manifesto uploaded successfully',
      filename: req.file.originalname 
    }, 'Manifesto uploaded successfully');
  } catch (error) {
    console.error('Upload manifesto error:', error);
    return errorResponse(res, 'Error uploading manifesto', 500);
  }
};

/**
 * @desc    Get manifesto PDF from database
 * @route   GET /api/parties/:id/manifesto
 * @access  Public
 */
const getManifesto = async (req, res) => {
  try {
    const party = await PoliticalParty.findByPk(req.params.id, {
      attributes: ['id', 'partyName', 'manifestoPdfData', 'manifestoPdfFilename'],
    });

    if (!party) {
      return errorResponse(res, 'Party not found', 404);
    }

    if (!party.manifestoPdfData) {
      return errorResponse(res, 'No manifesto available for this party', 404);
    }

    // Set headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${party.manifestoPdfFilename || 'manifesto.pdf'}"`);
    
    // Send the binary data
    return res.send(party.manifestoPdfData);
  } catch (error) {
    console.error('Get manifesto error:', error);
    return errorResponse(res, 'Error retrieving manifesto', 500);
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
  uploadManifesto,
  getManifesto,
};
