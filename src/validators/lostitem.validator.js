// middlewares/lostItem.validator.js

const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;

const validateLostItem = [
    body('name').notEmpty().withMessage('Nama barang wajib diisi').trim(),
    body('description').notEmpty().withMessage('Deskripsi wajib diisi').trim(),
    body('category').notEmpty().withMessage('Kategori wajib diisi').trim(),
    body('location').notEmpty().withMessage('Lokasi wajib diisi').trim(),
    body('lost_date')
        .notEmpty().withMessage('Tanggal hilang wajib diisi')
        .isISO8601().withMessage('Format tanggal harus YYYY-MM-DD'),
    body('lost_time')
        .notEmpty().withMessage('Waktu hilang wajib diisi')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('Format waktu harus HH:MM atau HH:MM:SS'),
    body('contact').notEmpty().withMessage('Kontak yang dapat dihubungi wajib diisi').trim(),
    
    // Middleware interceptor untuk mengecek hasil validasi
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // BACKEND PROTECTION: Jika validasi field gagal, hapus file gambar yang sudah terlanjur masuk lewat Multer
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch (err) {
                    console.error('[Validator Error] Gagal menghapus file setelah validasi gagal:', err.message);
                }
            }
            
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }
        next();
    }
];

module.exports = { validateLostItem };