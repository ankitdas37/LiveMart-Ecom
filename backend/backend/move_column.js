const { sequelize } = require('./config/db');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to db');
    await sequelize.query('ALTER TABLE Orders MODIFY COLUMN order_id VARCHAR(255) AFTER id;');
    console.log('Moved order_id to 2nd position');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
