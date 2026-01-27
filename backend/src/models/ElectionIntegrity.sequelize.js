/**
 * Election Integrity Model - Sequelize
 * Nepal Election Portal
 * 
 * Resources related to election integrity, transparency, and combating misinformation.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ElectionIntegrity = sequelize.define('ElectionIntegrity', {
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
  category: {
    type: DataTypes.ENUM(
      'code_of_conduct',
      'misinformation',
      'transparency',
      'observer_guide',
      'complaint_mechanism',
      'legal_framework',
      'other'
    ),
    allowNull: false,
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
  tableName: 'election_integrity',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['published', 'category'] },
    { fields: ['created_at'] },
  ],
});

// Static method to get published by category
ElectionIntegrity.getPublishedByCategory = async function(category = null) {
  const where = { published: true };
  if (category) where.category = category;
  return this.findAll({
    where,
    order: [['createdAt', 'DESC']],
  });
};

module.exports = ElectionIntegrity;
