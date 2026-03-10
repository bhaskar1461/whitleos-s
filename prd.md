# PRD

## Product Name
Whitleos

## Product Vision
Whitleos should feel like the fastest, cleanest, most motivating personal wellness workspace on the web: one place where fitness logging, recovery signals, and personal reflection come together without friction.

This is not meant to be another cluttered health dashboard. It should be opinionated, fast, visually distinct, and useful within the first minute.

## Product Thesis
Most fitness products optimize for either numbers or motivation. Most journaling products optimize for expression but ignore physical progress. Whitleos should combine both:

- structured tracking for action
- reflective journaling for context
- elegant progress feedback for retention
- low-friction workflows for daily use

## Core Promise
In under 60 seconds, a user should be able to:
- sign in
- understand the product
- log meaningful data
- see progress
- feel momentum

## Target Users

### Primary
- solo users who want one place to track meals, steps, workouts, and journal entries
- users who prefer clarity over feature overload
- users who want a habit system with visible progress

### Secondary
- creators, founders, students, and professionals building sustainable personal routines
- admins/operators who need lightweight product visibility

## Experience Principles
- Fast first action: the app should reduce hesitation and make logging feel instant.
- Emotional clarity: every screen should answer "what matters today?"
- Minimal cognitive load: no crowded layouts, dead-end screens, or hidden value.
- Progress as motivation: every action should feed visible momentum.
- Calm confidence: design should feel premium and intentional, not noisy.

## Product Goals
- Build a wellness tracker people actually return to daily.
- Make progress feel tangible even with lightweight data entry.
- Use Google Fit sync to reduce manual tracking effort.
- Make admin insight simple enough for solo operators.
- Establish a design and product direction strong enough to differentiate the site from generic templates.

## Non-Goals
- Social feed or community mechanics in the current phase
- Marketplace features
- Clinical or medical-grade diagnostics
- Complex team-based workflows
- Heavy enterprise analytics

## Core Features

### 1. Identity and Access
- GitHub OAuth login
- Google OAuth login
- persistent authenticated session
- clear user identity state in the UI

### 2. Daily Tracking
- meals
- workouts
- steps
- journal entries
- health snapshots

### 3. Progress Intelligence
- simple summaries across tracked activity
- visible continuity across days
- latest health snapshot summary
- better framing of consistency, not just raw totals

### 4. Connected Health
- Google Fit sync for workouts and steps
- durable connection record for returning users
- explicit feedback on sync status and sync outcomes

### 5. Admin Layer
- protected admin stats endpoint
- protected admin entries endpoint
- usage visibility for growth and debugging

## User Stories
- As a new user, I want to understand the product in seconds so I know why to use it.
- As a returning user, I want to log my daily data quickly so I do not break momentum.
- As a health-conscious user, I want Google Fit sync so I do not have to manually enter everything.
- As a reflective user, I want my journal and physical tracking in one place so my data has context.
- As an operator, I want lightweight admin visibility so I can monitor activity and debug usage.

## Functional Requirements

### Authentication
- The system must expose available auth providers.
- The system must support GitHub and Google sign-in.
- The system must preserve sessions securely.

### Tracking
- The system must let authenticated users create and fetch meals, workouts, steps, and journal entries.
- The system must keep data scoped per user.
- The system must support adding and reading health snapshots.

### Sync
- The system must allow Google-authenticated users to sync workouts and steps from Google Fit.
- The system must handle missing or expired Google credentials gracefully.

### Progress
- The system must surface a useful progress view, not just raw lists.
- The system should emphasize streaks, patterns, summaries, and momentum over dense tables.

### Admin
- The system must protect admin endpoints with `x-admin-token`.
- The system must return usage metrics and stored entries for admin inspection.

## Design Direction
Whitleos should visually compete above the average CRUD wellness app.

The product should aim for:
- premium but calm typography
- motion used with purpose
- strong hierarchy
- rich but controlled color
- dashboards that feel crafted, not generated

The interface should not look like a default bootstrap-style tracker.

## Success Metrics
- first successful log within first session
- repeat use across multiple days
- successful OAuth completion rate
- successful Google Fit sync rate
- admin ability to inspect usage without database access
- contributor ability to set up and understand the project quickly

## Current Reality
The currently working product path is:
- React frontend
- Express backend
- LowDB/KV-style persistence

There is also a separate FastAPI scaffold in the repo, but it is not the primary runtime path today.

## Product Risks
- split backend directions can dilute focus
- stale docs can slow execution
- low-fidelity UI will undercut differentiation
- low-friction logging can fail if forms feel repetitive or slow
- LowDB is suitable for current simplicity but not long-term scale

## Product Mandate
Every future feature should improve at least one of these:
- speed to log
- clarity of progress
- emotional engagement
- reliability of core flows
- distinctiveness of the experience
