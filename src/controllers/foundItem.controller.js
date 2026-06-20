// src/controllers/foundItem.controller.js
const foundItemService = require("../services/foundItem.service");

const createFoundItem = async (req, res) => {
  try {
    // Ambil filename dari req.file yang dihasilkan Multer, lalu susun path-nya
    const photo_path = req.file ? `public/uploads/found-items/${req.file.filename}` : null;

    const dataLaporan = {
      ...req.body,
      photo_path: photo_path // Pastikan properti ini dikirim ke service/DB kamu
    };

    const newItem = await foundItemService.storeFoundItem(dataLaporan);
    
    return res.status(201).json({
      success: true,
      message: "Laporan barang ditemukan berhasil disimpan",
      data: newItem
    });
  } catch (error) {
    console.error("Error di Controller:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server", error: error.message });
  }
};

module.exports = {
  createFoundItem,
};