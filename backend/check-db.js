const { sequelize } = require('./models');
const { connectDB } = require('./config/db');

const run = async () => {
  await connectDB();
  const query = `
    SELECT 
      TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME
    FROM
      INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      REFERENCED_TABLE_NAME = 'Orders';
  `;
  const [results] = await sequelize.query(query);
  console.log('Foreign keys referencing Orders:');
  console.table(results);
  process.exit(0);
};

run();
