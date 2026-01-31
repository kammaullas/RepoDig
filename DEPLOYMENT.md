# 🚀 Deployment Guide (Step-by-Step)

This guide explains how to deploy **RepoDig** to the cloud so anyone can use it.
You will need 3 free accounts:
1.  **Neo4j AuraDB** (Database)
2.  **Render** (Backend Hosting)
3.  **Vercel** (Frontend Hosting)

---

## Step 1: Set up the Database (Neo4j AuraDB)
1.  Go to [Neo4j Aura Console](https://console.neo4j.io/) and create a free account.
2.  Click **"New Instance"** -> select **"Free"**.
3.  **IMPORTANT:** Copy the **Password** shown immediately securely. You won't see it again.
4.  Wait for the instance to start (green dot).
5.  Copy the **Connection URI** (starts with `neo4j+s://...`).

---

## Step 2: Deploy Backend (Render.com)
1.  Go to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repo: `kammaullas/RepoDig`.
4.  **Settings:**
    *   **Root Directory:** `backend`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
5.  **Environment Variables** (Add these):
    *   `NEO4J_URI`: `neo4j+s://xxxxxxxx.databases.neo4j.io` (From Step 1)
    *   `NEO4J_USER`: `neo4j`
    *   `NEO4J_PASSWORD`: `your-copied-password`
6.  Click **Deploy Web Service**.
7.  Wait for deployment. Copy your new Backend URL (e.g., `https://repodig-backend.onrender.com`).

---

## Step 3: Deploy Frontend (Vercel)
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import `kammaullas/RepoDig`.
4.  **Settings:**
    *   **Root Directory:** Click "Edit" and select `frontend`.
    *   **Framework Preset:** Vite (Auto-detected).
5.  **Environment Variables:**
    *   `VITE_API_URL`: Paste your Render Backend URL (e.g., `https://repodig-backend.onrender.com`)
    *   *Note: Do not add a trailing slash `/`.*
6.  Click **Deploy**.

---

## 🎉 Success!
Your app is now live. Share the Vercel link with anyone!
