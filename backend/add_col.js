const { sequelize } = require('./config/db');

async function addColumns() {
  try {
    await sequelize.authenticate();
    await sequelize.query("ALTER TABLE OrderItems ADD COLUMN return_status VARCHAR(50) DEFAULT 'None';");
    await sequelize.query("ALTER TABLE OrderItems ADD COLUMN return_reason TEXT;");
    console.log('Columns added successfully.');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    process.exit();
  }
}

addColumns();
