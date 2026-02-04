const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get Admin Analytics (System wide)
// @route   GET /api/analytics/admin
// @access  Private/Admin
const getAdminAnalytics = asyncHandler(async (req, res) => {
    const totalUsers = await prisma.user.count();
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const managers = await prisma.user.count({ where: { role: 'MANAGER' } });
    const users = await prisma.user.count({ where: { role: 'USER' } });

    const totalProjects = await prisma.project.count();
    const activeProjects = await prisma.project.count({ where: { status: 'active' } });

    const totalTasks = await prisma.task.count();
    const todoTasks = await prisma.task.count({ where: { status: 'TODO' } });
    const inProgressTasks = await prisma.task.count({ where: { status: 'IN_PROGRESS' } });
    const doneTasks = await prisma.task.count({ where: { status: 'DONE' } });

    // Recent activity (Last 5 created users or projects)
    const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    const recentProjects = await prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, status: true, manager: { select: { name: true } }, createdAt: true }
    });

    res.status(200).json({
        users: { total: totalUsers, admins, managers, users },
        projects: { total: totalProjects, active: activeProjects },
        tasks: { total: totalTasks, todo: todoTasks, inProgress: inProgressTasks, done: doneTasks },
        recentActivity: { users: recentUsers, projects: recentProjects }
    });
});

// @desc    Get Manager Analytics (My Projects/Teams)
// @route   GET /api/analytics/manager
// @access  Private/Manager
const getManagerAnalytics = asyncHandler(async (req, res) => {
    // 1. My Projects Count
    const myProjectsCount = await prisma.project.count({ where: { managerId: req.user.id } });

    // 2. Tasks distribution in my projects
    // First find IDs of my projects
    const myProjects = await prisma.project.findMany({
        where: { managerId: req.user.id },
        select: { id: true }
    });
    const projectIds = myProjects.map(p => p.id);

    const totalTasks = await prisma.task.count({ where: { projectId: { in: projectIds } } });
    const todoTasks = await prisma.task.count({ where: { projectId: { in: projectIds }, status: 'TODO' } });
    const inProgressTasks = await prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' } });
    const doneTasks = await prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } });

    res.status(200).json({
        projects: { total: myProjectsCount },
        tasks: { total: totalTasks, todo: todoTasks, inProgress: inProgressTasks, done: doneTasks }
    });
});

module.exports = {
    getAdminAnalytics,
    getManagerAnalytics
};
