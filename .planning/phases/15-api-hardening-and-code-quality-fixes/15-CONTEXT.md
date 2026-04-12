# Phase 15: API Hardening & Code Quality - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Fix critical auth gaps, race conditions, missing error handling, and type safety issues across the API layer. This is a pure code quality / security hardening phase with no new user-facing features. All changes are backend-only.

Issues sourced from deep codebase audit:
1. Missing auth on upgrade-request endpoints (GET list, POST approve, POST reject)
2. Race conditions in booking/ticket number generation (count-then-increment pattern)
3. Missing DB transactions on multi-step upgrade operations
4. No global Express error handler
5. Auth middleware defined but never used — every route re-implements inline JWT checks
6. Float arithmetic in invoice calculations (should use integer cents)
7. `any` types throughout route handlers
8. No password validation on admin staff creation

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key constraints from prior phases:
- Phase 11 introduced `password.ts` module with bcrypt — reuse pattern for shared utilities
- Phase 11 introduced `rate-limiter.ts` — same middleware pattern should be used
- `auth-middleware.ts` already exists with `requireAuth()` and `optionalAuth()` exports — USE these instead of creating new ones
- Express 5 + TypeScript + Drizzle ORM are the stack conventions
- User prefers PostgreSQL (Supabase) — don't introduce incompatible patterns

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Auth & Middleware
- `artifacts/api-server/src/lib/auth-middleware.ts` — Existing middleware (requireAuth, optionalAuth) that should be used everywhere
- `artifacts/api-server/src/routes/auth.ts` — User auth routes with missing auth on upgrade endpoints (lines 158-241)
- `artifacts/api-server/src/routes/admin.ts` — Admin routes with inline auth pattern to refactor

### Data Integrity
- `artifacts/api-server/src/routes/bookings.ts` — Race condition in booking number generation (lines 63-64)
- `artifacts/api-server/src/routes/tickets.ts` — Race condition in ticket number generation (lines 70-71)
- `artifacts/api-server/src/routes/invoices.ts` — Float arithmetic in amount calculations (lines 43-44, 50, 107-108)

### App Configuration
- `artifacts/api-server/src/app.ts` — Express app setup, needs global error handler
- `artifacts/api-server/src/lib/password.ts` — Shared password module (Phase 11 pattern to follow)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `auth-middleware.ts` — has `requireAuth()` and `optionalAuth()` ready to use
- `password.ts` — shared module pattern from Phase 11 (good template for new utilities)
- `rate-limiter.ts` — middleware pattern from Phase 11

### Established Patterns
- Express Router per domain (auth.ts, admin.ts, bookings.ts, etc.)
- Drizzle ORM for all database operations
- JSON responses with `{ error, message }` shape for errors
- Inline JWT verification (the anti-pattern being fixed)

### Integration Points
- `app.ts` — global error handler goes here (after all routes)
- Every route file — auth middleware replacement
- `lib/db` — transaction support via Drizzle

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 15-api-hardening-and-code-quality-fixes*
*Context gathered: 2026-04-10*
