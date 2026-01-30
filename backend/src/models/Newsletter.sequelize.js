/**
 * Newsletter Model - Sequelize
 * Nepal Election Portal
 * 
 * Newsletters from Accountability Lab Nepal (ALN) and Digital Rights Nepal (DRN).
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Newsletter = sequelize.define('Newsletter', {
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
  summary: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'pdf_url',
  },
  pdfData: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    field: 'pdf_data',
  },
  pdfFileName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'pdf_file_name',
  },
  source: {
    type: DataTypes.ENUM('ALN', 'DRN', 'ALN_DRN', 'other'),
    defaultValue: 'ALN_DRN',
  },
  publishedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'published_date',
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
  tableName: 'newsletters',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['published', 'published_date'] },
    { fields: ['source'] },
  ],
});

// Static method to get published newsletters
Newsletter.getPublished = async function(source = null) {
  const where = { published: true };
  if (source) where.source = source;
  return this.findAll({
    where,
    order: [['publishedDate', 'DESC']],
  });
};

module.exports = Newsletter;
