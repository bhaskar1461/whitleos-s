# Plan

## Objective
Turn Whitleos from a functional tracker into a high-quality, high-clarity wellness product with stronger product identity, cleaner architecture, and faster execution.

## Strategic Outcome
The site should outperform generic wellness trackers on two axes:
- efficiency: users can act faster with less friction
- creativity: the product feels distinct, memorable, and premium

## Phase 1: Establish Product Truth
Goal: eliminate ambiguity so execution stops splitting across stale assumptions.

### Deliverables
- align `README.md`, `DEPLOYMENT.md`, and setup scripts with the active Node/React stack
- explicitly mark `app/` as experimental, migration-target, or removable
- define a single canonical local run path

### Success Criteria
- a new contributor can set up the product without confusion
- no primary doc describes Firebase as the active implementation if it is not
- docs clearly name the current backend path

## Phase 2: Raise UX Quality
Goal: make the interface feel crafted instead of merely functional.

### Deliverables
- redesign core pages with stronger hierarchy and more intentional visual language
- improve landing page, progress page, and admin page first
- reduce visual noise and improve first-session clarity
- strengthen feedback states for auth, loading, sync, and empty states

### Success Criteria
- first-time users understand what the product does immediately
- daily logging feels fast and low-friction
- the product no longer looks like a generic starter app

## Phase 3: Improve Core Product Loops
Goal: make repeat use more likely.

### Deliverables
- tighten logging flows for meals, workouts, steps, and journal
- improve progress summaries to emphasize momentum and consistency
- expose sync status and recent activity more clearly
- reduce dead space and disconnected pages

### Success Criteria
- users can log data in under a minute
- users can understand recent progress at a glance
- synced data feels integrated rather than bolted on

## Phase 4: Refactor for Sustainable Speed
Goal: preserve momentum by reducing architectural drag.

### Deliverables
- split `server/index.js` into routes, services, and shared utilities
- centralize validation and normalization logic
- create clearer frontend shared patterns for repeated UI behaviors
- document the resulting folder strategy

### Success Criteria
- new features no longer require editing one oversized backend file
- repeated logic is reduced
- future contributors can find responsibility boundaries quickly

## Phase 5: Add Product Safety Nets
Goal: reduce regression risk while shipping faster.

### Deliverables
- add API smoke tests for auth providers, protected routes, admin auth, and webhook verification
- add basic happy-path UI verification where practical
- define a minimal release checklist

### Success Criteria
- critical flows can be verified before deployment
- regressions in auth or admin access are caught earlier

## Phase 6: Launch Rust Analytics Sidecar
Goal: add higher-throughput analytics and ETL capacity without destabilizing the Node runtime.

### Deliverables
- add a standalone Rust microservice for analytics and ETL
- connect it to the same MongoDB/Cosmos state document used by the Express app
- expose a production-ready `/analytics` endpoint for aggregated usage data
- add an Express integration layer with timeout, auth header, and local fallback
- persist periodic analytics snapshots into a separate collection for ETL workloads

### Success Criteria
- the Node backend remains the primary API and auth/session owner
- heavy analytics work can move off the main Express process
- analytics failures degrade gracefully to a Node fallback instead of breaking admin flows
- the Rust service can be deployed independently and scaled separately

## Phase 7: Decide the Backend Future
Goal: remove strategic drift.

### Decision Paths

#### Option A: Stay on Node/Express
- treat FastAPI as archived or experimental
- improve persistence strategy only when needed
- focus on product and UX acceleration

#### Option B: Migrate to FastAPI
- define migration scope and API parity
- map frontend dependencies endpoint by endpoint
- plan data migration off LowDB
- do not run both stacks ambiguously

### Success Criteria
- the team can answer "what is the backend?" in one sentence

## Immediate High-Leverage Tasks
1. refresh the core docs to match the active system
2. modernize `setup.bat`
3. redesign the landing and progress experiences
4. refactor backend hotspots out of `server/index.js`
5. ship the Rust analytics sidecar and ETL path
6. add basic backend smoke coverage

## Delivery Rules
- each iteration must improve both usability and code clarity where possible
- avoid speculative rewrites without a milestone payoff
- prefer small shippable slices over long refactor branches
- measure progress by user-facing improvements, not file churn

## Risks
- trying to improve visuals without fixing structure will create fragile UI
- trying to overengineer the backend too early will slow delivery
- adding analytics load to the Node monolith would increase latency on auth and CRUD paths
- leaving both backend directions alive without a decision will keep creating waste

## Definition of Winning
Whitleos wins when:
- setup is simple
- daily use feels effortless
- the visual identity feels premium
- the codebase supports iteration instead of resisting it
- contributors can tell what matters immediately
