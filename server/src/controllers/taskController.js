const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Manager
const createTask = asyncHandler(async (req, res) => {
    const { title, description, projectId, assigneeId, dueDate } = req.body;

    if (!title || !projectId) {
        res.status(400);
        throw new Error('Title and Project ID are required');
    }

    // Verify project existence and ownership
    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Basic check: Only Admin or Project Manager can add tasks
    if (req.user.role !== 'ADMIN' && project.managerId !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to add tasks to this project');
    }

    const task = await prisma.task.create({
        data: {
            title,
            description,
            projectId,
            assigneeId: assigneeId || null, // Convert empty string to null
            dueDate: dueDate ? new Date(dueDate) : null
        }
    });

    res.status(201).json(task);
});

// @desc    Get tasks (My tasks or Project tasks)
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    // If query param projectId is present, get tasks for that project
    // If not, get tasks assigned to current user

    const { projectId } = req.query;

    let tasks;

    if (projectId) {
        // Check access to project
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            res.status(404); throw new Error('Project not found');
        }

        // Check if user is allowed to view project tasks
        const isProjectManager = project.managerId === req.user.id;

        if (req.user.role === 'USER') {
            // Users only see their assigned tasks in this project
            tasks = await prisma.task.findMany({
                where: {
                    projectId,
                    assigneeId: req.user.id
                },
                include: { assignee: { select: { name: true } } }
            });
        } else if (req.user.role === 'ADMIN' || (req.user.role === 'MANAGER' && isProjectManager)) {
            // Admin or Owner Manager sees all tasks
            tasks = await prisma.task.findMany({
                where: { projectId },
                include: { assignee: { select: { name: true } } }
            });
        } else {
            res.status(403);
            throw new Error('Not authorized to view tasks for this project');
        }

    } else {
        // Return all tasks assigned to user
        tasks = await prisma.task.findMany({
            where: { assigneeId: req.user.id },
            include: {
                project: { select: { name: true } }
            }
        });
    }

    res.status(200).json(tasks);
});

// @desc    Update task (Status or details)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const task = await prisma.task.findUnique({
        where: { id: req.params.id },
        include: { project: true }
    });

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Authorization
    // User can update STATUS only, and only if assigned
    // Manager/Admin can update everything

    const isManager = req.user.role === 'ADMIN' || (req.user.role === 'MANAGER' && task.project.managerId === req.user.id);
    const isAssignee = task.assigneeId === req.user.id;

    if (!isManager && !isAssignee) {
        res.status(403);
        throw new Error('Not authorized');
    }

    let dataToUpdate = {};

    if (isManager) {
        dataToUpdate = { ...req.body };
        // Handle Date conversion if present
        if (dataToUpdate.dueDate) {
            dataToUpdate.dueDate = new Date(dataToUpdate.dueDate);
        }
        // Handle empty assigneeId
        if (dataToUpdate.assigneeId === "") {
            dataToUpdate.assigneeId = null;
        }
    } else if (isAssignee) {
        if (req.body.status) {
            dataToUpdate.status = req.body.status;
        }
    }

    const updatedTask = await prisma.task.update({
        where: { id: req.params.id },
        data: dataToUpdate,
    });

    res.status(200).json(updatedTask);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Manager
const deleteTask = asyncHandler(async (req, res) => {
    const task = await prisma.task.findUnique({
        where: { id: req.params.id },
        include: { project: true }
    });

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const isManager = req.user.role === 'ADMIN' || (req.user.role === 'MANAGER' && task.project.managerId === req.user.id);

    if (!isManager) {
        res.status(403);
        throw new Error('Not authorized');
    }

    await prisma.task.delete({
        where: { id: req.params.id },
    });

    res.status(200).json({ message: 'Task deleted' });
});

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask
};
