const express = require('express');
const router = express.Router();
const { createWorkLog, getMyWorkLogs, deleteWorkLog } = require('../controllers/workLogController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, createWorkLog)
    .get(protect, getMyWorkLogs);

router.route('/:id')
    .delete(protect, deleteWorkLog);

module.exports = router;
