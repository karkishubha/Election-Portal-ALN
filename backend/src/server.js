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
    // Connect to MySQL
    await connectDB();

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
