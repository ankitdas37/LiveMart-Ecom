const { sequelize } = require('./config/db');

async function run() {
  try {
    await sequelize.query("ALTER TABLE CartItems ADD COLUMN productTitle VARCHAR(255) NULL AFTER quantity;");
    console.log('Added productTitle column.');
  } catch (err) {
    if (err.message.includes('Duplicate column name')) console.log('productTitle already exists.');
    else console.error('productTitle error:', err.message);
  }

  try {
    await sequelize.query("ALTER TABLE CartItems ADD COLUMN productPrice DECIMAL(10,2) NULL AFTER productTitle;");
    console.log('Added productPrice column.');
  } catch (err) {
    if (err.message.includes('Duplicate column name')) console.log('productPrice already exists.');
    else console.error('productPrice error:', err.message);
  }

  try {
    await sequelize.query("ALTER TABLE CartItems ADD COLUMN productImage TEXT NULL AFTER productPrice;");
    console.log('Added productImage column.');
  } catch (err) {
    if (err.message.includes('Duplicate column name')) console.log('productImage already exists.');
    else console.error('productImage error:', err.message);
  }

  await sequelize.close();
  console.log('Done!');
}

run();
