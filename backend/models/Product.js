const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  about_text: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null temporarily in case existing data doesn't have it
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Store an array of image URLs as JSON
  images: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  min_order_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  return_policy: {
    type: DataTypes.STRING,
    defaultValue: '7 Days Return',
  },
  replacement_policy: {
    type: DataTypes.STRING,
    defaultValue: '7 Days Replacement',
  },
  policy_details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  shipping_charge: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  cod_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_new_arrival: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_bestseller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_paused: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  specifications: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  manual_rating: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
  },
  manual_reviews_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  extra_charges: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = Product;
