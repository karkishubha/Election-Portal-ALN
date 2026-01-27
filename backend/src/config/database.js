/**
 * Database Configuration - MySQL with Sequelize
 * Nepal Election Portal
 * 
 * Handles MySQL connection using Sequelize ORM.
 */

const { Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'nepal_election_portal',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true, // Use snake_case for column names
    },
  }
);

/**
 * Connect to MySQL database
 */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected Successfully');
    
    // Sync models in development (use migrations in production)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database tables synchronized');
    }
    
    return sequelize;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await sequelize.close();
  console.log('MySQL connection closed through app termination');
  process.exit(0);
});

module.exports = { sequelize, connectDB };
