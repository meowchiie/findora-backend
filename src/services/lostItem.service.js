// services/lostItem.service.js

const LostItem = require("../models/LostItem");
const fs = require("fs").promises;
const path = require("path");

class LostItemService {

  /**
   * 1. CREATE
   * Menyimpan data barang hilang baru ke database.
   * Dilengkapi proteksi rollback: Jika query DB gagal, file yang terlanjur terupload akan dihapus.
   */
  static async create(data) {
    try {
      return await LostItem.create(data);
    } catch (error) {
      // ROLLBACK FILE: Jika database menolak (misal: validasi gagal), hapus file fisik di server
      if (data.photo_path) {
        await this._deleteFile(data.photo_path);
      }
      throw error; // Teruskan error ke controller untuk dijadikan response 500
    }
  }

  /**
   * 2. FIND ALL
   * Mengambil semua data barang hilang dari yang terbaru.
   */
  static async findAll() {
    return await LostItem.findAll({
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * 3. FIND BY ID
   * Mencari satu data spesifik berdasarkan Primary Key (ID).
   */
  static async findById(id) {
    return await LostItem.findByPk(id);
  }

  /**
   * 4. UPDATE
   * Memperbarui data barang hilang.
   * Jika user mengunggah foto baru, foto lama otomatis dihapus dari server agar hemat ruang.
   */
  static async update(id, data) {
    const item = await LostItem.findByPk(id);

    // Kasus 1: Data tidak ditemukan di database
    if (!item) {
      // Hapus file baru yang terlanjur diunggah oleh Multer
      if (data.photo_path) {
        await this._deleteFile(data.photo_path);
      }
      throw new Error("Lost item not found");
    }

    // Kasus 2: Data ditemukan, user mengunggah foto baru, dan data lama juga punya foto
    if (data.photo_path && item.photo_path) {
      await this._deleteFile(item.photo_path);
    }

    return await item.update(data);
  }

  /**
   * 5. DELETE
   * Menghapus data barang hilang dari database dan sekaligus membersihkan file fotonya.
   */
  static async delete(id) {
    const item = await LostItem.findByPk(id);

    if (!item) {
      throw new Error("Lost item not found");
    }

    // Bersihkan file foto fisik terlebih dahulu sebelum datanya dihapus permanen di DB
    if (item.photo_path) {
      await this._deleteFile(item.photo_path);
    }

    await item.destroy();
    return true;
  }

  /**
   * HELPER INTERNAL (PRIVATE-LIKE METHOD)
   * Berfungsi menghapus file secara aman menggunakan fs.promises.unlink.
   * Menggunakan try-catch agar jika file fisik tidak sengaja terhapus manual, app tidak crash.
   */
  static async _deleteFile(filePath) {
    try {
      // Mengubah ke path absolut untuk memastikan akurasi file yang dihapus
      const absolutePath = path.resolve(filePath);
      await fs.unlink(absolutePath);
    } catch (error) {
      // Log error ke konsol backend demi kebutuhan debugging tanpa menghentikan siklus request
      console.error(`[File System Error] Gagal menghapus file di ${filePath}:`, error.message);
    }
  }
}

module.exports = LostItemService;