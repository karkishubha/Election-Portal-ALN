/**
 * Test password verification against database
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

async function testPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Get admin user
    const [users] = await sequelize.query(
      `SELECT email, hashed_password FROM AdminUsers WHERE email = 'admin@votenepal.org'`
    );

    if (!users || users.length === 0) {
      console.log('❌ No admin user found');
      process.exit(1);
    }

    const user = users[0];
    console.log('\nAdmin User in Database:');
    console.log('Email:', user.email);
    console.log('Hash length:', user.hashed_password.length);
    console.log('Hash (first 50 chars):', user.hashed_password.substring(0, 50));

    // Test password comparison
    const plainPassword = 'admin123';
    const isMatch = await bcrypt.compare(plainPassword, user.hashed_password);
    
    console.log('\nPassword Test:');
    console.log('Plain password:', plainPassword);
    console.log('Match result:', isMatch);

    if (isMatch) {
      console.log('✅ Password verification PASSED - Login should work');
    } else {
      console.log('❌ Password verification FAILED - Login will not work');
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testPassword();
