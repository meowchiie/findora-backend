const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;

const validateItem = [
    body('user_id').isInt().withMessage('User ID harus berupa angka'),
    body('category_id').isInt().withMessage('Kategori ID harus berupa angka'),
    body('type').isIn(['hilang', 'ditemukan']).withMessage('Tipe harus hilang atau ditemukan'),
    body('name').notEmpty().withMessage('Nama barang tidak boleh kosong'),
    body('description').notEmpty().withMessage('Deskripsi tidak boleh kosong'),
    body('location').notEmpty().withMessage('Lokasi tidak boleh kosong'),
    body('lost_date').isDate().withMessage('Format tanggal tidak valid (YYYY-MM-DD)'),

    body('contact').notEmpty().withMessage('Kontak (No. HP/Email) wajib diisi!'),
    // ⏰ Validasi Atribut Baru (Format HH:MM atau HH:MM:SS)
    body('lost_time').matches(/^([01]\d|2[0-3]):?([0-5]\d)(:[0-5]\d)?$/).withMessage('Format waktu tidak valid (HH:MM)'),
    
    body('status').optional().isIn(['Menunggu', 'Ditemukan', 'Diamankan', 'Diklaim', 'Selesai']).withMessage('Status tidak valid'),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.files) {
                const filesToUnlink = [...(req.files['photo_path'] || []), ...(req.files['image'] || [])];
                for (const file of filesToUnlink) {
                    try {
                        await fs.unlink(file.path);
                    } catch (err) {
                        console.error('[Validator Error] Gagal membersihkan file:', err.message);
                    }
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

module.exports = { validateItem };