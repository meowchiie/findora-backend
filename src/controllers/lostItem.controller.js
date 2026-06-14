// controllers/lostItem.controller.js

const LostItemService = require("../services/lostItem.service");
// 1. Import matchedData dari express-validator 👇
const { matchedData } = require("express-validator"); 

class LostItemController {

  static async create(req, res) {
    try {
      // 2. Ambil hanya data yang tervalidasi oleh validator
      const validatedData = matchedData(req);

      // 3. Gabungkan data teks yang sudah valid dengan path file dari Multer
      const payload = {
        ...validatedData,
        photo_path: req.file ? req.file.path.replace(/\\/g, '/') : null,
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
      // 4. Terapkan hal yang sama pada fungsi update untuk mengambil data tervalidasi
      const validatedData = matchedData(req);

      const payload = {
        ...validatedData
      };

      // Jika user mengunggah foto baru saat update, masukkan ke dalam payload
      if (req.file) {
        payload.photo_path = req.file.path.replace(/\\/g, '/');
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