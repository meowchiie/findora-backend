// src/services/foundItem.service.js
const { DataTypes } = require("sequelize");
const db = require("../../config/database"); // Mengarah langsung ke koneksi database utama Anda
const FoundItemModel = require("../models/founditem"); // Memanggil model founditem secara spesifik

// Inisialisasi model langsung menggunakan instance database Anda
const FoundItem = FoundItemModel(db, DataTypes);

const storeFoundItem = async (data) => {
  return await FoundItem.create(data);
};

const getAllFoundItems = async () => {
  return await FoundItem.findAll({ order: [['createdAt', 'DESC']] });
};

module.exports = {
  storeFoundItem,
  getAllFoundItems,
};