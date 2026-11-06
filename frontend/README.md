# BECC Frontend

React 19 + Vite 7 frontend for BHARTI EXCELLENT COACHING CENTER.

## Requirements
- Node.js 22.12 or newer
- The BECC backend is expected at `http://localhost:4000` during local development.

## Install and run (Windows PowerShell)
```powershell
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The included `vite.config.js` proxies `/api` and `/uploads` to `http://localhost:4000`.

Do not change the API proxy or add a frontend API URL override until the backend connection steps are confirmed. Keep the backend and frontend in separate folders as provided.
