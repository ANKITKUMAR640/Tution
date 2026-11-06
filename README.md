# BECC Backend

Express 5 + Prisma 7 + PostgreSQL backend for BHARTI EXCELLENT COACHING CENTER.

## Requirements
- Node.js 22.12 or newer
- Docker Desktop (for the included local PostgreSQL service)

## Install dependencies
Run these commands in PowerShell from this backend folder:
```powershell
Copy-Item .env.example .env
npm install
```

Then configure `.env` with your local database URL, a unique JWT secret (at least 32 characters), the Admin email, and a strong Admin password. Never share `.env`.

Database setup and server startup commands will be provided after checking your local extraction and installation steps. Do not run migrations or seed the database yet.

API default: `http://localhost:4000`
Health endpoint: `http://localhost:4000/api/health`
