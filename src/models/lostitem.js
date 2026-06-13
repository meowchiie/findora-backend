const { DataTypes } = require('sequelize');
const db = require('../../config/database');

const LostItem = db.define('LostItem', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lost_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  lost_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: false
  },
  photo_path: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'LostItems', // Lebih eksplisit dibanding freezeTableName
  timestamps: true
});

module.exports = LostItem;