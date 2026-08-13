const { sequelize } = require('./config/db');

async function run() {
  try {
    await sequelize.query("ALTER TABLE CartItems ADD COLUMN email VARCHAR(255) NULL AFTER id;");
    console.log('Added email column.');
  } catch (err) {
    if (err.message.includes('Duplicate column name')) console.log('email already exists.');
    else console.error('email error:', err.message);
  }

  try {
    await sequelize.query("ALTER TABLE CartItems CHANGE COLUMN productTitle productName VARCHAR(255) NULL;");
    console.log('Renamed productTitle to productName.');
  } catch (err) {
    try {
      await sequelize.query("ALTER TABLE CartItems ADD COLUMN productName VARCHAR(255) NULL;");
      console.log('Added productName column.');
    } catch (err2) {}
  }

  try {
    await sequelize.query("ALTER TABLE CartItems ADD COLUMN productLink VARCHAR(500) NULL AFTER productImage;");
    console.log('Added productLink column.');
  } catch (err) {
    if (err.message.includes('Duplicate column name')) console.log('productLink already exists.');
    else console.error('productLink error:', err.message);
  }

  await sequelize.close();
  console.log('Migration Complete!');
}

run();
