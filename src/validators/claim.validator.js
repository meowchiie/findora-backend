const { body, validationResult } = require('express-validator');

const validateClaim = [
    body('item_id').isInt().withMessage('ID Item harus berupa angka dan wajib diisi'),
    body('proof_of_ownership').notEmpty().withMessage('Bukti kepemilikan wajib diisi secara detail'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateClaim };