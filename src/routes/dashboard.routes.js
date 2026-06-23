const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboaord.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/charts', verifyToken, dashboardController.getChartData);
router.get('/charts/user', verifyToken, dashboardController.getGlobalStats);

module.exports = router;