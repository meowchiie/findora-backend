const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');

const { registerValidator, loginValidator, updateProfileValidator, adminCreateValidator, adminUpdateValidator } = require('../validators/user.validator');
const { verifyToken } = require('../middlewares/auth.middleware'); // Sesuaikan dengan middleware Anda

// Authentication Routes
router.post('/register', registerValidator, UserController.register);
router.post('/login', loginValidator, UserController.login);
router.post('/forgot-password', UserController.forgotPassword);

// Profile Routes
router.get('/profile/:id', UserController.getProfile);
router.put('/profile/update', updateProfileValidator, UserController.updateProfile);

router.get('/users', verifyToken, UserController.getAllUsers);
router.post('/users', verifyToken, adminCreateValidator, UserController.adminCreate);
router.put('/users/:id', verifyToken, adminUpdateValidator, UserController.adminUpdate);
router.delete('/users/:id', verifyToken, UserController.adminDelete);

router.get('/users/archived', verifyToken, UserController.getArchivedUsers); // Dapetin list arsip
router.delete('/users/:id', verifyToken, UserController.softDeleteUser); // Soft delete (Mengarsipkan)
router.post('/users/:id/restore', verifyToken, UserController.restoreUser); // Endpoint BARU untuk Restore
router.delete('/users/:id/permanent', verifyToken, UserController.hardDeleteUserPermanent); // Hard delete permanen

module.exports = router;