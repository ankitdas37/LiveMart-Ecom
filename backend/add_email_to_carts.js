const { sequelize } = require('./config/db');

async function run() {
  try {
    await sequelize.query("ALTER TABLE Carts ADD COLUMN userEmail VARCHAR(255) NULL AFTER userId;");
    console.log('Successfully added userEmail column to Carts table.');
  } catch (err) {
    if (err.message && err.message.includes('Duplicate column name')) {
      console.log('Column userEmail already exists, skipping.');
    } else {
      console.error('Error:', err.message);
    }
  } finally {
    await sequelize.close();
  }
}

run();
