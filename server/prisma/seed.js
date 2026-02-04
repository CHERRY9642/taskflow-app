const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning database...');
    // Delete in order to avoid foreign key constraints
    await prisma.workLog.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    console.log('Seeding database...');
    const password = await bcrypt.hash('123456', 10);

    // --- Users ---
    // Admin
    const admin = await prisma.user.create({
        data: { name: 'Admin User', email: 'admin@example.com', password, role: 'ADMIN' }
    });

    // Managers
    const manager1 = await prisma.user.create({
        data: { name: 'Sarah Manager', email: 'manager@example.com', password, role: 'MANAGER' }
    });
    const manager2 = await prisma.user.create({
        data: { name: 'Mike Tech Lead', email: 'mike@example.com', password, role: 'MANAGER' }
    });

    // Users
    const user1 = await prisma.user.create({
        data: { name: 'Alice Frontend', email: 'alice@example.com', password, role: 'USER' }
    });
    const user2 = await prisma.user.create({
        data: { name: 'Bob Backend', email: 'bob@example.com', password, role: 'USER' }
    });
    const user3 = await prisma.user.create({
        data: { name: 'Charlie QA', email: 'charlie@example.com', password, role: 'USER' }
    });
    const user4 = await prisma.user.create({
        data: { name: 'Diana Designer', email: 'diana@example.com', password, role: 'USER' }
    });

    // --- Projects ---
    // Manager 1 Projects
    const p1 = await prisma.project.create({
        data: {
            name: 'Website Redesign',
            description: 'Complete overhaul of the corporate website using React and Tailwind.',
            status: 'active',
            managerId: manager1.id
        }
    });
    const p2 = await prisma.project.create({
        data: {
            name: 'Mobile App Beta',
            description: 'Launch the iOS beta for internal testing.',
            status: 'active',
            managerId: manager1.id
        }
    });
    const p3 = await prisma.project.create({
        data: {
            name: 'Legacy Migration',
            description: 'Move old SQL database to new cloud infrastructure.',
            status: 'completed',
            managerId: manager1.id
        }
    });

    // Manager 2 Projects
    const p4 = await prisma.project.create({
        data: {
            name: 'AI Integration',
            description: 'Research and implement AI-based text analysis.',
            status: 'on_hold',
            managerId: manager2.id
        }
    });

    // --- Tasks ---
    const tasks = [
        // P1: Website Redesign
        { title: 'Create Wireframes', status: 'DONE', projectId: p1.id, assigneeId: user4.id, dueDate: '2023-11-01' },
        { title: 'Setup React Repo', status: 'DONE', projectId: p1.id, assigneeId: user1.id, dueDate: '2023-11-05' },
        { title: 'Implement Homepage', status: 'IN_PROGRESS', projectId: p1.id, assigneeId: user1.id, dueDate: '2024-02-28' },
        { title: 'Setup API Endpoints', status: 'IN_PROGRESS', projectId: p1.id, assigneeId: user2.id, dueDate: '2024-02-20' },
        { title: 'Write Tests', status: 'TODO', projectId: p1.id, assigneeId: user3.id, dueDate: '2024-03-01' },

        // P2: Mobile App
        { title: 'Design App Icon', status: 'DONE', projectId: p2.id, assigneeId: user4.id, dueDate: '2023-12-01' },
        { title: 'Fix Login Bug', status: 'IN_PROGRESS', projectId: p2.id, assigneeId: user1.id, dueDate: '2024-02-15' },
        { title: 'Push to TestFlight', status: 'TODO', projectId: p2.id, assigneeId: manager1.id, dueDate: '2024-02-25' },

        // P4: AI Integration
        { title: 'Research Models', status: 'TODO', projectId: p4.id, assigneeId: user2.id, dueDate: '2024-04-01' },
    ];

    for (const t of tasks) {
        await prisma.task.create({
            data: {
                title: t.title,
                description: `Description for ${t.title}`,
                status: t.status,
                projectId: t.projectId,
                assigneeId: t.assigneeId,
                dueDate: new Date(t.dueDate)
            }
        });
    }

    console.log('Seeding finished.');
    console.log('Users created:');
    console.log('Admin: admin@example.com / 123456');
    console.log('Managers: manager@example.com, mike@example.com / 123456');
    console.log('Users: alice@example.com, bob@example.com, charlie@example.com, diana@example.com / 123456');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
