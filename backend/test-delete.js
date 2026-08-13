const { sequelize, Order, OrderItem } = require('./models');
const { connectDB } = require('./config/db');

const run = async () => {
  await connectDB();
  
  // Find any order
  const order = await Order.findOne();
  if (!order) {
    console.log('No order found.');
    process.exit(0);
  }
  
  console.log('Trying to delete order ID:', order.id);
  
  try {
    // Delete associated items
    await OrderItem.destroy({ where: { order_id: order.id } });
    console.log('Items deleted');
    
    // Delete order
    await Order.destroy({ where: { id: order.id } });
    console.log('Order deleted successfully!');
  } catch (err) {
    console.error('Delete Failed:', err);
  }
  process.exit(0);
};

run();
