const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProductDetail = sequelize.define('ProductDetail', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  material: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  weight: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dimensions: {
    type: DataTypes.STRING, // e.g., 10x20x5 cm
    allowNull: true,
  },
  warranty: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  additional_specs: {
    type: DataTypes.JSON, // For any other custom specs as key-value pairs
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = ProductDetail;
