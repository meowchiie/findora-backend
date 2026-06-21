const express = require('express');
const router = express.Router();
const VerificationController = require('../controllers/verification.controller');
const { validateVerification } = require('../validators/verification.validator');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const { bulkVerificationValidator, validateResult } = require('../validators/verification.validator')

// HANYA ADMIN yang diizinkan mengakses seluruh endpoint verifikasi ini
router.use(verifyToken, isAdmin);

router.post('/', validateVerification, VerificationController.create);
router.get('/', VerificationController.getAll);
router.post(
    '/bulk',                       // 2. Cek apakah rolenya 'Admin'
    bulkVerificationValidator,     // 3. Validasi struktur request body
    validateResult,                // 4. Cek hasil validasi
    VerificationController.bulkCreate // 5. Jalankan fungsi di controller
);

module.exports = router;