const express = require('express');
const router = express.Router();
const VerificationController = require('../controllers/verification.controller');
const { validateVerification } = require('../validators/verification.validator');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// HANYA ADMIN yang diizinkan mengakses seluruh endpoint verifikasi ini
router.use(verifyToken, isAdmin);

router.post('/', validateVerification, VerificationController.create);
router.get('/', VerificationController.getAll);

module.exports = router;