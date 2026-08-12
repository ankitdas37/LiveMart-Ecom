const { sequelize } = require('./config/db');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to db');
    // Add the column
    await sequelize.query('ALTER TABLE Orders ADD COLUMN order_id VARCHAR(255) NULL UNIQUE;');
    console.log('Column order_id added');
    
    // Update existing rows
    await sequelize.query(`UPDATE Orders SET order_id = CONCAT('LIVEMART', LPAD(id, 6, '0'))`);
    console.log('Existing orders updated');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
