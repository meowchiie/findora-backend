const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboaord.controller');

router.get('/charts', dashboardController.getChartData);

module.exports = router;