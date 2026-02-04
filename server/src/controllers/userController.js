const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
    res.status(200).json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id },
    });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await prisma.user.delete({
        where: { id: req.params.id },
    });

    res.status(200).json({ message: 'User deleted' });
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!role || !['ADMIN', 'MANAGER', 'USER'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role');
    }

    const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { role },
        select: { id: true, name: true, email: true, role: true }
    });

    res.status(200).json(user);
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            // Include assigned tasks summary if needed, but separate component is better.
        }
    });

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    if (user) {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name: req.body.name || user.name,
                email: req.body.email || user.email,
                // Password update logic
                password: req.body.password ? await require('bcryptjs').hash(req.body.password, 10) : user.password
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        res.json(updatedUser);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role || 'USER',
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    res.status(201).json(user);
});

module.exports = {
    getUsers,
    deleteUser,
    updateUserRole,
    getUserProfile,
    updateUserProfile,
    createUser
};
