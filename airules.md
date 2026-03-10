# AI Rules

## Mission
Any AI agent working in this repo must act like a high-leverage product engineer, not a code generator. The goal is to move Whitleos toward a product that is both operationally clean and visually distinguished.

## Primary Source of Truth
- The active runtime is the React + Express application.
- `package.json` defines the primary dev workflow.
- `server/index.js` is the active backend entry point.
- `src/` is the active frontend.
- `app/` is secondary unless the task explicitly targets the Python stack.

## Product Standard
Do not ship average work.

Every meaningful change should improve at least one of:
- speed
- clarity
- reliability
- maintainability
- product distinctiveness

## Execution Rules
- Prefer shipping a working improvement over describing one.
- Prefer reading the actual code before making assumptions.
- Prefer targeted structural improvements over cosmetic churn.
- Prefer system coherence over adding more tools, layers, or frameworks.

## Creativity Rules
- Do not default to generic SaaS UI patterns.
- Do not produce bland dashboards, weak hierarchy, or interchangeable layouts.
- Treat the product as a premium wellness experience, not a CRUD demo.
- Use motion, typography, spacing, and information hierarchy intentionally when touching frontend UX.

## Architecture Rules
- Do not introduce a third backend direction.
- Do not treat the FastAPI scaffold as canonical unless the task explicitly migrates the system.
- Keep the Node/Express flow stable unless there is a deliberate architecture task.
- If a change increases complexity, it must also improve clarity or capability.

## Backend Rules
- Preserve session-based auth semantics unless explicitly changing auth architecture.
- Preserve `x-admin-token` protection on admin endpoints.
- Preserve user scoping by `uid`.
- Preserve webhook signature validation.
- Avoid persistence changes that silently break LowDB behavior.

## Frontend Rules
- Keep routes intentional and discoverable.
- Prefer fewer, stronger UI elements over busy layouts.
- Preserve working flows while improving design quality.
- Create reusable patterns when repetition starts to grow.

## Documentation Rules
- Documentation must describe what actually runs.
- When the repo contains stale or conflicting documentation, fix it.
- Call out ambiguity directly instead of silently papering over it.
- If two architectural paths exist, state which one is active.

## Quality Rules
- Before editing, inspect the relevant code path.
- After editing, verify the change if possible.
- If verification is not possible, say so clearly.
- Avoid speculative claims about features that are not implemented.

## Decision Rules
- If a task is vague, choose the most valuable interpretation that moves the project forward without creating risk.
- If a request conflicts with the repo's current architecture, choose coherence first and explain the tradeoff.
- If a better approach exists, take it and make the reasoning obvious in the result.

## Anti-Patterns
- generic boilerplate docs
- fake architecture diagrams in prose
- overengineering simple flows
- adding libraries to avoid thinking
- leaving stale comments or docs in place
- describing aspirational behavior as if it already exists

## Priority Order
1. working product flows
2. clarity of architecture
3. quality of user experience
4. contributor maintainability
5. future scalability

## North Star
The repo should gradually become the kind of codebase where:
- the product feels deliberate
- the UX feels premium
- the code paths are understandable
- documentation is trustworthy
- contributors can move fast without making the system messier
