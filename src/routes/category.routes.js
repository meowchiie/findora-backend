const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const { validateCategory } = require('../validators/category.validator');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware'); // Import Middleware

// Semua orang yang login (Mahasiswa & Admin) bisa melihat daftar kategori
router.get('/', verifyToken, CategoryController.getAll);
router.get('/:id', verifyToken, CategoryController.getById);

// HANYA ADMIN yang bisa membuat, mengedit, dan menghapus kategori
router.post('/', verifyToken, isAdmin, validateCategory, CategoryController.create);
router.put('/:id', verifyToken, isAdmin, validateCategory, CategoryController.update);
router.delete('/:id', verifyToken, isAdmin, CategoryController.delete);

module.exports = router;