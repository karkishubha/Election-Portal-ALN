/**
 * Controllers Index
 * Nepal Election Portal
 */

const authController = require('./authController');
const uploadController = require('./uploadController');
const voterEducationController = require('./voterEducationController');
const electionIntegrityController = require('./electionIntegrityController');
const newsletterController = require('./newsletterController');
const politicalPartyController = require('./politicalPartyController');

module.exports = {
  authController,
  uploadController,
  voterEducationController,
  electionIntegrityController,
  newsletterController,
  politicalPartyController,
};
