/**
 * Controllers Index
 * Nepal Election Portal
 */

const authController = require('./authController');
const uploadController = require('./uploadController');
const voterEducationController = require('./voterEducationController');
const electionIntegrityController = require('./electionIntegrityController');
const violationsController = require('./violationsController');
const misinformationController = require('./misinformationController');
const newsletterController = require('./newsletterController');
const politicalPartyController = require('./politicalPartyController');
const infographicsController = require('./infographicsController');
const videosController = require('./videosController');
const explainersController = require('./explainersController');
const officialAnnouncementsController = require('./officialAnnouncementsController');

module.exports = {
  authController,
  uploadController,
  voterEducationController,
  electionIntegrityController,
  violationsController,
  misinformationController,
  newsletterController,
  politicalPartyController,
  infographicsController,
  videosController,
  explainersController,
  officialAnnouncementsController,
};
