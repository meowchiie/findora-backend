const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/item.controller');
const { uploadItemMiddleware } = require('../middlewares/upload.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');
const { validateItem } = require('../validators/item.validator');

// Endpoint: http://localhost:5000/api/items
router.post('/', verifyToken, uploadItemMiddleware, validateItem, ItemController.create);
router.get('/stats', verifyToken, ItemController.getDashboardStats);
router.get('/', ItemController.getAll);
router.get('/:id', ItemController.getById);
router.put('/:id', verifyToken, uploadItemMiddleware, validateItem, ItemController.update);
router.delete('/:id', verifyToken, ItemController.delete);

module.exports = router;