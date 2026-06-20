'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Hash password default untuk admin (contoh: 'admin123')
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await queryInterface.bulkInsert('users', [{
      name: 'Super Admin Findora',
      email: 'admin@ith.ac.id',
      nim: 'ADMIN001', // Karena NIM unique dan wajib, kita beri identifier khusus admin
      password: hashedPassword,
      role: 'Admin',
      profile_picture: null,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    // Menghapus spesifik akun admin saat perintah undo dijalankan
    await queryInterface.bulkDelete('users', { email: 'admin@ith.ac.id' }, {});
  }
};