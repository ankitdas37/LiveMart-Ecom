const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AdminNote = sequelize.define('AdminNote', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // File attachment (photo or PDF uploaded to Cloudinary)
  file_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  file_type: {
    type: DataTypes.ENUM('image', 'pdf', 'other'),
    allowNull: true,
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Targeting
  target_type: {
    type: DataTypes.ENUM('all', 'user', 'product', 'order_status', 'order', 'all_orders'),
    defaultValue: 'all',
  },
  target_user_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  target_product_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  target_order_status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  target_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Status
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
  },
}, {
  timestamps: true,
});

module.exports = AdminNote;
