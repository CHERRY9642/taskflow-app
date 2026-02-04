const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Manager, Admin
const createProject = asyncHandler(async (req, res) => {
    const { name, description, status, managerId } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Project name is required');
    }

    // If Admin is creating, they must specify managerId, or it defaults to them if they are manager role?
    // Simplification: Current user is the manager if not specified and they are Manager role.
    // Actually, requirement says "Manager Dashboard: Create projects". Admin can too.

    const mId = managerId || req.user.id;

    const project = await prisma.project.create({
        data: {
            name,
            description,
            status, // Optional, default 'active'
            managerId: mId,
        },
        include: {
            manager: {
                select: { name: true, email: true }
            }
        }
    });

    res.status(201).json(project);
});

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
    let projects;

    if (req.user.role === 'ADMIN') {
        projects = await prisma.project.findMany({
            include: {
                manager: { select: { name: true, email: true } },
                tasks: true // Include tasks count or list? List for now.
            },
        });
    } else if (req.user.role === 'MANAGER') {
        // Managers see projects they manage
        projects = await prisma.project.findMany({
            where: { managerId: req.user.id },
            include: {
                manager: { select: { name: true, email: true } },
                tasks: true
            },
        });
    } else {
        // Users see projects where they have tasks assigned? 
        // Or projects they are "assigned to"? 
        // Schema doesn't have explicit User-Project m:n relation, only via Tasks.
        // Let's query projects where tasks have assigneeId = user.id
        // This is distinct. 
        // Wait, requirement: "User Dashboard: View assigned projects".
        // Usually implies being "on the team". But without a Team table, we can infer from tasks.
        // Implementation: Find projects where there is at least one task assigned to user.
        projects = await prisma.project.findMany({
            where: {
                tasks: {
                    some: {
                        assigneeId: req.user.id
                    }
                }
            },
            include: {
                manager: { select: { name: true } }
            }
        });
    }

    res.status(200).json(projects);
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: {
            manager: { select: { name: true, email: true } },
            tasks: {
                include: {
                    assignee: { select: { name: true } }
                }
            }
        },
    });

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Access check
    if (req.user.role !== 'ADMIN' &&
        req.user.role !== 'MANAGER' && // Manager should only see their own? Strict vs loose. Let's start loose or check managerId.
        project.managerId !== req.user.id) {

        // Check if user has task in project
        const userHasTask = project.tasks.some(t => t.assigneeId === req.user.id);
        if (req.user.role === 'USER' && !userHasTask) {
            res.status(403);
            throw new Error('Not authorized to view this project');
        }

        if (req.user.role === 'MANAGER' && project.managerId !== req.user.id) {
            // Should Managers see other managers' projects? Usually no.
            res.status(403);
            throw new Error('Not authorized to view this project');
        }
    }

    res.status(200).json(project);
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Manager, Admin
const updateProject = asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
        where: { id: req.params.id },
    });

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (req.user.role !== 'ADMIN' && project.managerId !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const updatedProject = await prisma.project.update({
        where: { id: req.params.id },
        data: req.body,
    });

    res.status(200).json(updatedProject);
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Manager, Admin
const deleteProject = asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
        where: { id: req.params.id },
    });

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (req.user.role !== 'ADMIN' && project.managerId !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized');
    }

    await prisma.project.delete({
        where: { id: req.params.id },
    });

    res.status(200).json({ message: 'Project removed' });
});

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
};
