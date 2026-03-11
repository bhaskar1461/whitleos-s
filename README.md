# Fitness & Journal Tracker

Fitness tracking app with React frontend + Express backend, OAuth login, Google Fit sync, and admin usage stats.

## Stack
- React 18 (Create React App)
- Express 5 + Passport (GitHub and Google OAuth)
- Azure Cosmos DB (Mongo API) / MongoDB, with KV/local fallback

## Current Runtime
- Primary app: React frontend in `src/` + Express backend in `server/`
- Secondary scaffold: FastAPI code in `app/` with Python dependencies in `requirements.txt`

The Node/React path is the active product runtime used by `npm run dev`.

## Features
- OAuth login with GitHub and Google
- Meal, workout, step, and journal tracking
- Google Fit import for steps/workouts
- Health-data endpoints and progress summary
- Admin usage stats endpoint (`/api/admin/stats`)
- Admin entries endpoint (`/api/admin/entries`)
- Admin UI page at `/admin`

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Configure env
Copy `.env.example` to `.env` and set values:

```env
API_PORT=4000
FRONTEND_URL=http://localhost:3000
FRONTEND_URLS=http://localhost:3000
REACT_APP_BACKEND_ORIGIN=http://localhost:4000
REACT_APP_API_BASE_URL=http://localhost:4000
SESSION_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET
ADMIN_TOKEN=CHANGE_THIS_TO_A_PRIVATE_ADMIN_TOKEN

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

### 3. Run
```bash
npm run dev
```

App URLs:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Main API Routes
- `GET /api/auth/providers`
- `GET /api/health/providers`
- `POST /api/sync/google-fit`
- `GET /api/health-data`
- `POST /api/health-data`
- `GET /api/health-data/summary`
- `GET /api/admin/stats` (requires `x-admin-token` header)
- `GET /api/admin/entries` (requires `x-admin-token` header)

## Scripts
- `npm start`: production Node server (serves API + built React app)
- `npm run client`: React dev server
- `npm run server`: Express server
- `npm run dev`: run frontend + backend together
- `npm run build`: production build
- `npm run analyze`: run automated checks and generate `analysis-report.latest.md`
- `npm run analyze:push`: run checks, then auto-commit + push if checks pass

For tests in analyzer mode, use:

```bash
npm run analyze -- --with-tests
```

To analyze, auto-commit, and push on success:

```bash
npm run analyze:push
```

## Notes
- GitHub login works for standard authentication.
- Google login enables access to Google Fit sync when credentials are configured.
- Some older repo files still reference Python/FastAPI work, but that is not the main app path today.

## Deploy (Azure App Service)

This repo can run frontend + backend in one Azure Web App (Linux, Node 22 LTS recommended).

### 1) Create Azure Web App
- Runtime stack: Node 22 LTS (recommended) or Node 20 LTS
- OS: Linux
- Startup command: `npm start`

### 2) Configure Azure App Settings
```env
NODE_ENV=production
SESSION_SECRET=<long-random-secret>
ADMIN_TOKEN=<private-admin-token>
MONGODB_URI=<cosmos-mongo-connection-string>
MONGODB_DB_NAME=whitleos
MONGODB_COLLECTION=appState
MONGODB_STATE_DOC_ID=whitleos-state-v1

FRONTEND_URL=https://<your-azure-domain>
FRONTEND_URLS=https://<your-azure-domain>

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=https://<your-azure-domain>/auth/github/callback

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://<your-azure-domain>/auth/google/callback
```

Keep these unset in Azure unless you intentionally run a separate backend:
```env
REACT_APP_API_BASE_URL=
REACT_APP_BACKEND_ORIGIN=
```

Legacy alternative persistent storage:
```env
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_DATA_KEY=whitleos:db:v1
```

### 3) OAuth Console Values
- GitHub Homepage URL: `https://<your-azure-domain>`
- GitHub callback URL: `https://<your-azure-domain>/auth/github/callback`
- Google authorized JavaScript origin: `https://<your-azure-domain>`
- Google redirect URI: `https://<your-azure-domain>/auth/google/callback`

### 4) Verification
```bash
curl -s https://<your-azure-domain>/api/auth/providers
curl -I https://<your-azure-domain>/auth/github
curl -I https://<your-azure-domain>/auth/google
curl -s -H "x-admin-token: <ADMIN_TOKEN>" https://<your-azure-domain>/api/admin/stats
curl -s -H "x-admin-token: <ADMIN_TOKEN>" "https://<your-azure-domain>/api/admin/entries?limit=20"
```

Open:
- App: `https://<your-azure-domain>/`
- Admin console: `https://<your-azure-domain>/admin`
