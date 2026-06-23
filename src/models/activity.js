'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    static associate(models) {
      // Aktivitas ini milik seorang User
      Activity.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  
  Activity.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Activity',
    tableName: 'activities',
    underscored: true, // Agar createdAt menjadi created_at di DB
    timestamps: true,
  });
  
  return Activity;
};