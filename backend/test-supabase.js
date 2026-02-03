/**
 * Test Supabase PostgreSQL Connection
 * Run with: node test-supabase.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const testConnection = async () => {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file');
    console.log('Add: DATABASE_URL=postgresql://postgres:password@host:5432/postgres');
    process.exit(1);
  }

  console.log('🔄 Testing Supabase connection...');
  console.log('URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password

  const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Supabase PostgreSQL Connected Successfully!');
    
    // Test table creation
    await sequelize.query('SELECT version();');
    console.log('✅ Database is ready for use');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();
