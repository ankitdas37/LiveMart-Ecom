const { sequelize, OrderItem, Order } = require('./models');
const { connectDB } = require('./config/db');

const run = async () => {
  await connectDB();
  
  try {
    const ids = [10, 11, 12];
    await OrderItem.destroy({ where: { order_id: ids } });
    console.log('Items deleted');
    const c = await Order.destroy({ where: { id: ids } });
    console.log('Orders deleted:', c);
  } catch(e) {
    console.error('Error:', e);
  }
  process.exit(0);
};

run();
