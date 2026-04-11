# Phase 19: API Integration Tests - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Every critical API route has an automated integration test that catches regressions before merge. Tests run against a test database with seeded fixture data. Covers: auth endpoints (register, login, me, upgrade), bill endpoints (list, detail, summary, pay), ticket endpoints (create, list, detail, messages), and booking endpoints (create, list, cancel, slots).

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key considerations:
- Vitest already configured in Phase 18 (artifacts/api-server/vitest.config.ts)
- Use supertest or direct HTTP testing against Express app
- Tests should use a test database or in-memory approach to avoid polluting dev data
- Seed data from Phase 18 provides known fixture state for assertions
- Test files should follow the __tests__ pattern established in Phase 18

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- artifacts/api-server/vitest.config.ts — Vitest config from Phase 18
- artifacts/api-server/src/seed.ts — Deterministic seed data with SEED_IDS
- artifacts/api-server/src/app.ts — Express app setup
- artifacts/api-server/src/routes/ — 14 route modules
- artifacts/api-server/src/lib/auth-middleware.ts — requireAuth, requireAdmin

### Established Patterns
- Vitest with vi.mock for unit tests (Phase 18)
- Express 5 route handlers with typed request/response
- JWT auth with Bearer token header
- Drizzle ORM for all DB operations

### Integration Points
- Tests call Express routes directly via supertest
- Auth tests need JWT token generation (helper exists in auth-middleware.test.ts)
- Seed data provides deterministic user IDs and entity references

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
