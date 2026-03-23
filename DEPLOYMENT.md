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

## Rust Analytics On Azure Container Apps

The Rust sidecar in `services/rust-analytics/` is designed to deploy separately from the main Node app.

### Files Added For This Path
- `services/rust-analytics/Dockerfile`
- `.github/workflows/azure-rust-analytics.yml`

### Recommended Azure Topology
- keep the main React + Express app on Azure App Service
- deploy the Rust analytics sidecar to Azure Container Apps
- point both services at the same Azure Cosmos DB for MongoDB connection string

### GitHub Secrets Required
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_ACR_USERNAME`
- `AZURE_ACR_PASSWORD`
- `RUST_ANALYTICS_MONGODB_URI`
- `RUST_ANALYTICS_TOKEN`

### GitHub Repository Variables Required
- `AZURE_RESOURCE_GROUP`
- `AZURE_CONTAINER_REGISTRY_NAME`
- `AZURE_CONTAINER_APP_NAME`
- `AZURE_RUST_IMAGE_REPOSITORY`

### Optional GitHub Repository Variables
- `RUST_ANALYTICS_MONGODB_DB_NAME` default: `whitleos`
- `RUST_ANALYTICS_MONGODB_COLLECTION` default: `appState`
- `RUST_ANALYTICS_MONGODB_STATE_DOC_ID` default: `whitleos-state-v1`
- `RUST_ANALYTICS_SNAPSHOT_COLLECTION` default: `analyticsSnapshots`
- `RUST_ANALYTICS_ETL_ENABLED` default: `true`
- `RUST_ANALYTICS_ETL_INTERVAL_SECS` default: `300`
- `RUST_ANALYTICS_ETL_RETENTION_DAYS` default: `30`
- `RUST_ANALYTICS_RECENT_ACTIVITY_LIMIT` default: `20`
- `RUST_ANALYTICS_LOGIN_SERIES_DAYS` default: `14`
- `RUST_ANALYTICS_MONGO_MAX_POOL_SIZE` default: `20`
- `AZURE_CONTAINER_APP_MIN_REPLICAS` default: `1`
- `AZURE_CONTAINER_APP_MAX_REPLICAS` default: `3`

### What The Workflow Does
- logs into Azure using OpenID Connect
- builds the Rust container image from `services/rust-analytics/Dockerfile`
- pushes the image to Azure Container Registry
- updates the Azure Container App
- configures ingress on port `8081`
- stores MongoDB and analytics token values as Container App secrets
- applies runtime environment variables and ETL settings

### Node App Settings To Add In Azure App Service

Set these in the Node app after the Rust sidecar is deployed:

```env
RUST_ANALYTICS_BASE_URL=https://<rust-container-app-fqdn>
RUST_ANALYTICS_TOKEN=<same-token-as-container-app>
RUST_ANALYTICS_TIMEOUT_MS=3000
```

Then your main app can call:

```bash
curl -H "x-admin-token: <ADMIN_TOKEN>" "https://<your-node-app>/api/admin/analytics"
```

## Legacy Option: Vercel

Vercel config files remain in this repo, but Azure is now the primary deployment target.
