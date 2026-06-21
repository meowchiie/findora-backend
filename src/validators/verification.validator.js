const { body, validationResult } = require('express-validator');

const validateVerification = [
    body('claim_id').isInt().withMessage('ID Klaim harus berupa angka dan wajib diisi'),
    body('status').isIn(['Disetujui', 'Ditolak']).withMessage('Status verifikasi harus berupa "Disetujui" atau "Ditolak"'),
    body('admin_notes').optional().isString(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const bulkVerificationValidator = [
    body('claim_ids')
        .isArray({ min: 1 }).withMessage('claim_ids harus berupa array dan minimal berisi 1 ID laporan.'),
    body('claim_ids.*')
        .notEmpty().withMessage('ID laporan di dalam array tidak boleh kosong.'),
    body('status')
        .optional()
        .isIn(['Diverifikasi', 'Ditolak', 'Disetujui']).withMessage('Status tidak valid (Gunakan: Diverifikasi/Ditolak/Disetujui).'),
    body('notes')
        .optional()
        .isString().withMessage('Catatan harus berupa teks.')
];

const validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            message: "Validasi gagal", 
            errors: errors.array().map(err => err.msg) 
        });
    }
    next();
};

module.exports = { validateVerification, bulkVerificationValidator,
    validateResult };