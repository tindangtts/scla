# Phase 31: Testing & CI - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

The Next.js app has equivalent test coverage to v2.1 — unit tests, API route integration tests, and Playwright E2E tests — all running in a GitHub Actions CI pipeline on every push.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key considerations:
- Unit tests: Vitest (already in ecosystem) for auth middleware, notification helpers, query functions
- Integration tests: Test Next.js API routes using supertest or direct route handler testing
- E2E tests: Playwright against Next.js dev server
- CI: GitHub Actions workflow — lint (prettier), typecheck (tsc), unit tests (vitest), integration tests
- Seed script must work in test environment

</decisions>

<code_context>
## Existing Code Insights

### What to Test
- `artifacts/web/src/lib/auth.ts` — getCurrentUser, requireAuth, requireAdmin
- `artifacts/web/src/lib/notifications.ts` — notifyBillOverdue, notifyTicketUpdate, notifyNewMessage
- `artifacts/web/src/lib/push.ts` — sendPushNotification
- `artifacts/web/src/app/api/` — API routes (auth, tickets, messages, push, notifications, cron)
- E2E flows: login, create ticket, book facility

### Existing Test Infrastructure
- Root package.json has `test:ci` script
- Vitest available in ecosystem
- Playwright available (was used in v2.1 e2e/)

### Integration Points
- `.github/workflows/` — CI pipeline
- `package.json` — test scripts
- `vitest.config.ts` — test configuration

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase.

</specifics>

<deferred>
## Deferred Ideas

None — final phase.

</deferred>
