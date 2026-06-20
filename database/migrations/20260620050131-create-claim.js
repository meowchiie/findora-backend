'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('claims', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      item_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'items', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      proof_of_ownership: { type: Sequelize.TEXT, allowNull: false },
      proof_photo_path: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'Menunggu Verifikasi' },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('claims');
  }
};