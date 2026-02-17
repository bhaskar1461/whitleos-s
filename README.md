# Fitness & Journal Tracker

Full-stack fitness tracking app with React + Express, OAuth login, Google Fit sync, and merged health-data flow (including optional direct Zepp sync).

## Stack
- React 18 (Create React App)
- Express 5 + Passport (GitHub and Google OAuth)
- lowdb JSON storage

## Features
- OAuth login with GitHub and Google
- Meal, workout, step, and journal tracking
- Google Fit import for steps/workouts
- Health-data endpoints and progress summary
- Optional direct Zepp sync (`ZEPP_PHONE`, `ZEPP_PASSWORD`)

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
REACT_APP_BACKEND_ORIGIN=http://localhost:4000
SESSION_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Optional Zepp direct sync
ZEPP_PHONE=...
ZEPP_PASSWORD=...
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
- `POST /api/sync/zepp` (requires Zepp env vars)
- `GET /api/health-data`
- `POST /api/health-data`
- `GET /api/health-data/summary`

## Scripts
- `npm start`: React dev server
- `npm run server`: Express server
- `npm run dev`: run frontend + backend together
- `npm run build`: production build

## Deploy (Render)
- Build: `npm install && npm run build`
- Start: `npm run server`
- Set env vars from `.env.example`
