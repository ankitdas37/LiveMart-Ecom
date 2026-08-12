const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EmailHistory = sequelize.define('EmailHistory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  toEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ccEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  hasAttachment: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  timestamps: true,
});

module.exports = EmailHistory;
