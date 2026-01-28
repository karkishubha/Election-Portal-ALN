-- Nepal Election Portal 2082 - Database Setup Script (Aligned to Sequelize Models)
-- Creates consistent lowercase snake_case tables and required columns

-- Create database
CREATE DATABASE IF NOT EXISTS nepal_election_portal;
USE nepal_election_portal;

-- Ensure a clean slate
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS AdminUsers, PoliticalParties, VoterEducations, ElectionIntegrities, Newsletters;
DROP TABLE IF EXISTS admin_users, political_parties, voter_education, election_integrity, newsletters;
SET FOREIGN_KEY_CHECKS = 1;

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  hashed_password VARCHAR(255) NOT NULL,
  role ENUM('admin') DEFAULT 'admin',
  is_active TINYINT(1) DEFAULT 1,
  last_login DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Political Parties Table
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
  INDEX idx_parties_published_display (published, display_order),
  CONSTRAINT fk_parties_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id),
  CONSTRAINT fk_parties_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id)
);

-- Voter Education Table
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
  INDEX idx_voter_published_language (published, language),
  INDEX idx_voter_created_at (created_at),
  CONSTRAINT fk_voter_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id),
  CONSTRAINT fk_voter_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id)
);

-- Election Integrity Table
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
  INDEX idx_integrity_published_category (published, category),
  INDEX idx_integrity_created_at (created_at),
  CONSTRAINT fk_integrity_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id),
  CONSTRAINT fk_integrity_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id)
);

-- Newsletters Table
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
  INDEX idx_newsletters_published_date (published, published_date),
  INDEX idx_newsletters_source (source),
  CONSTRAINT fk_news_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id),
  CONSTRAINT fk_news_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id)
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, hashed_password, role, is_active)
VALUES ('admin@votenepal.org', '$2a$12$rC5Qn6Qkks0KkGqKJkTQCeI1m8G2xZ3Q9bH9D2Gm2qY1q8QeV1bQe', 'admin', 1)
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample political parties
INSERT INTO political_parties (party_name, party_name_nepali, abbreviation, description, display_order, published) 
VALUES 
  ('Nepali Congress', 'नेपाली कांग्रेस', 'NC', 'Center-left political party in Nepal', 1, 1),
  ('CPN (UML)', 'नेकपा (एमाले)', 'UML', 'Communist Party of Nepal (Unified Marxist–Leninist)', 2, 1),
  ('CPN (Maoist Center)', 'नेकपा (माओवादी केन्द्र)', 'MC', 'Communist Party of Nepal (Maoist Centre)', 3, 1)
ON DUPLICATE KEY UPDATE party_name=party_name;

-- Insert sample voter education materials
INSERT INTO voter_education (title, description, pdf_url, language, published) 
VALUES 
  ('How to Vote in Nepal', 'Step-by-step guide to the voting process', '/docs/how-to-vote-en.pdf', 'en', 1),
  ('नेपालमा भोट दिने तरिका', 'भोट दिने प्रक्रियाको विस्तृत गाइड', '/docs/how-to-vote-ne.pdf', 'ne', 1),
  ('Electoral System Explained', 'Understanding FPTP and PR systems', '/docs/electoral-system-en.pdf', 'en', 1),
  ('निर्वाचन प्रणाली व्याख्या', 'एफपीटीपी र पीआर प्रणालीको विवरण', '/docs/electoral-system-ne.pdf', 'ne', 1)
ON DUPLICATE KEY UPDATE title=title;

COMMIT;
