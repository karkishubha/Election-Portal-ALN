/**
 * Stats Controller
 * Nepal Election Portal
 * 
 * Provides aggregated statistics for the portal dashboard.
 */

const { VoterEducation, ElectionIntegrity, Newsletter, PoliticalParty } = require('../models');
const { successResponse, errorResponse } = require('../utils');

/**
 * @desc    Get public statistics
 * @route   GET /api/stats
 * @access  Public
 */
const getPublicStats = async (req, res) => {
  try {
    // Count published resources
    const [
      voterEducationCount,
      electionIntegrityCount,
      newsletterCount,
      partiesCount,
    ] = await Promise.all([
      VoterEducation.count({ where: { published: true } }),
      ElectionIntegrity.count({ where: { published: true } }),
      Newsletter.count({ where: { published: true } }),
      PoliticalParty.count({ where: { published: true } }),
    ]);

    const totalResources = voterEducationCount + electionIntegrityCount + newsletterCount;

    const stats = {
      totalResources,
      voterEducation: voterEducationCount,
      electionIntegrity: electionIntegrityCount,
      newsletters: newsletterCount,
      politicalParties: partiesCount,
      partnerOrganizations: 2, // ALN and DRN
      electionYear: '2082',
      accessHours: '24/7',
    };

    return successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (error) {
    console.error('[Stats] Error fetching public stats:', error);
    return errorResponse(res, 'Failed to fetch statistics', 500);
  }
};

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Admin
 */
const getAdminStats = async (req, res) => {
  try {
    // Count all resources (published and unpublished)
    const [
      voterEducationTotal,
      voterEducationPublished,
      electionIntegrityTotal,
      electionIntegrityPublished,
      newsletterTotal,
      newsletterPublished,
      partiesTotal,
      partiesPublished,
    ] = await Promise.all([
      VoterEducation.count(),
      VoterEducation.count({ where: { published: true } }),
      ElectionIntegrity.count(),
      ElectionIntegrity.count({ where: { published: true } }),
      Newsletter.count(),
      Newsletter.count({ where: { published: true } }),
      PoliticalParty.count(),
      PoliticalParty.count({ where: { published: true } }),
    ]);

    // Get recent activity (last 5 updated items across all tables)
    const [recentVoterEd, recentIntegrity, recentNewsletters, recentParties] = await Promise.all([
      VoterEducation.findAll({
        attributes: ['id', 'title', 'updatedAt', 'createdAt'],
        order: [['updatedAt', 'DESC']],
        limit: 2,
      }),
      ElectionIntegrity.findAll({
        attributes: ['id', 'title', 'updatedAt', 'createdAt'],
        order: [['updatedAt', 'DESC']],
        limit: 2,
      }),
      Newsletter.findAll({
        attributes: ['id', 'title', 'updatedAt', 'createdAt'],
        order: [['updatedAt', 'DESC']],
        limit: 2,
      }),
      PoliticalParty.findAll({
        attributes: ['id', 'partyName', 'updatedAt', 'createdAt'],
        order: [['updatedAt', 'DESC']],
        limit: 2,
      }),
    ]);

    // Combine and sort recent activity
    const recentActivity = [
      ...recentVoterEd.map(item => ({
        type: 'voter-education',
        title: item.title,
        action: item.createdAt.getTime() === item.updatedAt.getTime() ? 'Created' : 'Updated',
        timestamp: item.updatedAt,
      })),
      ...recentIntegrity.map(item => ({
        type: 'election-integrity',
        title: item.title,
        action: item.createdAt.getTime() === item.updatedAt.getTime() ? 'Created' : 'Updated',
        timestamp: item.updatedAt,
      })),
      ...recentNewsletters.map(item => ({
        type: 'newsletter',
        title: item.title,
        action: item.createdAt.getTime() === item.updatedAt.getTime() ? 'Created' : 'Updated',
        timestamp: item.updatedAt,
      })),
      ...recentParties.map(item => ({
        type: 'political-party',
        title: item.partyName,
        action: item.createdAt.getTime() === item.updatedAt.getTime() ? 'Created' : 'Updated',
        timestamp: item.updatedAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    const stats = {
      voterEducation: {
        total: voterEducationTotal,
        published: voterEducationPublished,
        unpublished: voterEducationTotal - voterEducationPublished,
      },
      electionIntegrity: {
        total: electionIntegrityTotal,
        published: electionIntegrityPublished,
        unpublished: electionIntegrityTotal - electionIntegrityPublished,
      },
      newsletters: {
        total: newsletterTotal,
        published: newsletterPublished,
        unpublished: newsletterTotal - newsletterPublished,
      },
      politicalParties: {
        total: partiesTotal,
        published: partiesPublished,
        unpublished: partiesTotal - partiesPublished,
      },
      totals: {
        resources: voterEducationTotal + electionIntegrityTotal + newsletterTotal,
        published: voterEducationPublished + electionIntegrityPublished + newsletterPublished,
        parties: partiesTotal,
      },
      recentActivity,
    };

    return successResponse(res, stats, 'Admin statistics retrieved successfully');
  } catch (error) {
    console.error('[Stats] Error fetching admin stats:', error);
    return errorResponse(res, 'Failed to fetch statistics', 500);
  }
};

module.exports = {
  getPublicStats,
  getAdminStats,
};
