# Deployment Guide

## Option A (Recommended): Vercel Full Stack

This repo is configured so one Vercel project can serve:
- React frontend
- Express backend routes (`/api/*`, `/auth/*`, `/logout`, `/webhook`, `/healthz`)

The routing is defined in `vercel.json`.

### 1) Create project
- Import this repo in Vercel.
- Framework preset: Create React App.
- Build command: `npm run build`

### 2) Configure environment variables

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

Optional (recommended for persistent data on Vercel):

```env
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_DATA_KEY=whitleos:db:v1
```

### 3) OAuth provider settings

GitHub OAuth app:
- Homepage URL: `https://<your-vercel-domain>`
- Callback URL: `https://<your-vercel-domain>/auth/github/callback`

Google OAuth client:
- Authorized JavaScript origin: `https://<your-vercel-domain>`
- Redirect URI: `https://<your-vercel-domain>/auth/google/callback`

### 4) Verify

```bash
curl -s https://<your-vercel-domain>/api/auth/providers
curl -I https://<your-vercel-domain>/auth/github
curl -I https://<your-vercel-domain>/auth/google
curl -s -H "x-admin-token: <ADMIN_TOKEN>" https://<your-vercel-domain>/api/admin/stats
curl -s -H "x-admin-token: <ADMIN_TOKEN>" "https://<your-vercel-domain>/api/admin/entries?limit=20"
```

## Option B: Vercel Frontend + Render Backend

Still supported if you prefer keeping backend on Render.

Frontend env (Vercel):

```env
REACT_APP_API_BASE_URL=https://<your-render-domain>
REACT_APP_BACKEND_ORIGIN=https://<your-render-domain>
```

Backend env (Render):

```env
SESSION_SECRET=<long-random-secret>
ADMIN_TOKEN=<private-admin-token>

FRONTEND_URL=https://<your-vercel-domain>
FRONTEND_URLS=https://<your-vercel-domain>

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=https://<your-render-domain>/auth/github/callback

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://<your-render-domain>/auth/google/callback
```
