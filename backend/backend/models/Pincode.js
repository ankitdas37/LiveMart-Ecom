const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Pincode = sequelize.define('Pincode', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  area_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  delivery_charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0, // 0 could mean free delivery for this pincode
  },
  estimated_days: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  timestamps: true,
});

module.exports = Pincode;
