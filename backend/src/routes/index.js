/**
 * Routes Index
 * Nepal Election Portal
 * 
 * Central route registration.
 */

const authRoutes = require('./authRoutes');
const uploadRoutes = require('./uploadRoutes');
const statsRoutes = require('./statsRoutes');
const candidatesRoutes = require('./candidatesRoutes');

// Public and Admin routes separated
const voterEducationRoutes = require('./voterEducationRoutes');
const { adminRouter: voterEducationAdminRoutes } = require('./voterEducationRoutes');

const electionIntegrityRoutes = require('./electionIntegrityRoutes');
const { adminRouter: electionIntegrityAdminRoutes } = require('./electionIntegrityRoutes');

const newsletterRoutes = require('./newsletterRoutes');
const { adminRouter: newsletterAdminRoutes } = require('./newsletterRoutes');

const politicalPartyRoutes = require('./politicalPartyRoutes');
const { adminRouter: politicalPartyAdminRoutes } = require('./politicalPartyRoutes');

/**
 * Register all routes on the Express app
 * @param {Express} app - Express application
 */
const registerRoutes = (app) => {
  // === AUTH & UPLOAD ===
  app.use('/api/auth', authRoutes);
  app.use('/api/upload', uploadRoutes);

  // === PUBLIC ROUTES (read-only) ===
  app.use('/api/stats', statsRoutes);
  app.use('/api/candidates', candidatesRoutes);
  app.use('/api/voter-education', voterEducationRoutes);
  app.use('/api/election-integrity', electionIntegrityRoutes);
  app.use('/api/newsletters', newsletterRoutes);
  app.use('/api/parties', politicalPartyRoutes);

  // === ADMIN ROUTES (protected) ===
  app.use('/api/admin/voter-education', voterEducationAdminRoutes);
  app.use('/api/admin/election-integrity', electionIntegrityAdminRoutes);
  app.use('/api/admin/newsletters', newsletterAdminRoutes);
  app.use('/api/admin/parties', politicalPartyAdminRoutes);

  // === HEALTH CHECK ===
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Nepal Election Portal API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });
};

module.exports = registerRoutes;
