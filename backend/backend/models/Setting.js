const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Setting = sequelize.define('Setting', {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('NUMBER', 'STRING', 'BOOLEAN'),
    defaultValue: 'STRING',
  }
}, {
  timestamps: true,
});

module.exports = Setting;
