/**
 * Nepal Election Portal - Backend Server
 * ================================
 * 
 * A lightweight, secure API for Nepal's 2082 Election Information Portal.
 * 
 * Organization: Accountability Lab Nepal
 * Election Date: March 5, 2026 (Falgun 21, 2082 BS)
 * 
 * Features:
 * - Admin-only authentication (JWT)
 * - PDF file uploads
 * - RESTful API for voter education, election integrity, newsletters, parties
 * - Public read access, protected write access
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { connectDB } = require('./config/database');
const registerRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware');

// Import models to initialize them
require('./models');

// Initialize Express app
const app = express();

// ============ SECURITY MIDDLEWARE ============
// Helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow file access
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// ============ BODY PARSING ============
// Increased limit for base64 PDF uploads (50mb to handle large PDFs)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============ LOGGING ============
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============ STATIC FILES ============
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ============ ROUTES ============
registerRoutes(app);

// ============ ERROR HANDLING ============
app.use(notFound);
app.use(errorHandler);

// ============ SERVER STARTUP ============
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Auto-seed admin user if SEED_ADMIN is true and admin doesn't exist
    if (process.env.SEED_ADMIN === 'true') {
      const { AdminUser } = require('./models');
      const bcrypt = require('bcryptjs');
      
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@votenepal.org';
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2082';
      
      const existingAdmin = await AdminUser.findOne({ where: { email: adminEmail } });
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        await AdminUser.create({
          email: adminEmail,
          hashedPassword: hashedPassword,
          role: 'admin',
          isActive: true,
        });
        console.log(`✅ Admin user created: ${adminEmail}`);
      } else {
        console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
      }
    }

    // Auto-seed political parties from Election Commission API if SEED_PARTIES is true
    if (process.env.SEED_PARTIES === 'true') {
      const { PoliticalParty } = require('./models');
      
      const existingParties = await PoliticalParty.count();
      
      if (existingParties === 0) {
        console.log('🏛️  Seeding political parties from Election Commission API...');
        
        try {
          const CANDIDATES_URL = 'https://result.election.gov.np/JSONFiles/ElectionResultCentral2082.txt';
          const res = await fetch(CANDIDATES_URL);
          
          if (res.ok) {
            const candidates = await res.json();
            
            if (Array.isArray(candidates) && candidates.length > 0) {
              // Collect unique party names
              const uniqueParties = new Map();
              for (const c of candidates) {
                const nameNep = (c.PoliticalPartyName || '').trim();
                if (!nameNep || uniqueParties.has(nameNep)) continue;
                uniqueParties.set(nameNep, {
                  partyNameNepali: nameNep,
                  partyName: nameNep,
                  abbreviation: null,
                  partySymbolUrl: null,
                  officialWebsite: null,
                  manifestoPdfUrl: null,
                  description: 'Political party of Nepal',
                  displayOrder: 0,
                  published: true,
                });
              }
              
              const partiesToInsert = Array.from(uniqueParties.values());
              await PoliticalParty.bulkCreate(partiesToInsert, { ignoreDuplicates: true });
              console.log(`✅ ${partiesToInsert.length} political parties seeded from Election Commission`);
            }
          } else {
            console.log('⚠️  Could not fetch Election Commission data, skipping party seed');
          }
        } catch (err) {
          console.log('⚠️  Party seeding failed:', err.message);
        }
      } else {
        console.log(`ℹ️  Political parties already exist (${existingParties} parties)`);
      }
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('');
      console.log('🗳️  ========================================');
      console.log('🗳️   Nepal Election Portal - Backend Server');
      console.log('🗳️  ========================================');
      console.log(`📡  Port: ${PORT}`);
      console.log(`🌍  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️   Database: MySQL`);
      console.log(`📅  Election: March 5, 2026 (Falgun 21, 2082)`);
      console.log('');
      console.log('📚  API Endpoints:');
      console.log('    GET  /api/health              - Health check');
      console.log('    POST /api/auth/login          - Admin login');
      console.log('    GET  /api/voter-education     - Public resources');
      console.log('    GET  /api/election-integrity  - Integrity resources');
      console.log('    GET  /api/newsletters         - Newsletters');
      console.log('    GET  /api/parties             - Political parties');
      console.log('');
      console.log('🔐  Admin routes: /api/admin/*');
      console.log('🗳️  ========================================');
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app; // For testing
