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

## Scripts
- `npm start`: React dev server
- `npm run server`: Express server
- `npm run dev`: run frontend + backend together
- `npm run build`: production build

## Deploy (Free Split Setup)

Use:
- Backend: Render (Web Service, Docker)
- Frontend: Vercel or Netlify (Static site)

### 1) Backend on Render
Deploy this repo as a Render Web Service.

Set backend environment variables:
```env
SESSION_SECRET=<long-random-secret>
ADMIN_TOKEN=<private-admin-token>

FRONTEND_URL=https://<your-frontend-domain>
FRONTEND_URLS=https://<your-frontend-domain>

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=https://<your-render-domain>/auth/github/callback

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://<your-render-domain>/auth/google/callback
```

Backend health URL:
- `https://<your-render-domain>/` -> `{ "status": "ok" }`

### 2) Frontend on Vercel/Netlify
Deploy the same repo as a static frontend.

Set frontend environment variables:
```env
REACT_APP_API_BASE_URL=https://<your-render-domain>
REACT_APP_BACKEND_ORIGIN=https://<your-render-domain>
```

### 3) OAuth Console Values
- GitHub callback URL: `https://<your-render-domain>/auth/github/callback`
- Google redirect URI: `https://<your-render-domain>/auth/google/callback`
- Google authorized JavaScript origin: `https://<your-frontend-domain>`

## Admin Stats
- Set `ADMIN_TOKEN` in environment.
- Call:
```bash
curl -H "x-admin-token: <ADMIN_TOKEN>" https://<your-domain>/api/admin/stats
```
- Returns:
  - total users
  - active users (24h / 7d / 30d)
  - logins trend (last 14 days)
  - data record totals

## Render Free Performance Notes
- Free web services cold start after idle, so first request can be slow.
- This app now minimizes local-db disk reads and adds compression/caching headers.
- For best speed:
  - keep one service for this app only
  - avoid very large payload syncs on first page load
  - use periodic pings if you need lower cold-start impact
