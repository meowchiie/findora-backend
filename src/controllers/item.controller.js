const ItemService = require("../services/item.service");
const { matchedData } = require("express-validator");
const {Item, Claim} = require("../models");
const { Op } = require("sequelize");

class ItemController {
    static async create(req, res) {
        try {
            // 1. Ambil data teks (req.body) yang sudah lolos validasi
            const validatedData = matchedData(req);

            // 2. Tangkap nama file dari Multer dan masukkan ke dalam data
            // Karena nama kolom di database kamu adalah 'photo_path'
            if (req.file) {
                // req.file.filename akan mengambil nama file yang di-generate Multer 
                // (contoh: lost-item-1718000000.jpg)
                validatedData.photo_path = "/uploads/items/" + req.file.filename; 
            }

            // 3. Sekarang validatedData sudah lengkap (termasuk photo_path), kirim ke Service
            const result = await ItemService.create(validatedData);
            
            return res.status(201).json({ 
                success: true, 
                message: "Item berhasil ditambahkan", 
                data: result 
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getDashboardStats(req, res) {
    try {
      // Menghitung total laporan hilang
      const totalLost = await Item.count({ 
        where: { type: 'hilang' } 
      });

      // Menghitung total laporan ditemukan
      const totalFound = await Item.count({ 
        where: { type: 'ditemukan' } 
      });

      // Menghitung total klaim yang berhasil (asumsi Anda memiliki model Claim dan kolom status)
      // Sesuaikan 'Disetujui' atau 'Selesai' dengan struktur database Anda
      const successfulClaims = await Claim.count({ 
        where: { status: 'Disetujui' } 
      });

      return res.status(200).json({
        success: true,
        data: {
          totalLost,
          totalFound,
          successfulClaims
        }
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil statistik dashboard",
        error: error.message
      });
    }
  }

    static async getAll(req, res) {
        try {
            // 1. Ambil query parameter untuk pagination (berikan default jika tidak ada)
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;

            // 2. Ambil query parameter untuk filter data
            const filter = {};
            if (req.query.user_id) filter.user_id = req.query.user_id;

            if (req.query.type) filter.type = req.query.type;
            if (req.query.category_id) filter.category_id = req.query.category_id;
            
            if (req.query.search) {
                filter.name = { [Op.like]: `%${req.query.search}%` }; 
            }

            // ==========================================
            // REVERSE FILTER & NORMAL FILTER UNTUK STATUS
            // ==========================================
            if (req.query.status_not) {
                // Menggunakan [Op.ne] untuk menghasilkan query WHERE status != 'Nilai'
                filter.status = { [Op.ne]: req.query.status_not };
            } else if (req.query.status) {
                // Filter normal menggunakan (=)
                filter.status = req.query.status;
            }

            // 3. Panggil service dengan menyertakan filter, page, dan limit
            const result = await ItemService.findAll(filter, page, limit);

            // 4. Kembalikan response sukses beserta metadata pagination
            return res.status(200).json({
                success: true,
                message: "Berhasil mengambil data item",
                meta: {
                    totalItems: result.totalItems,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage
                },
                data: result.data // ini berisi array 'rows' dari service
            });

        } catch (error) {
            console.error("Error di getAllItems:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server saat mengambil data",
                error: error.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const result = await ItemService.findById(req.params.id);
            if (!result) return res.status(404).json({ success: false, message: "Item not found" });
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const validatedData = matchedData(req);
            const payload = { ...validatedData };

            let targetFile = null;
            if (req.files) {
                if (req.files['photo_path']?.[0]) targetFile = req.files['photo_path'][0];
                else if (req.files['image']?.[0]) targetFile = req.files['image'][0];
            }

            if (targetFile) payload.foto_barang = targetFile.path.replace(/\\/g, '/');

            const result = await ItemService.update(req.params.id, payload);
            return res.status(200).json({ success: true, message: "Item updated successfully", data: result });
        } catch (error) {
            if (error.message === "Item not found") return res.status(404).json({ success: false, message: error.message });
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            await ItemService.delete(req.params.id);
            return res.status(200).json({ success: true, message: "Item deleted successfully" });
        } catch (error) {
            if (error.message === "Item not found") return res.status(404).json({ success: false, message: error.message });
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = ItemController;