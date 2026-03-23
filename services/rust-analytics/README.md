# Rust Analytics Service

Standalone Rust microservice for high-throughput analytics and ETL, designed to sit beside the existing Express backend instead of replacing it.

## What It Does

- reads the same MongoDB / Azure Cosmos DB (Mongo API) state document used by the Node app
- exposes `GET /analytics` for aggregated usage and activity analytics
- computes:
  - total users
  - user counts per provider
  - login totals per provider
  - rolling login series
  - recent activity across core collections
- optionally runs a periodic ETL loop that writes snapshot documents into a separate collection

## Project Structure

```text
services/rust-analytics/
├── Cargo.toml
├── .env.example
├── README.md
└── src/
    ├── app_state.rs
    ├── config.rs
    ├── error.rs
    ├── etl.rs
    ├── main.rs
    ├── models.rs
    ├── repository.rs
    ├── routes.rs
    └── service.rs
```

## Shared Mongo Shape

The current Node app persists a single state document, not normalized Mongo collections:

```json
{
  "_id": "whitleos-state-v1",
  "state": {
    "users": [],
    "journal": [],
    "meals": [],
    "workouts": [],
    "steps": [],
    "healthData": [],
    "connections": [],
    "webhooks": [],
    "analytics": {
      "loginsByDate": {}
    }
  }
}
```

This service reads that document directly so it stays compatible with the existing Express runtime.

## Environment Configuration

Example service `.env`:

```env
RUST_ANALYTICS_HOST=0.0.0.0
RUST_ANALYTICS_PORT=8081
RUST_ANALYTICS_TOKEN=CHANGE_THIS_SHARED_SERVICE_TOKEN
RUST_ANALYTICS_RECENT_ACTIVITY_LIMIT=20
RUST_ANALYTICS_LOGIN_SERIES_DAYS=14
RUST_ANALYTICS_MONGO_MAX_POOL_SIZE=20

MONGODB_URI=mongodb://...
MONGODB_DB_NAME=whitleos
MONGODB_COLLECTION=appState
MONGODB_STATE_DOC_ID=whitleos-state-v1

RUST_ANALYTICS_ETL_ENABLED=true
RUST_ANALYTICS_ETL_INTERVAL_SECS=300
RUST_ANALYTICS_ETL_RETENTION_DAYS=30
RUST_ANALYTICS_SNAPSHOT_COLLECTION=analyticsSnapshots
```

Node-side bridge variables:

```env
RUST_ANALYTICS_BASE_URL=http://127.0.0.1:8081
RUST_ANALYTICS_TOKEN=CHANGE_THIS_SHARED_SERVICE_TOKEN
RUST_ANALYTICS_TIMEOUT_MS=3000
```

## Running Locally

```bash
cd services/rust-analytics
cp .env.example .env
# fill in Mongo/Cosmos values to match the Node app
cargo run
```

This service is pinned to Rust `1.82.0` via `rust-toolchain.toml` so local builds match the Docker image and GitHub Actions workflow.

Default endpoint:

```bash
curl -H "x-analytics-token: CHANGE_THIS_SHARED_SERVICE_TOKEN" \
  "http://127.0.0.1:8081/analytics?limit=20&windowDays=14"
```

Health check:

```bash
curl http://127.0.0.1:8081/healthz
```

## How Express Talks To Rust

This repo now includes:

- `server/services/rustAnalyticsClient.js`
- `server/services/localAnalyticsFallback.js`
- `GET /api/admin/analytics`

The new Express route tries Rust first, then falls back to local aggregation if the Rust service is down, slow, or not configured.

## Production Notes

- deploy the Rust service separately from the Node app so it can scale independently
- keep `RUST_ANALYTICS_TOKEN` identical in both services
- point both services at the same Mongo/Cosmos database and state document
- snapshots are written to `RUST_ANALYTICS_SNAPSHOT_COLLECTION`, leaving the live app state untouched
- if the Rust service fails, Express can still serve analytics through its fallback path
