'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('items', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      category_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      type: { type: Sequelize.STRING, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      contact: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      location: { type: Sequelize.STRING, allowNull: false },
      lost_date: { type: Sequelize.DATEONLY, allowNull: false },
      lost_time: { type: Sequelize.TIME, allowNull: false },
      photo_path: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'Menunggu' },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('items');
  }
};