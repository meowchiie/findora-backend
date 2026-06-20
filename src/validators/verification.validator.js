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

module.exports = { validateVerification };