const ItemService = require("../services/item.service");
const { matchedData } = require("express-validator");

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
                validatedData.photo_path = req.file.filename; 
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

    static async getAll(req, res) {
        try {
            const { type } = req.query;
            const filter = {};
            if (type && ['hilang', 'ditemukan'].includes(type)) filter.type = type;

            const result = await ItemService.findAll(filter);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
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