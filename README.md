# Fitness & Journal Tracker

Fitness tracking app with React frontend + Express backend, OAuth login, Google Fit sync, and admin usage stats.

## Stack
- React 18 (Create React App)
- Express 5 + Passport (GitHub and Google OAuth)
- lowdb JSON storage

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
- `npm start`: React dev server
- `npm run server`: Express server
- `npm run dev`: run frontend + backend together
- `npm run build`: production build

## Deploy (Vercel Full Stack)

This repo can run both frontend and backend on one Vercel project.

### 1) Vercel Project
- Import repo to Vercel.
- Framework preset: Create React App.
- Keep default build command `npm run build`.

### 2) Required Vercel environment variables
```env
SESSION_SECRET=<long-random-secret>
ADMIN_TOKEN=<private-admin-token>

FRONTEND_URL=https://<your-vercel-domain>
FRONTEND_URLS=https://<your-vercel-domain>

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=https://<your-vercel-domain>/auth/github/callback

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://<your-vercel-domain>/auth/google/callback
```

Optional but strongly recommended for persistent data on Vercel:
```env
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_DATA_KEY=whitleos:db:v1
```

### 3) OAuth Console Values
- GitHub Homepage URL: `https://<your-vercel-domain>`
- GitHub callback URL: `https://<your-vercel-domain>/auth/github/callback`
- Google authorized JavaScript origin: `https://<your-vercel-domain>`
- Google redirect URI: `https://<your-vercel-domain>/auth/google/callback`

### 4) Verification
```bash
curl -s https://<your-vercel-domain>/api/auth/providers
curl -I https://<your-vercel-domain>/auth/github
curl -I https://<your-vercel-domain>/auth/google
curl -s -H "x-admin-token: <ADMIN_TOKEN>" https://<your-vercel-domain>/api/admin/stats
curl -s -H "x-admin-token: <ADMIN_TOKEN>" "https://<your-vercel-domain>/api/admin/entries?limit=20"
```

Open:
- App: `https://<your-vercel-domain>/`
- Admin console: `https://<your-vercel-domain>/admin`
