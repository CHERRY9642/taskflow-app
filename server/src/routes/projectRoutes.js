const express = require('express');
const router = express.Router();
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, authorize('ADMIN', 'MANAGER'), createProject)
    .get(protect, getProjects);

router.route('/:id')
    .get(protect, getProjectById)
    .put(protect, authorize('ADMIN', 'MANAGER'), updateProject)
    .delete(protect, authorize('ADMIN', 'MANAGER'), deleteProject);

module.exports = router;
