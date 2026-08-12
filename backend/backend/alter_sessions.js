const { sequelize } = require('./config/db');

const alterTable = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Add login_method column
    await sequelize.query('ALTER TABLE Sessions ADD COLUMN login_method VARCHAR(255) DEFAULT \'Password\';');
    console.log('Added login_method column');
    
    // Add last_ip column
    await sequelize.query('ALTER TABLE Sessions ADD COLUMN last_ip VARCHAR(255);');
    console.log('Added last_ip column');
    
  } catch (error) {
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Unable to alter table:', error);
    }
  } finally {
    process.exit();
  }
};

alterTable();
