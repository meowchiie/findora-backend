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

    // Tambahkan di dalam class VerificationController
    static async bulkCreate(req, res) {
        try {
            // Frontend akan mengirimkan array claim_ids dan status (misal: "Ditemukan" / "Ditolak")
            const { claim_ids, status, notes } = req.body; 
            
            if (!Array.isArray(claim_ids) || claim_ids.length === 0) {
                return res.status(400).json({ success: false, message: "Pilih minimal satu laporan untuk diverifikasi." });
            }

            const admin_id = req.user?.id || req.user?.userId;
            const verified_at = new Date();

            // Lakukan perulangan untuk menyimpan verifikasi satu per satu
            // Catatan: Akan lebih baik jika di Service Anda membuat method 'bulkInsert' agar lebih cepat.
            // Namun, cara map & Promise.all di bawah ini sudah cukup untuk skala kecil-menengah.
            const verificationPromises = claim_ids.map(id => {
                const data = {
                    claim_id: id,
                    admin_id: admin_id,
                    status: status || 'Diverifikasi', // Sesuaikan default status Anda
                    notes: notes || 'Verifikasi masal',
                    verified_at: verified_at
                };
                return VerificationService.create(data);
            });

            const results = await Promise.all(verificationPromises);

            return res.status(201).json({
                success: true,
                message: `${claim_ids.length} laporan berhasil diverifikasi.`,
                data: results
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
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