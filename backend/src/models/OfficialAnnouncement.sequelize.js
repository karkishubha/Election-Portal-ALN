/**
 * Official Announcement Model - Sequelize
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OfficialAnnouncement = sequelize.define('OfficialAnnouncement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true, len: [1, 255] } },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  source: { type: DataTypes.STRING(200), allowNull: false, defaultValue: 'Election Commission of Nepal' },
  link: { type: DataTypes.STRING(500), allowNull: false },
  priority: { type: DataTypes.ENUM('high', 'medium', 'low'), allowNull: false, defaultValue: 'medium' },
  published: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: true, field: 'created_by', references: { model: 'admin_users', key: 'id' } },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true, field: 'updated_by', references: { model: 'admin_users', key: 'id' } },
}, {
  tableName: 'official_announcements',
  timestamps: true,
  underscored: true,
  indexes: [{ fields: ['date'] }, { fields: ['published'] }],
});

module.exports = OfficialAnnouncement;