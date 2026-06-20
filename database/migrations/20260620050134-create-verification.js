'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('verifications', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      claim_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'claims', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      admin_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      admin_notes: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false },
      verified_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('verifications');
  }
};