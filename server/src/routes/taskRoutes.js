const express = require('express');
const router = express.Router();
const {
    createTask,
    getTasks,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, authorize('ADMIN', 'MANAGER'), createTask)
    .get(protect, getTasks);

router.route('/:id')
    .put(protect, updateTask)
    .delete(protect, authorize('ADMIN', 'MANAGER'), deleteTask);

module.exports = router;
