const VerificationService = require('../services/verification.service');
const { matchedData } = require('express-validator');

class VerificationController {
    static async create(req, res) {
        try {
            const validatedData = matchedData(req);

            // 🛠️ PERBAIKAN: Gunakan fallback untuk mengantisipasi perbedaan nama key (id atau userId)
            validatedData.admin_id = req.user?.id || req.user?.userId;
            validatedData.verified_at = new Date();

            const result = await VerificationService.create(validatedData);
            return res.status(201).json({
                success: true,
                message: `Verifikasi sukses disimpan dengan keputusan: ${validatedData.status}`,
                data: result
            });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const result = await VerificationService.getAll();
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = VerificationController;