/**
 * Database Setup Script
 * Creates the Nepal Election Portal database and tables
 * Run this from the backend directory: node setup-database.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

// First, create a connection without specifying the database
const sequelize = new Sequelize('', process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: console.log,
});

async function setupDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    // Create database
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`✅ Database '${process.env.DB_NAME}' created`);

    // Close this connection and create a new one with the database
    await sequelize.close();

    // Connect to the new database
    const dbSequelize = new Sequelize(
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

    // Create tables
    console.log('Creating tables...');
    // Temporarily disable foreign key checks to allow clean drops
    await dbSequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // AdminUser table
    await dbSequelize.query(`DROP TABLE IF EXISTS admin_users`);
    await dbSequelize.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        hashed_password VARCHAR(255) NOT NULL,
        role ENUM('admin') DEFAULT 'admin',
        is_active TINYINT(1) DEFAULT 1,
        last_login DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ AdminUsers table created');

    // PoliticalParty table
    await dbSequelize.query(`DROP TABLE IF EXISTS political_parties`);
    await dbSequelize.query(`
      CREATE TABLE IF NOT EXISTS political_parties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        party_name VARCHAR(150) NOT NULL,
        party_name_nepali VARCHAR(150),
        abbreviation VARCHAR(20),
        party_symbol_url VARCHAR(500),
        official_website VARCHAR(255),
        manifesto_pdf_url VARCHAR(500),
        pr_list_pdf_url VARCHAR(500),
        description TEXT,
        display_order INT DEFAULT 0,
        published TINYINT(1) DEFAULT 0,
        created_by INT NULL,
        updated_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_political_parties_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id),
        CONSTRAINT fk_political_parties_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id)
      )
    `);
    console.log('✅ PoliticalParties table created');

    // VoterEducation table
    await dbSequelize.query(`DROP TABLE IF EXISTS voter_education`);
    await dbSequelize.query(`
      CREATE TABLE IF NOT EXISTS voter_education (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        pdf_url VARCHAR(500) NOT NULL,
        language ENUM('en', 'ne', 'other') DEFAULT 'ne',
        published TINYINT(1) DEFAULT 0,
        created_by INT NULL,
        updated_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_voter_education_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id),
        CONSTRAINT fk_voter_education_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id)
      )
    `);
    console.log('✅ VoterEducations table created');

    // ElectionIntegrity table
    await dbSequelize.query(`DROP TABLE IF EXISTS election_integrity`);
    await dbSequelize.query(`
      CREATE TABLE IF NOT EXISTS election_integrity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        pdf_url VARCHAR(500) NOT NULL,
        category ENUM('code_of_conduct','misinformation','transparency','observer_guide','complaint_mechanism','legal_framework','other') NOT NULL,
        language ENUM('en', 'ne', 'other') DEFAULT 'ne',
        published TINYINT(1) DEFAULT 0,
        created_by INT NULL,
        updated_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_election_integrity_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id),
        CONSTRAINT fk_election_integrity_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id)
      )
    `);
    console.log('✅ ElectionIntegrities table created');

    // Newsletter table
    await dbSequelize.query(`DROP TABLE IF EXISTS newsletters`);
    await dbSequelize.query(`
      CREATE TABLE IF NOT EXISTS newsletters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        summary TEXT NOT NULL,
        pdf_url VARCHAR(500) NOT NULL,
        source ENUM('ALN', 'DRN', 'ALN_DRN', 'other') DEFAULT 'ALN_DRN',
        published_date DATE NOT NULL,
        language ENUM('en', 'ne', 'other') DEFAULT 'ne',
        published TINYINT(1) DEFAULT 0,
        created_by INT NULL,
        updated_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_newsletters_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id),
        CONSTRAINT fk_newsletters_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id)
      )
    `);
    console.log('✅ Newsletters table created');
    // Re-enable foreign key checks
    await dbSequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Insert sample data
    console.log('\nInserting sample data...');

    // Inserting sample admin user with properly hashed password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    // Delete existing admin user if any
    await dbSequelize.query(`DELETE FROM admin_users WHERE email = 'admin@votenepal.org'`);
    // Insert fresh admin user
    await dbSequelize.query(`
      INSERT INTO admin_users (email, hashed_password, role, is_active, created_at, updated_at) 
      VALUES ('admin@votenepal.org', ?, 'admin', true, NOW(), NOW())
    `, { replacements: [hashedPassword] });
    console.log('✅ Admin user created (email: admin@votenepal.org, password: admin123)');

    // Insert sample political parties
    await dbSequelize.query(`
      INSERT IGNORE INTO political_parties (party_name, party_name_nepali, abbreviation, description, display_order, published) 
      VALUES 
        ('Nepali Congress', 'नेपाली कांग्रेस', 'NC', 'Center-left political party in Nepal', 1, 1),
        ('CPN (UML)', 'नेकपा (एमाले)', 'UML', 'Communist Party of Nepal (Unified Marxist–Leninist)', 2, 1),
        ('CPN (Maoist Center)', 'नेकपा (माओवादी केन्द्र)', 'MC', 'Communist Party of Nepal (Maoist Centre)', 3, 1)
    `);
    console.log('✅ Sample political parties inserted');

    // Insert sample voter education materials
    await dbSequelize.query(`
      INSERT IGNORE INTO voter_education (title, description, pdf_url, language, published) 
      VALUES 
        ('How to Vote in Nepal', 'Step-by-step guide to the voting process', '/docs/how-to-vote-en.pdf', 'en', 1),
        ('नेपालमा भोट दिने तरिका', 'भोट दिने प्रक्रियाको विस्तृत गाइड', '/docs/how-to-vote-ne.pdf', 'ne', 1),
        ('Electoral System Explained', 'Understanding FPTP and PR systems', '/docs/electoral-system-en.pdf', 'en', 1),
        ('निर्वाचन प्रणाली व्याख्या', 'एफपीटीपी र पीआर प्रणालीको विवरण', '/docs/electoral-system-ne.pdf', 'ne', 1)
    `);
    console.log('✅ Sample voter education materials inserted');

    await dbSequelize.close();
    console.log('\n✅ Database setup completed successfully!');
    console.log('You can now start the backend with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
