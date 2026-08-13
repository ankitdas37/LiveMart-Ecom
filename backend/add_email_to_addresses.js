const { sequelize } = require('./config/db');

async function updateDB() {
  try {
    await sequelize.query('ALTER TABLE Addresses ADD COLUMN email VARCHAR(255) AFTER fullName;');
    console.log('Successfully added email column to Addresses table.');
  } catch (error) {
    console.error('Error updating DB:', error);
  } finally {
    process.exit();
  }
}

updateDB();
