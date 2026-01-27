/**
 * Admin Seed Script - Sequelize/MySQL
 * Nepal Election Portal
 * 
 * Creates initial admin user for the system.
 * Run with: npm run seed:admin
 * 
 * Uses credentials from environment variables:
 * - ADMIN_EMAIL
 * - ADMIN_PASSWORD
 */

require('dotenv').config();

const { sequelize } = require('../config/database');
const { AdminUser } = require('../models');

const seedAdmin = async () => {
  try {
    console.log('🌱 Starting admin seed...');
    
    // Connect to MySQL
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    // Sync the AdminUser model
    await AdminUser.sync();
    console.log('✅ AdminUser table synchronized');

    // Get credentials from env
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    }

    if (password.length < 8) {
      throw new Error('ADMIN_PASSWORD must be at least 8 characters');
    }

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ where: { email } });
    
    if (existingAdmin) {
      console.log(`⚠️  Admin with email "${email}" already exists`);
      console.log('   Use the existing account or delete it first');
    } else {
      // Create new admin
      const admin = await AdminUser.create({
        email,
        hashedPassword: password, // Will be hashed by beforeCreate hook
        role: 'admin',
        isActive: true,
      });

      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log('');
      console.log('🔐 IMPORTANT: Change the password after first login!');
    }

    await sequelize.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    try {
      await sequelize.close();
    } catch (e) {
      // Ignore close errors
    }
    process.exit(1);
  }
};

seedAdmin();
