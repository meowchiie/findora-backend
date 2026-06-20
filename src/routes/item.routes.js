const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/item.controller');
const { uploadItemMiddleware } = require('../middlewares/upload.middleware');
const { validateItem } = require('../validators/item.validator');

// Endpoint: http://localhost:5000/api/items
router.post('/', uploadItemMiddleware, validateItem, ItemController.create);
router.get('/', ItemController.getAll);
router.get('/:id', ItemController.getById);
router.put('/:id', uploadItemMiddleware, validateItem, ItemController.update);
router.delete('/:id', ItemController.delete);

module.exports = router;