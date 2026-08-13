const { sequelize } = require('./config/db');

async function test() {
  try {
    const [results] = await sequelize.query("DESCRIBE CartItems;");
    console.log('CartItems Schema:', results);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}
test();
