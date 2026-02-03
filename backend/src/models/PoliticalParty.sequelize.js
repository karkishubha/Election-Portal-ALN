/**
 * Political Party Model - Sequelize
 * Nepal Election Portal
 * 
 * Information about registered political parties.
 * Neutral presentation - no endorsements.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PoliticalParty = sequelize.define('PoliticalParty', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  partyName: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'party_name',
    validate: {
      notEmpty: true,
      len: [1, 150],
    },
  },
  partyNameNepali: {
    type: DataTypes.STRING(150),
    allowNull: true,
    field: 'party_name_nepali',
  },
  abbreviation: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  partySymbolUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'party_symbol_url',
  },
  officialWebsite: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'official_website',
  },
  manifestoPdfUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'manifesto_pdf_url',
  },
  manifestoPdfData: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
    field: 'manifesto_pdf_data',
  },
  manifestoPdfFilename: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'manifesto_pdf_filename',
  },
  prListPdfUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'pr_list_pdf_url',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'display_order',
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'admin_users',
      key: 'id',
    },
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'updated_by',
    references: {
      model: 'admin_users',
      key: 'id',
    },
  },
}, {
  tableName: 'political_parties',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['published', 'display_order'] },
  ],
});

// Static method to get published parties
PoliticalParty.getPublished = async function() {
  return this.findAll({
    where: { published: true },
    order: [['displayOrder', 'ASC'], ['partyName', 'ASC']],
  });
};

module.exports = PoliticalParty;
