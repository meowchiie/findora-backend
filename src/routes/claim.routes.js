const express = require('express');
const router = express.Router();
const ClaimController = require('../controllers/claim.controller');
const { validateClaim } = require('../validators/claim.validator');
const { uploadClaimMiddleware } = require('../middlewares/upload.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');

// Seluruh rute klaim membutuhkan login (Token Valid)
router.use(verifyToken);

router.post('/', uploadClaimMiddleware, validateClaim, ClaimController.create);
router.get('/', ClaimController.getAll);
router.get('/:id', ClaimController.getById);

module.exports = router;