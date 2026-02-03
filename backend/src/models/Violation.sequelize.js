/**
 * Violation Model - Sequelize
 * Nepal Election Portal
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Violation = sequelize.define('Violation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { notEmpty: true, len: [1, 200] },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { notEmpty: true },
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
    references: { model: 'admin_users', key: 'id' },
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'updated_by',
    references: { model: 'admin_users', key: 'id' },
  },
}, {
  tableName: 'violations',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['published'] },
    { fields: ['created_at'] },
  ],
});

module.exports = Violation;
