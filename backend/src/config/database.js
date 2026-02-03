/**
 * Database Configuration - PostgreSQL/MySQL with Sequelize
 * Nepal Election Portal
 * 
 * Supports both PostgreSQL (production - Supabase) and MySQL (local dev).
 */

const { Sequelize } = require('sequelize');

// Check if DATABASE_URL is provided (Supabase/Postgres connection string)
const isDatabaseUrl = !!process.env.DATABASE_URL;

// Create Sequelize instance
const sequelize = isDatabaseUrl
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
        // Force IPv4 to avoid IPv6 connection issues on Render
        family: 4,
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true, // Use snake_case for column names
      },
    })
  : new Sequelize(
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
 * Connect to database (PostgreSQL or MySQL)
 */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    const dbType = isDatabaseUrl ? 'PostgreSQL (Supabase)' : 'MySQL';
    console.log(`✅ ${dbType} Connected Successfully`);
    
    // Sync models in development (use migrations in production)
    if (process.env.NODE_ENV !== 'production') {
      // Use sync() without alter to avoid "Too many keys" errors on existing tables
      // For schema changes, use migrations or manual SQL instead
      await sequelize.sync();
      console.log('✅ Database tables synchronized');
    }
    
    return sequelize;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await sequelize.close();
  console.log('Database connection closed through app termination');
  process.exit(0);
});

module.exports = { sequelize, connectDB };
