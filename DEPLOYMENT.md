# Deployment Guide

This project is a single Node web service that serves:
- React production build (`build/`)
- Express API (`server/index.js`)

## Render (Recommended Free Setup)

### Build/Start commands
- Build: `npm install && npm run build`
- Start: `npm run server`

### Required environment variables
```env
SESSION_SECRET=<long-random-secret>
FRONTEND_URL=https://<your-render-domain>
REACT_APP_BACKEND_ORIGIN=https://<your-render-domain>

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=https://<your-render-domain>/auth/github/callback

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://<your-render-domain>/auth/google/callback
```

### Optional environment variables
```env
ZEPP_PHONE=...
ZEPP_PASSWORD=...
WEBHOOK_SECRET=...
ADMIN_TOKEN=...
API_PORT=4000
```

## OAuth Console Setup

### GitHub OAuth App
- Homepage URL: `https://<your-render-domain>`
- Callback URL: `https://<your-render-domain>/auth/github/callback`

### Google OAuth Client (Web)
- Authorized JavaScript origin: `https://<your-render-domain>`
- Redirect URI: `https://<your-render-domain>/auth/google/callback`

## Post-deploy checks

```bash
curl -s https://<your-render-domain>/api/auth/providers
curl -I https://<your-render-domain>/auth/github
curl -I https://<your-render-domain>/auth/google
curl -s -H "x-admin-token: <ADMIN_TOKEN>" https://<your-render-domain>/api/admin/stats
```

Expected:
- `/api/auth/providers` returns JSON with provider config
- OAuth routes return redirects (not `404`)
