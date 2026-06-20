'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER
      },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      nim: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.TEXT, allowNull: false },
      role: { type: Sequelize.STRING, allowNull: false, defaultValue: 'Mahasiswa' },
      profile_picture: { type: Sequelize.TEXT, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};