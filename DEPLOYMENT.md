# Deployment Guide (Free Split Setup)

Use two services:
- Backend API on Render
- Frontend SPA on Vercel or Netlify

This avoids Render building the React app and keeps OAuth/session flow cleaner.

## 1) Backend: Render

Create a Render **Web Service** from this repo.

The Dockerfile now runs backend only:
- installs Node dependencies
- starts `server/index.js`

Required backend environment variables:

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

Optional:

```env
WEBHOOK_SECRET=...
API_PORT=4000
```

## 2) Frontend: Vercel or Netlify

Deploy the same repo as static React.

Frontend environment variables:

```env
REACT_APP_API_BASE_URL=https://<your-render-domain>
REACT_APP_BACKEND_ORIGIN=https://<your-render-domain>
```

Notes:
- `REACT_APP_API_BASE_URL` is used for all `/api/*` and `/logout` calls.
- `REACT_APP_BACKEND_ORIGIN` is used for OAuth start URLs (`/auth/github`, `/auth/google`).

## 3) OAuth Provider Settings

### GitHub OAuth App
- Homepage URL: `https://<your-frontend-domain>`
- Authorization callback URL: `https://<your-render-domain>/auth/github/callback`

### Google OAuth Client (Web)
- Authorized JavaScript origin: `https://<your-frontend-domain>`
- Authorized redirect URI: `https://<your-render-domain>/auth/google/callback`

## 4) Verification Checklist

Backend checks:

```bash
curl -s https://<your-render-domain>/
curl -s https://<your-render-domain>/api/auth/providers
curl -I https://<your-render-domain>/auth/github
curl -I https://<your-render-domain>/auth/google
```

Expected:
- `/` returns `{"status":"ok"}`
- `/api/auth/providers` returns configured provider JSON
- OAuth URLs return redirects, not `404`

Admin stats:

```bash
curl -s -H "x-admin-token: <ADMIN_TOKEN>" https://<your-render-domain>/api/admin/stats
```
