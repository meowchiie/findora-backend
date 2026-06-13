const { DataTypes } = require('sequelize');
const db = require('../../config/database');

const User = db.define('User', {
  nama: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nim: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'Users',
  timestamps: true
});

module.exports = User;