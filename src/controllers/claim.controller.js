const ClaimService = require('../services/claim.service');
const { matchedData } = require('express-validator');

class ClaimController {
    static async create(req, res) {
        try {
            const validatedData = matchedData(req);
            
            // 🛠️ TAMBAHKAN DUA BARIS DEBUG INI:
            console.log("=== DEBUG JWT PAYLOAD ===", req.user);
            
            validatedData.user_id = req.user?.id || req.user?.userId; // Mengantisipasi salah nama key
            validatedData.proof_photo_path = `/uploads/claims/${req.file.filename}`;
            
            console.log("=== DATA SIAP KIRIM KE DB ===", validatedData);

            const result = await ClaimService.create(validatedData);
            return res.status(201).json({ success: true, data: result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            // Jika yang login Mahasiswa, tampilkan klaim miliknya saja. Jika Admin, tampilkan semua.
            const filter = req.user.role === 'Admin' ? {} : { user_id: req.user.id };
            const result = await ClaimService.getAll(filter);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const result = await ClaimService.getById(req.params.id);
            // Proteksi agar mahasiswa tidak bisa mengintip klaim orang lain
            if (req.user.role !== 'Admin' && result.user_id !== req.user.id) {
                return res.status(403).json({ success: false, message: "Akses ditolak untuk melihat data ini" });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(404).json({ success: false, message: error.message });
        }
    }
}

module.exports = ClaimController;