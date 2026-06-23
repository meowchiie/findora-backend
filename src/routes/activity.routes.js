const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/activity.controller');
const { createActivityValidator } = require('../validators/activity.validator');
// const { verifyToken } = require('../middlewares/authMiddleware'); // Pastikan ini ada

// Endpoint untuk mengambil aktivitas milik user yang sedang login
// Gunakan verifyToken agar otomatis mendapatkan req.user.id
router.get('/', /* verifyToken, */ ActivityController.getAll);

// Endpoint manual untuk mencatat aktivitas (Opsional, biasa dipakai untuk testing via Postman)
router.post('/create', /* verifyToken, */ createActivityValidator, ActivityController.create);

module.exports = router;