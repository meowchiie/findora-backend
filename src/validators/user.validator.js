const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        });
    }
    next();
};

const registerValidator = [
    body('name').notEmpty().withMessage('Nama lengkap tidak boleh kosong'),
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('nim').notEmpty().withMessage('NIM / NIP tidak boleh kosong'),
    body('role').isIn(['Mahasiswa', 'Dosen', 'Staff']).withMessage('Role harus Mahasiswa atau Admin'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    handleValidationErrors
];

const loginValidator = [
    body('identifier').notEmpty().withMessage('Email atau NIM tidak boleh kosong'),
    body('password').notEmpty().withMessage('Password tidak boleh kosong'),
    handleValidationErrors
];

const updateProfileValidator = [
    body('id').notEmpty().withMessage('ID User diperlukan'),
    body('nama').notEmpty().withMessage('Nama tidak boleh kosong'),
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('nim').notEmpty().withMessage('NIM / NIP tidak boleh kosong'),
    body('passwordBaru').optional().isString(),
    // body('fotoProfil').optional().isString(),
    handleValidationErrors
];

const adminCreateValidator = [
    body('name').notEmpty().withMessage('Nama lengkap tidak boleh kosong'),
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('nim').notEmpty().withMessage('NIM / NIP tidak boleh kosong'),
    body('role').isIn(['Mahasiswa', 'Staff', 'Dosen', 'Admin']).withMessage('Role harus Mahasiswa, Staff, Dosen, atau Admin'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('status').optional().isIn(['Aktif', 'Nonaktif']),
    handleValidationErrors
];

const adminUpdateValidator = [
    body('name').notEmpty().withMessage('Nama tidak boleh kosong'),
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('nim').notEmpty().withMessage('NIM / NIP tidak boleh kosong'),
    body('role').isIn(['Mahasiswa', 'Staff', 'Dosen', 'Admin']).withMessage('Role tidak valid'),
    body('status').isIn(['Aktif', 'Nonaktif']).withMessage('Status tidak valid'),
    handleValidationErrors
];

module.exports = { 
    registerValidator, 
    loginValidator, 
    updateProfileValidator, 
    adminCreateValidator, 
    adminUpdateValidator
};