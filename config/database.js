const { Sequelize } = require('sequelize');
// 1. Ambil object konfigurasi dari file config.js sebelah
const configAll = require('./config'); 

// 2. Deteksi mode (di Docker otomatis membaca 'production')
const env = process.env.NODE_ENV || 'development';
const config = configAll[env];

// 3. Masukkan datanya secara dinamis ke Sequelize
const db = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: process.env.DB_PORT || 3306,
  logging: false // Ubah ke console.log jika ingin melihat log query SQL
});

module.exports = db;