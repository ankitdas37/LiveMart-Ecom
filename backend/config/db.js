const { Sequelize } = require('sequelize');
require('dotenv').config();

// DB config — vars are already validated in server.js before this loads
const sequelizeOptions = {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false, // Never log raw SQL in any environment (may contain user data)
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Enable TLS/SSL for database connections in production
if (process.env.NODE_ENV === 'production') {
  sequelizeOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    },
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  sequelizeOptions
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
