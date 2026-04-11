# Phase 23: E2E Tests - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Critical resident workflows are verified end-to-end in a real browser, catching UI and integration regressions. Covers: (1) resident login and home dashboard flow, (2) ticket creation and chat flow, (3) facility booking and cancellation flow.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase.

Key considerations:
- Playwright recommended (modern, fast, good TypeScript support)
- Tests run against the full app (frontend + backend) with seeded DB
- Reuse seed data from Phase 18 for known fixture state
- E2E tests should be in a separate package or top-level e2e/ directory
- Tests need to start dev servers before running (or use Playwright's webServer config)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- artifacts/api-server/src/seed.ts — Seed data with SEED_IDS (known credentials)
- artifacts/scla/src/App.tsx — Route definitions (18 routes)
- Vitest already configured for unit/integration tests

### Established Patterns
- React 19 + Wouter for routing
- JWT auth with Bearer token in localStorage
- Mobile-first UI with bottom nav

### Integration Points
- E2E tests need both frontend and backend running
- Playwright webServer config can start both
- Seed script must run before tests

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
