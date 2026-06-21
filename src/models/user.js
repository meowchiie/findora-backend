'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Item, { foreignKey: 'user_id' });
      User.hasMany(models.Claim, { foreignKey: 'user_id' });
      User.hasMany(models.Verification, { foreignKey: 'admin_id' });
    }
  }
  User.init({
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    nim: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.TEXT, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Mahasiswa' },
    profile_picture: { type: DataTypes.TEXT, allowNull: true },

    status: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      defaultValue: 'Aktif' 
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    paranoid: true,
  });
  return User;
};