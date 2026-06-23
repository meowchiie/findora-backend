'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Claim extends Model {
    static associate(models) {
      Claim.belongsTo(models.Item, { foreignKey: 'item_id' });
      Claim.belongsTo(models.User, { foreignKey: 'user_id' });
      Claim.hasOne(models.Verification, { foreignKey: 'claim_id' });
    }
  }
  Claim.init({
    item_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    proof_of_ownership: { type: DataTypes.TEXT, allowNull: false },
    proof_photo_path: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Menunggu Verifikasi' }
  }, {
    sequelize,
    modelName: 'Claim',
    tableName: 'claims',
    underscored: true,
  });
  return Claim;
};
