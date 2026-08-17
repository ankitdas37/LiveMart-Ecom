const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customer_address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  customer_phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  alt_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Hooghly'
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  landmark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'India'
  },
  order_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  location_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  couponCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('Pending Confirmation', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
    defaultValue: 'Pending Confirmation',
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'COD',
  },
  payment_receipt: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  estimated_delivery_time: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_registered_user: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  processingAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  estimatedDeliveryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updatedDeliveryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
  hooks: {
    afterCreate: async (order, options) => {
      const generatedId = 'W!FOMART' + String(order.id).padStart(6, '0');
      await order.update({ order_id: generatedId }, { transaction: options.transaction });
    }
  }
});

module.exports = Order;

