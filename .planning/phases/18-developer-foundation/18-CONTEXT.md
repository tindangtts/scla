# Phase 18: Developer Foundation - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Developers can run the app against realistic data and trust unit-tested building blocks. This phase delivers: (1) idempotent seed scripts that populate demo residents, guests, staff, invoices, tickets, bookings, and announcements; (2) unit tests for auth middleware (JWT verification, role checks), scheduler logic (bill-overdue detection), and password hashing (bcrypt + SHA256 migration).

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key considerations:
- Seed script should live in lib/db or a new seed package within the monorepo
- Use existing Drizzle ORM patterns for seed data insertion
- Test framework choice: Vitest recommended (aligns with Vite ecosystem already used)
- Unit tests should be colocated with or adjacent to the modules they test

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- lib/db/src/schema/ — All 15 Drizzle table definitions
- artifacts/api-server/src/lib/auth-middleware.ts — requireAuth, requireAdmin, verifyAdmin
- artifacts/api-server/src/lib/scheduler.ts — bill-overdue cron job
- artifacts/api-server/src/lib/password.ts — bcrypt hashing + SHA256 migration

### Established Patterns
- Drizzle ORM for all DB operations
- PNPM workspace structure
- TypeScript strict mode
- Express 5 middleware chain

### Integration Points
- Seed script connects to same DATABASE_URL as app
- Tests may need test database or transaction rollback strategy

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
