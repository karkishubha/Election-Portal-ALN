/**
 * Voter Education Model - Sequelize
 * Nepal Election Portal
 * 
 * Educational resources for voters including PDFs in multiple languages.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VoterEducation = sequelize.define('VoterEducation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'pdf_url',
  },
  language: {
    type: DataTypes.ENUM('en', 'ne', 'other'),
    defaultValue: 'ne',
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
  tableName: 'voter_education',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['published', 'language'] },
    { fields: ['created_at'] },
  ],
});

// Static method to get published resources
VoterEducation.getPublished = async function(language = null) {
  const where = { published: true };
  if (language) where.language = language;
  return this.findAll({
    where,
    order: [['createdAt', 'DESC']],
  });
};

module.exports = VoterEducation;
