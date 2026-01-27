/**
 * Update Newsletter ENUM Script
 * Adds ALN_DRN option to newsletter source
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateEnum() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await conn.execute(`
      ALTER TABLE newsletters 
      MODIFY COLUMN source ENUM('ALN', 'DRN', 'ALN_DRN', 'other') 
      DEFAULT 'ALN_DRN'
    `);
    console.log('✅ Newsletter source ENUM updated successfully!');
    console.log('   Added: ALN_DRN (Combined) option');
    console.log('   New default: ALN_DRN');
  } catch (error) {
    console.error('❌ Error updating ENUM:', error.message);
  } finally {
    await conn.end();
  }
}

updateEnum();
