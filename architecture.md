# Architecture

## Executive Summary
This repo currently contains two architectural directions, but only one is the working product path.

### Canonical Runtime
- React frontend in `src/`
- Express backend in `server/`
- LowDB/KV-backed persistence

### Secondary Path
- FastAPI scaffold in `app/`
- Python dependencies in `requirements.txt`

Until an explicit migration happens, the React + Express stack is the source of truth for product work.

## Architectural Intent
The system should optimize for:
- rapid iteration
- low-friction local development
- clear API ownership
- strong UX delivery
- a migration path toward more durable infrastructure if usage grows

## High-Level System

### Client Layer
- React SPA
- route-driven navigation
- page-level feature composition
- frontend API access via `src/lib/api.js`

### Application Layer
- Express server handles:
  - auth
  - sessions
  - CRUD endpoints
  - Google Fit sync
  - admin metrics
  - webhook ingestion
  - static production serving

### Persistence Layer
- LowDB/local JSON for simple persistence
- optional KV-backed storage in production-like environments

### External Integrations
- GitHub OAuth
- Google OAuth
- Google Fit API
- optional Vercel KV

## Repository Shape

### Product-Critical
- `src/`
- `server/`
- `public/`
- `api/[...path].js`
- `package.json`
- `.env.example`

### Secondary/Experimental
- `app/`
- `requirements.txt`

## Frontend Architecture

### Current Shape
- app shell is route-centric
- feature pages are in `src/pages/`
- shared browser entry is `src/index.js`
- navigation and route registration live in `src/App.js`

### Frontend Strengths
- low overhead
- easy to extend page by page
- simple routing model

### Frontend Gaps
- limited shared component system
- page-driven organization may become harder to scale
- current visual system can be pushed much further for premium differentiation

## Backend Architecture

### Current Express Responsibilities
- session bootstrapping
- OAuth provider registration
- current user resolution
- protected collection routes
- health data normalization
- Google Fit import orchestration
- admin analytics aggregation
- webhook verification and storage

### Data Collections
- `users`
- `connections`
- `journal`
- `steps`
- `meals`
- `workouts`
- `healthData`
- `webhooks`
- `analytics`

### Backend Strengths
- single runtime for local development
- direct and readable logic
- low operational complexity

### Backend Constraints
- `server/index.js` is becoming a monolith
- LowDB is not ideal for high concurrency or complex querying
- business logic, transport logic, and normalization logic are tightly coupled

## Recommended Near-Term Refactor Shape

### Target Node Structure
- `server/index.js`: bootstrapping only
- `server/routes/`: route registration
- `server/services/`: OAuth, sync, admin aggregation, webhooks
- `server/repositories/`: persistence access
- `server/middleware/`: auth, admin, error handling
- `server/lib/`: utilities and normalization helpers

This keeps the current stack but removes the single-file bottleneck.

## Authentication Model
- session-based auth via Passport
- GitHub and Google as external identity providers
- user object stored in session
- admin authorization via token header

This is acceptable for the current phase, but session observability and auth error UX should improve.

## Deployment Model

### Local
- React dev server on port 3000
- Express API on port 4000
- concurrent local development via `npm run dev`

### Production
- React builds into static assets
- Express serves built assets if present
- serverless compatibility through `api/[...path].js`

## FastAPI Path Assessment
The Python stack looks like a separate architecture track, not an active production dependency of the frontend.

If retained, it must be one of:
- a future migration target
- a standalone service with its own docs
- a discarded experiment to remove

Anything in between creates confusion and slows delivery.

## Architecture Principles Going Forward
- one canonical runtime per product phase
- one clear source of truth for auth
- one documented persistence strategy
- docs must match actual execution
- UX quality is an architecture concern, not just a styling concern

## Critical Decisions Needed
1. Keep Node/Express as the main backend for the next milestone, or formalize a migration.
2. Decide whether LowDB remains acceptable for the current scope.
3. Break up the Express monolith before adding major new feature complexity.
4. Treat design-system quality as part of system maintainability.

## Architecture North Star
Whitleos should evolve into a system that feels premium on the surface and disciplined underneath:
- fast UX
- clear boundaries
- maintainable services
- reliable integrations
- easy contributor onboarding
