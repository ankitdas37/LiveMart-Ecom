const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  productPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  productImage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  productLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = CartItem;
