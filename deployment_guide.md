# 🚀 Free Deployment Guide for TaskFlow

This guide covers how to deploy the full-stack application for **free** using **Render** (Backend + Database) and **Vercel** (Frontend).

---

## 🏗️ Architecture Overview

1.  **Database**: PostgreSQL hosted on **Render** (Free Tier).
2.  **Backend API**: Node.js/Express hosted on **Render** (Free Tier).
3.  **Frontend**: React App hosted on **Vercel** (Free Tier).

---

## 1️⃣ Part 1: Database & Backend (Render)

### Step 1: Create a PostgreSQL Database
1.  Sign up at [render.com](https://render.com/).
2.  Click **New +** -> **PostgreSQL**.
3.  Name: `taskflow-db`.
4.  Region: Choose one closest to you (e.g., Singapore or Frankfurt).
5.  Plan: **Free**.
6.  Click **Create Database**.
7.  **IMPORTANT**: Copy the **"Internal Database URL"** (for backend on Render) and **"External Database URL"** (for connecting from your local PC to seed data).

### Step 2: Deploy Backend API
1.  Push your code to **GitHub**.
2.  In Render, click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Root Directory**: `server` (Important!).
5.  **Build Command**: `npm install && npx prisma migrate deploy && node prisma/seed.js`
    *   *Note: This installs deps, updates DB schema, and seeds data.*
6.  **Start Command**: `npm start`
7.  **Environment Variables** (Add these in the "Environment" tab):
    *   `DATABASE_URL`: Paste the **Internal Database URL** from Step 1.
    *   `JWT_SECRET`: Any long random string (e.g., `super_secret_key_123`).
    *   `NODE_ENV`: `production`
    *   `CORS_ORIGIN`: `*` (We will change this to the frontend URL later).
8.  Click **Deploy Web Service**.
9.  Copy your **Backend URL** (e.g., `https://taskflow-api.onrender.com`).

---

## 2️⃣ Part 2: Frontend (Vercel)

### Step 1: Deploy React App
1.  Sign up at [vercel.com](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Framework Preset**: Vite.
5.  **Root Directory**: Edit this -> Select `client`.
6.  **Environment Variables**:
    *   Vercel requires the API URL to be known at *build time*.
    *   Create a file named `.env.production` in your `client` folder locally, OR add this variable in Vercel settings:
    *   `VITE_API_BASE_URL`: Your Render Backend URL (e.g., `https://taskflow-api.onrender.com/api`).
7.  Click **Deploy**.
8.  Copy your **Frontend URL** (e.g., `https://taskflow-app.vercel.app`).

---

## 3️⃣ Part 3: Final Connection

1.  Go back to **Render** -> **Web Service** -> **Environment**.
2.  Edit `CORS_ORIGIN` to be your Vercel URL (e.g., `https://taskflow-app.vercel.app`).
    *   *This ensures only your frontend can talk to your backend.*
3.  **Redeploy** the backend (Manual Deploy -> Clear Cache & Deploy) to apply changes.

---

## 4️⃣ How Data is Stored?

*   **Persistent Storage**: Your data (Users, Projects, Tasks) lives in the **PostgreSQL Database** on Render. Even if you restart the server, the data remains safe.
*   **Images/Files**: Currently, this app does not handle file uploads. If you add image uploading later, you would use a service like **Cloudinary** (also free tier) to store files, and save the *link* in the database.

---

## ✅ Summary

| Component | Host Service | Cost |
| :--- | :--- | :--- |
| **Frontend** | Vercel | Free |
| **Backend** | Render | Free |
| **Database** | Render (Postgres) | Free |

**Note**: Render's free backend "spins down" after inactivity. The first request might take 30-60 seconds to wake it up. This is normal for the free tier.
