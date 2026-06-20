const CategoryService = require("../services/category.service");
const { matchedData } = require("express-validator");

class CategoryController {
    static async create(req, res) {
        try {
            const validatedData = matchedData(req);
            const result = await CategoryService.create(validatedData);
            
            return res.status(201).json({ success: true, message: "Kategori berhasil ditambahkan", data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const result = await CategoryService.findAll();
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const result = await CategoryService.findById(req.params.id);
            if (!result) return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
            
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const validatedData = matchedData(req);
            const result = await CategoryService.update(req.params.id, validatedData);
            
            return res.status(200).json({ success: true, message: "Kategori berhasil diperbarui", data: result });
        } catch (error) {
            if (error.message === "Kategori tidak ditemukan") {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            await CategoryService.delete(req.params.id);
            return res.status(200).json({ success: true, message: "Kategori berhasil dihapus" });
        } catch (error) {
            if (error.message === "Kategori tidak ditemukan") {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = CategoryController;