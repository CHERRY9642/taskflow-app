const express = require('express');
const router = express.Router();
const {
    getUsers,
    deleteUser,
    updateUserRole,
    getUserProfile,
    updateUserProfile,
    createUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, authorize('ADMIN', 'MANAGER'), getUsers)
    .post(protect, authorize('ADMIN'), createUser);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route('/:id')
    .delete(protect, authorize('ADMIN'), deleteUser);

router.route('/:id/role')
    .put(protect, authorize('ADMIN'), updateUserRole);

module.exports = router;
