// controllers/lostItem.controller.js

const LostItemService = require("../services/lostItem.service");

class LostItemController {

  static async create(req, res) {
    try {
      // 1. Map data dari FormData Frontend (Bahasa Indonesia) ke Model Sequelize (Bahasa Inggris)
      const payload = {
        name: req.body.name,          // Menampung jika ada fallback atau penamaan yang sama
        description: req.body.description,
        category: req.body.category,
        location: req.body.location,
        lost_date: req.body.lost_date,
        lost_time: req.body.lost_time,
        contact: req.body.contact,
        photo_path: req.file ? req.file.path : null, // Ambil path file dari Multer jika ada
      };

      const result = await LostItemService.create(payload);

      return res.status(201).json({
        success: true,
        message: "Lost item created successfully",
        data: result,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAll(req, res) {
    try {
      const result = await LostItemService.findAll();

      return res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getById(req, res) {
    try {
      const result = await LostItemService.findById(req.params.id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Lost item not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async update(req, res) {
    try {
      // 2. Pemetaan yang sama juga berlaku untuk proses Update/Edit data
      const payload = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        location: req.body.location,
        lost_date: req.body.lost_date,
        lost_time: req.body.lost_time,
        contact: req.body.contact,
      };

      // Jika user mengunggah foto baru saat update, masukkan ke dalam payload
      if (req.file) {
        payload.photo_path = req.file.path;
      }

      const result = await LostItemService.update(req.params.id, payload);

      return res.status(200).json({
        success: true,
        message: "Lost item updated successfully",
        data: result,
      });

    } catch (error) {
      if (error.message === "Lost item not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async delete(req, res) {
    try {
      await LostItemService.delete(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Lost item deleted successfully",
      });

    } catch (error) {
      if (error.message === "Lost item not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = LostItemController;