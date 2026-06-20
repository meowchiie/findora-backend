'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Verification extends Model {
    static associate(models) {
      Verification.belongsTo(models.Claim, { foreignKey: 'claim_id' });
      Verification.belongsTo(models.User, { foreignKey: 'admin_id', as: 'Admin' });
    }
  }
  Verification.init({
    claim_id: { type: DataTypes.INTEGER, allowNull: false },
    admin_id: { type: DataTypes.INTEGER, allowNull: false },
    admin_notes: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false },
    verified_at: { type: DataTypes.DATE, allowNull: false }
  }, {
    sequelize,
    modelName: 'Verification',
    tableName: 'verifications',
    underscored: true,
  });
  return Verification;
};