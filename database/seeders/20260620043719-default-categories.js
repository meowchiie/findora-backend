'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const categories = [
      { name: 'Dompet', created_at: new Date(), updated_at: new Date() },
      { name: 'Elektronik', created_at: new Date(), updated_at: new Date() },
      { name: 'Kunci', created_at: new Date(), updated_at: new Date() },
      { name: 'Buku', created_at: new Date(), updated_at: new Date() },
      { name: 'Aksesoris', created_at: new Date(), updated_at: new Date() },
      { name: 'Lainnya', created_at: new Date(), updated_at: new Date() }
    ];

    // Ingat: name tabel di parameter pertama harus sesuai dengan tableName di model kamu ('categories')
    await queryInterface.bulkInsert('categories', categories, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};