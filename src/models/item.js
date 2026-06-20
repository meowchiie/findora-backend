'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    static associate(models) {
      Item.belongsTo(models.User, { foreignKey: 'user_id' });
      Item.belongsTo(models.Category, { foreignKey: 'category_id' });
      Item.hasMany(models.Claim, { foreignKey: 'item_id' });
    }
  }
  Item.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    contact: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    lost_date: { type: DataTypes.DATEONLY, allowNull: false },
    lost_time: { type: DataTypes.TIME, allowNull: false },
    photo_path: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Menunggu' }
  }, {
    sequelize,
    modelName: 'Item',
    tableName: 'items',
    underscored: true,
  });
  return Item;
};