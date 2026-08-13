const { Product, Order, Setting, EmailHistory } = require('../models');
const { Op } = require('sequelize');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public (in real app, Admin)
const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Products
    const totalProducts = await Product.count();

    // 2. Low Stock Alerts (Stock < 5)
    const lowStockCount = await Product.count({
      where: {
        stock: {
          [Op.lt]: 5
        }
      }
    });

    // 3. Order Statistics
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'Pending Confirmation' } });
    const confirmedOrders = await Order.count({ where: { status: 'Confirmed' } });
    const cancelledOrders = await Order.count({ where: { status: 'Cancelled' } });

    // 4. Total Customers (Unique Emails in Orders)
    // Using distinct count on customer_email
    const totalCustomers = await Order.count({
      col: 'customer_email',
      distinct: true
    });

    // 5. Recent Orders (Last 5)
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'customer_name', 'createdAt', 'total_amount', 'status']
    });

    // 6. Emails Sent (Today & Total)
    const totalEmailsSent = await EmailHistory.count();
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEmails = await EmailHistory.findAll({
      where: {
        createdAt: {
          [Op.gte]: todayStart
        }
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'toEmail', 'subject', 'createdAt']
    });

    const todayEmailsCount = todayEmails.length;

    res.json({
      totalProducts,
      lowStockCount,
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        cancelled: cancelledOrders
      },
      totalCustomers,
      recentOrders,
      totalEmailsSent,
      todayEmailsCount,
      todayEmails
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getDashboardStats
};
