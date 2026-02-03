/**
 * Models Index - Sequelize
 * Nepal Election Portal
 * 
 * Central export for all Sequelize models.
 */

const AdminUser = require('./AdminUser.sequelize');
const VoterEducation = require('./VoterEducation.sequelize');
const ElectionIntegrity = require('./ElectionIntegrity.sequelize');
const Violation = require('./Violation.sequelize');
const Misinformation = require('./Misinformation.sequelize');
const Newsletter = require('./Newsletter.sequelize');
const PoliticalParty = require('./PoliticalParty.sequelize');
const Infographic = require('./Infographic.sequelize');
const Video = require('./Video.sequelize');
const Explainer = require('./Explainer.sequelize');
const OfficialAnnouncement = require('./OfficialAnnouncement.sequelize');

// Define associations
AdminUser.hasMany(VoterEducation, { foreignKey: 'createdBy', as: 'voterEducations' });
VoterEducation.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

AdminUser.hasMany(ElectionIntegrity, { foreignKey: 'createdBy', as: 'electionIntegrities' });
ElectionIntegrity.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

AdminUser.hasMany(Newsletter, { foreignKey: 'createdBy', as: 'newsletters' });
Newsletter.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

AdminUser.hasMany(PoliticalParty, { foreignKey: 'createdBy', as: 'parties' });
PoliticalParty.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

AdminUser.hasMany(Violation, { foreignKey: 'createdBy', as: 'violations' });
Violation.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

AdminUser.hasMany(Misinformation, { foreignKey: 'createdBy', as: 'misinformations' });
Misinformation.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

AdminUser.hasMany(Infographic, { foreignKey: 'createdBy', as: 'infographics' });
Infographic.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

AdminUser.hasMany(Video, { foreignKey: 'createdBy', as: 'videos' });
Video.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

AdminUser.hasMany(Explainer, { foreignKey: 'createdBy', as: 'explainers' });
Explainer.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

AdminUser.hasMany(OfficialAnnouncement, { foreignKey: 'createdBy', as: 'officialAnnouncements' });
OfficialAnnouncement.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });

module.exports = {
  AdminUser,
  VoterEducation,
  ElectionIntegrity,
  Newsletter,
  PoliticalParty,
  Violation,
  Misinformation,
  Infographic,
  Video,
  Explainer,
  OfficialAnnouncement,
};
