# Deployment Guide

## Option A (Recommended): Azure App Service (Single App)

This repo can run React frontend + Express backend in one Azure Web App.

### 1) Create Azure Web App
- Runtime stack: Node 22 LTS (recommended) or Node 20 LTS
- OS: Linux
- Startup command: `npm start`

If using Deployment Center (GitHub), enable build during deployment so `npm run build` runs.

### 2) Create Azure Cosmos DB (Mongo API)
- Create resource: `Azure Cosmos DB for MongoDB`.
- In `Connection string`, copy the primary Mongo connection string.
- Keep default network security (private/public) based on your app networking model.

### 3) Configure App Settings

Set these in Azure App Service Configuration:

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

Leave these unset for same-origin deployment:

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

### 4) OAuth Provider Settings

GitHub OAuth app:
- Homepage URL: `https://<your-azure-domain>`
- Callback URL: `https://<your-azure-domain>/auth/github/callback`

Google OAuth client:
- Authorized JavaScript origin: `https://<your-azure-domain>`
- Redirect URI: `https://<your-azure-domain>/auth/google/callback`

### 5) Verify

```bash
curl -s https://<your-azure-domain>/api/auth/providers
curl -I https://<your-azure-domain>/auth/github
curl -I https://<your-azure-domain>/auth/google
curl -s https://<your-azure-domain>/healthz
curl -s -H "x-admin-token: <ADMIN_TOKEN>" https://<your-azure-domain>/api/admin/stats
curl -s -H "x-admin-token: <ADMIN_TOKEN>" "https://<your-azure-domain>/api/admin/entries?limit=20"
```

Open:
- App: `https://<your-azure-domain>/`
- Admin: `https://<your-azure-domain>/admin`

## Option B: Azure Frontend + Separate Backend

If you host frontend and backend separately, set frontend build env:

```env
REACT_APP_API_BASE_URL=https://<your-backend-domain>
REACT_APP_BACKEND_ORIGIN=https://<your-backend-domain>
```

And set backend CORS env:

```env
FRONTEND_URL=https://<your-frontend-domain>
FRONTEND_URLS=https://<your-frontend-domain>
```

## Legacy Option: Vercel

Vercel config files remain in this repo, but Azure is now the primary deployment target.
