const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a work log entry
// @route   POST /api/work-logs
// @access  Private (All roles)
const createWorkLog = asyncHandler(async (req, res) => {
    const { description, taskId } = req.body;

    if (!description) {
        res.status(400);
        throw new Error('Description is required');
    }

    const workLog = await prisma.workLog.create({
        data: {
            description,
            userId: req.user.id,
            taskId: taskId || null
        },
    });

    res.status(201).json(workLog);
});

// @desc    Get my work logs
// @route   GET /api/work-logs?taskId=...
// @access  Private (All roles)
const getMyWorkLogs = asyncHandler(async (req, res) => {
    const { taskId } = req.query;
    const where = { userId: req.user.id };
    if (taskId) where.taskId = taskId;

    const logs = await prisma.workLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(logs);
});

// @desc    Delete a work log
// @route   DELETE /api/work-logs/:id
// @access  Private (Owner only)
const deleteWorkLog = asyncHandler(async (req, res) => {
    const log = await prisma.workLog.findUnique({
        where: { id: req.params.id },
    });

    if (!log) {
        res.status(404);
        throw new Error('Work log not found');
    }

    if (log.userId !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await prisma.workLog.delete({
        where: { id: req.params.id },
    });

    res.status(200).json({ message: 'Log deleted' });
});

module.exports = {
    createWorkLog,
    getMyWorkLogs,
    deleteWorkLog
};
