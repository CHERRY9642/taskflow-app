const express = require('express');
const router = express.Router();
const { getAdminAnalytics, getManagerAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/admin', protect, authorize('ADMIN'), getAdminAnalytics);
router.get('/manager', protect, authorize('MANAGER'), getManagerAnalytics);

module.exports = router;
