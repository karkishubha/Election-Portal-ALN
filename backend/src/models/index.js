/**
 * Models Index - Sequelize
 * Nepal Election Portal
 * 
 * Central export for all Sequelize models.
 */

const AdminUser = require('./AdminUser.sequelize');
const VoterEducation = require('./VoterEducation.sequelize');
const ElectionIntegrity = require('./ElectionIntegrity.sequelize');
const Newsletter = require('./Newsletter.sequelize');
const PoliticalParty = require('./PoliticalParty.sequelize');

// Define associations
AdminUser.hasMany(VoterEducation, { foreignKey: 'createdBy', as: 'voterEducations' });
VoterEducation.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

AdminUser.hasMany(ElectionIntegrity, { foreignKey: 'createdBy', as: 'electionIntegrities' });
ElectionIntegrity.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

AdminUser.hasMany(Newsletter, { foreignKey: 'createdBy', as: 'newsletters' });
Newsletter.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

AdminUser.hasMany(PoliticalParty, { foreignKey: 'createdBy', as: 'parties' });
PoliticalParty.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

module.exports = {
  AdminUser,
  VoterEducation,
  ElectionIntegrity,
  Newsletter,
  PoliticalParty,
};
