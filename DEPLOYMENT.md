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

---

## 🎉 Success!
Your app is now live. Share the Vercel link with anyone!

---

## 🔧 Troubleshooting

### CORS Error on Production
If you see `Access to XMLHttpRequest has been blocked by CORS policy`:

1. **Check Render Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Look for errors like "CORS blocked origin"
   
2. **Verify Environment Variables:**
   - Make sure `VITE_API_URL` on Vercel matches your Render backend URL **exactly**
   - No trailing slash: ✅ `https://repodig.onrender.com` ❌ `https://repodig.onrender.com/`

3. **Redeploy Backend:**
   - After updating CORS configuration in `server.js`, redeploy on Render
   - Go to Render → Manual Deploy → Deploy Latest Commit

### Backend Not Responding (ERR_FAILED)
If the backend shows `net::ERR_FAILED`:

1. **Check if backend is running:**
   - Visit your backend URL directly: `https://repodig.onrender.com/health`
   - Should return: "GraphRAG Archaeologist Backend is running"

2. **Check Render deployment status:**
   - Green = Running
   - Red = Failed (check logs for errors)

3. **Common issues:**
   - Neo4j credentials incorrect → Check environment variables
   - Build failed → Check Render build logs
   - Free tier sleep → First request may take 30-60 seconds to wake up

### Neo4j Connection Issues
If you see "Failed to connect to Neo4j":

1. Verify `NEO4J_URI` starts with `neo4j+s://` (not `bolt://`)
2. Check password is correct (copy-paste from Aura console)
3. Ensure Neo4j instance is running (green dot in Aura console)

