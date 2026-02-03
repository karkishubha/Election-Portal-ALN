/**
 * Update Election Integrity ENUM Script
 * Adds 'violations' option to election_integrity.category
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
      ALTER TABLE election_integrity 
      MODIFY COLUMN category ENUM('code_of_conduct','violations','misinformation','transparency','observer_guide','complaint_mechanism','legal_framework','other') 
      NOT NULL
    `);
    console.log("✅ Election Integrity category ENUM updated successfully! Added: 'violations'");
  } catch (error) {
    console.error('❌ Error updating ENUM:', error.message);
  } finally {
    await conn.end();
  }
}

updateEnum();