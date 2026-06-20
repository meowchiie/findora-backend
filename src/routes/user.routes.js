const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { registerValidator, loginValidator, updateProfileValidator } = require('../validators/user.validator');

// Authentication Routes
router.post('/register', registerValidator, UserController.register);
router.post('/login', loginValidator, UserController.login);
router.post('/forgot-password', UserController.forgotPassword);

// Profile Routes
router.get('/profile/:id', UserController.getProfile);
router.put('/profile/update', updateProfileValidator, UserController.updateProfile);

module.exports = router;