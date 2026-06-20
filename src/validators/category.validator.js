const { body, validationResult } = require('express-validator');

const validateCategory = [
    body('name')
        .notEmpty().withMessage('Nama kategori tidak boleh kosong!')
        .isString().withMessage('Nama kategori harus berupa teks!'),
        
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }
        next();
    }
];

module.exports = { validateCategory };