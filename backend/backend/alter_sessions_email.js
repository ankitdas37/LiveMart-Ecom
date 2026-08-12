const { sequelize } = require('./config/db');

const alter = async () => {
  try {
    await sequelize.authenticate();
    
    // Check if userEmail exists, if not create it
    try {
      await sequelize.query('ALTER TABLE Sessions ADD COLUMN userEmail VARCHAR(255);');
      console.log('Added userEmail column');
    } catch(e) {
      console.log('userEmail column might already exist');
    }

    // Populate userEmail from Users table based on userId
    await sequelize.query('UPDATE Sessions s JOIN Users u ON s.userId = u.id SET s.userEmail = u.email;');
    console.log('Populated userEmail for existing sessions');
    
    // Drop userId column
    try {
      await sequelize.query('ALTER TABLE Sessions DROP FOREIGN KEY `Sessions_ibfk_1`;');
      console.log('Dropped foreign key');
    } catch(e) {
      console.log('No foreign key found or already dropped');
    }

    try {
      await sequelize.query('ALTER TABLE Sessions DROP COLUMN userId;');
      console.log('Dropped userId column');
    } catch(e) {
      console.log('userId column might already be dropped');
    }

  } catch (error) {
    console.error('Error during alteration:', error);
  } finally {
    process.exit();
  }
};

alter();
