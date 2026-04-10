---
phase: 15-api-hardening-and-code-quality-fixes
plan: "04"
subsystem: api-server/routes
tags: [auth-middleware, type-safety, float-arithmetic, code-quality]
dependency_graph:
  requires: [15-03]
  provides: [QUAL-05, QUAL-06, QUAL-07]
  affects: [artifacts/api-server/src/routes/bookings.ts, artifacts/api-server/src/routes/tickets.ts, artifacts/api-server/src/routes/invoices.ts, artifacts/api-server/src/routes/wallet.ts, artifacts/api-server/src/routes/home.ts, artifacts/api-server/src/lib/auth-middleware.ts]
tech_stack:
  added: []
  patterns: [shared-express-middleware, integer-cents-arithmetic, typed-request-extension]
key_files:
  created: []
  modified:
    - artifacts/api-server/src/lib/auth-middleware.ts
    - artifacts/api-server/src/routes/bookings.ts
    - artifacts/api-server/src/routes/tickets.ts
    - artifacts/api-server/src/routes/invoices.ts
    - artifacts/api-server/src/routes/wallet.ts
    - artifacts/api-server/src/routes/home.ts
decisions:
  - "AuthenticatedRequest type exported from auth-middleware.ts so route files can access req.user without any casts"
  - "req.params.id cast to string to satisfy Drizzle eq() overload (pre-existing issue exposed by typed handlers)"
  - "home.ts uses optionalAuth (not requireAuth) — unauthenticated guests get partial response with null user fields"
  - "outstandingBalance in home.ts GET /home-summary intentionally uses float arithmetic (display value, not accumulated sum) — only invoices.ts calculation sites were fixed per plan spec"
metrics:
  duration_minutes: 3
  completed_date: "2026-04-10"
  tasks_completed: 3
  files_modified: 6
---

# Phase 15 Plan 04: Shared Auth Middleware and Float Arithmetic Fix Summary

**One-liner:** Replaced 5 duplicated inline JWT auth helpers with shared requireAuth/optionalAuth middleware from auth-middleware.ts and fixed invoice float arithmetic to use integer cents accumulation.

## What Was Built

**Task 1 — AuthenticatedRequest type export (auth-middleware.ts)**
Added `export type AuthenticatedRequest = Request & { user: typeof usersTable.$inferSelect }` to auth-middleware.ts. This is the single source of truth for the typed req.user pattern used by all downstream route files.

**Task 2 — bookings.ts and tickets.ts migration**
Both files had local `requireAuth(req: any, res: any)` helper functions that called `jwt.verify()` directly without returning a 401 body on failure. These were replaced with:
- Import of `requireAuth` and `AuthenticatedRequest` from auth-middleware.ts
- `requireAuth` passed as Express middleware on every route handler
- Handler signatures typed as `(req: Request, res: Response)`
- `payload.userId` replaced with `(req as AuthenticatedRequest).user.id`

**Task 3 — invoices.ts, wallet.ts, home.ts migration + float arithmetic fix**
- invoices.ts: removed `requireResident` local helper, migrated all 4 handlers to `requireAuth` middleware. Fixed 3 arithmetic accumulation sites to use integer cents (`Math.round(x * 100)` accumulation, `/100` at output).
- wallet.ts: removed local `requireAuth`, imported from auth-middleware.ts. No userId needed (mock data).
- home.ts: removed local `getAuth`, imported `optionalAuth` from auth-middleware.ts. Used `(req as AuthenticatedRequest).user ?? null` to handle unauthenticated guests.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed req.params.id type mismatch in bookings.ts and tickets.ts**
- **Found during:** Task 2 TypeScript compilation
- **Issue:** `req.params.id` typed as `string | string[]` in Express — was hidden by the previous `req: any` types. Drizzle `eq()` expects `string | SQLWrapper`, not `string[]`.
- **Fix:** Added `const id = req.params.id as string` local variable in the /:id handlers
- **Files modified:** bookings.ts (2 handlers), tickets.ts (1 handler)
- **Commit:** 92b7fd9

## Auth Gates

None — all tasks executed without auth gate interruptions.

## Known Stubs

None — no placeholder data was introduced. wallet.ts mock data was pre-existing and unchanged.

## Self-Check: PASSED

All 6 modified files exist on disk. All 3 task commits verified:
- 5195705: feat(15-04): export AuthenticatedRequest type from auth-middleware.ts
- 92b7fd9: feat(15-04): migrate bookings.ts and tickets.ts to shared auth middleware
- eeb5f80: feat(15-04): migrate invoices, wallet, home to shared auth; fix float arithmetic
