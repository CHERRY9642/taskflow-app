# TaskFlow - Role-Based Project & Task Management System

TaskFlow is a robust, full-stack web application built with the **PERN stack** (PostgreSQL, Express, React, Node.js). It is designed to streamline team collaboration with strict role-based access control, allowing Admins to govern the system, Managers to drive projects, and Users to execute tasks efficiently.

## 🚀 Key Features

### 🛡️ Core & Security
*   **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for **Admin**, **Manager**, and **User**.
*   **Secure Authentication**: JWT-based auth with HttpOnly cookies for session management.
*   **Session Persistence**: Automatic session restoration on page reload.
*   **Global Error Handling**: Centralized error boundaries and API error parsers to prevent white-screen crashes.

### 📊 Dashboards
*   **Admin Dashboard**: System-wide analytics (Total Users, Active Projects), User Management (Promote/Demote/Delete).
*   **Manager Dashboard**: Project creation/editing, Task assignment, Due date management, Project status tracking.
*   **User Dashboard**: Personal task list, Status updates (Todo → In Progress → Done), Personal "Work Log/Notebook".

### 🛠️ Functionality
*   **Task Management**: Create, assign, update status, and delete tasks.
*   **Work Logs (Notebook)**: specialized note-taking feature for users to track daily progress or attach notes to specific tasks.
*   **Analytics**: Visual widgets showing task completion rates and project health.
*   **Profile Management**: Update user details and view role information.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Redux Toolkit (State Management), Tailwind CSS (Styling), Lucide React (Icons).
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (managed via Prisma ORM).
- **DevOps**: ESLint, Vite proxy configuration.

## 📦 Setup Instructions

### Prerequisites
- Node.js (v16+)
- PostgreSQL (Running locally or cloud)

### 1. Clone & Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Configure Environment

Create a `.env` file in the `server` directory:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskflow?schema=public"
JWT_SECRET="your_complex_jwt_secret_here"
NODE_ENV="development"
```

### 3. Database Setup (Prisma)

Run the following commands in the `server` directory to initialize the DB and populate it with demo data:

```bash
# Generate Prisma Client
npx prisma generate

# Run Migrations
npx prisma migrate dev --name init

# Seed Database (Loads comprehensive demo data)
node prisma/seed.js
```

### 4. Run the Application

**Start Backend (Port 5000):**
```bash
cd server
npm run dev
```

**Start Frontend (Port 5173):**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` to view the app.

## 🔐 Demo Credentials

The database seed script populates the app with these accounts.  
**Password for ALL accounts:** `123456`

| Role | Name | Email | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | Admin User | `admin@example.com` | Full System Access, 
| **Admin** | charan | `charan@example.com` | Full System Access, 

Manage Users |
| **Manager** | Sarah Manager | `manager@example.com` | Manage Projects
| **Manager** | bhanu | `bhanu@example.com` | Manage Projects 
| **Manager** | Mike Tech Lead | `mike@example.com` | Manage Projects (On Hold) |
| **User** | Alice Frontend | `alice@example.com` | Frontend Dev Tasks |
| **User** | Bob Backend | `bob@example.com` | Backend Dev Tasks |
| **User** | Charlie QA | `charlie@example.com` | QA Tasks |
| **User** | Diana Designer | `diana@example.com` | Design Tasks |
| **User** | dinesh | `dinesh@example.com` | Design Tasks |

## 🏗️ Deployment

1.  **Backend**: Deploy to Render/Railway. Set `DATABASE_URL` and `JWT_SECRET` in environment variables.
2.  **Frontend**: Build with `npm run build`, then deploy the `dist` folder to Vercel/Netlify.
3.  **Database**: Use a cloud-hosted PostgreSQL (e.g., Supabase, Neon, Aiven).

---
*Built for Blackbuck Engineers Intern Assessment*
