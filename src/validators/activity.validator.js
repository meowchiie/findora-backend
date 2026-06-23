const { body, validationResult } = require('express-validator');

const createActivityValidator = [
    body('user_id')
        .notEmpty().withMessage('ID User diperlukan')
        .isInt().withMessage('ID User harus berupa angka'),
    body('detail')
        .notEmpty().withMessage('Detail aktivitas tidak boleh kosong')
        .isString().withMessage('Detail harus berupa teks'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { createActivityValidator };