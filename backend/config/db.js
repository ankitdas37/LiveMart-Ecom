const { Sequelize } = require('sequelize');
require('dotenv').config();

// DB config — vars are already validated in server.js before this loads
const sequelizeOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: false, // Never log raw SQL in any environment (may contain user data)
  pool: {
    max: 10,
    min: 2,          // Keep 2 connections warm to avoid cold-connect latency
    acquire: 60000,  // Increased for Aiven's remote latency (was 30000)
    idle: 30000,     // Keep idle connections alive longer (was 10000)
    evict: 60000,    // Check for idle connections every 60s
  },
};

// Enable TLS/SSL for database connections in production
// Set DB_SSL_REJECT=false in .env for Aiven / self-signed certs
if (process.env.NODE_ENV === 'production') {
  sequelizeOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: process.env.DB_SSL_REJECT !== 'false',
    },
    // Keep the TCP connection alive to prevent Aiven from dropping idle connections
    connectTimeout: 60000,
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  sequelizeOptions
);

/**
 * Connect to the database with exponential-backoff retry.
 * Retries up to MAX_RETRIES times before giving up.
 * This makes the server resilient to temporary Aiven DNS / network blips.
 */
const MAX_RETRIES = 5;
const connectDB = async () => {
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      await sequelize.authenticate();
      console.log('MySQL Database connected successfully.');
      return; // success
    } catch (error) {
      attempt++;
      const delay = Math.min(1000 * 2 ** attempt, 30000); // exponential backoff, max 30s
      console.error(
        `Unable to connect to the database (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`
      );
      if (attempt >= MAX_RETRIES) {
        console.error('Max DB connection attempts reached. Exiting.');
        process.exit(1);
      }
      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

module.exports = { sequelize, connectDB };
