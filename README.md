# VibeCraft // Archaeologist
**Neural-Linked Codebase Exploration System**

VibeCraft is a powerful codebase visualization tool that ingests GitHub repositories and generates an interactive, force-directed dependency graph. It reveals the "shape" of code, helping developers understand complex architectures at a glance.

![Screenshot](screenshot.png)

## 🚀 Quick Start Guide

### Prerequisites
1.  **Node.js** (v18+)
2.  **Neo4j Desktop** (or a local Neo4j instance)
    *   Create a local database with password: `password` (or configure in `backend/db.js`)
    *   Start the database.

### 1. Installation
Clone the repo and install dependencies for both ends:

```bash
# Backend
cd backend
npm install
npm install d3-force # Required for physics engine

# Frontend
cd ../frontend
npm install
npm install d3-force
```

### 2. Running the App
You need two terminals running simultaneously:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```
*Server runs on port 3000*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*UI runs on port 5173*

### 3. Usage
1.  Open the App (url from Terminal 2).
2.  Paste a GitHub Repo URL (e.g., `https://github.com/facebook/react`).
3.  Click "INITIATE VISUALIZATION".
4.  Explore the generated knowledge graph!

## 🛠 Tech Stack
*   **Frontend**: React, Vite, React-Force-Graph-2d, D3-Force
*   **Backend**: Node.js, Express, Neo4j Driver
*   **Database**: Neo4j (Graph DB)

## 🎨 Themes
Includes 3 built-in themes:
*   **Cyberpunk** (Default)
*   **Solarized** (Light)
*   **Minimal** (Clean)

## License
MIT
