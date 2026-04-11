---
phase: 19-api-integration-tests
plan: "01"
subsystem: testing
tags: [supertest, vitest, integration-tests, auth, invoices, jwt, mock]

requires:
  - phase: 18-developer-foundation
    provides: vitest config, test setup, unit test patterns (inline vi.fn() in vi.mock)

provides:
  - supertest installed in api-server devDependencies
  - Shared integration test helpers (createTestToken, createAdminToken, authHeader, SEED_IDS)
  - Auth endpoint integration tests (register, login, /me, upgrade) — 17 tests
  - Invoice endpoint integration tests (list, summary, detail, pay) — 14 tests

affects:
  - 22-ci-cd-pipeline (these test suites run in CI)
  - 23-e2e-tests (integration test patterns established here are the reference)

tech-stack:
  added:
    - supertest@7.2.2
    - "@types/supertest@7.2.0"
  patterns:
    - vi.mock with inline vi.fn() to avoid hoisting ReferenceError
    - Thenable mock chain — Promise.resolve(result) with .limit/.orderBy attached for mixed query shapes
    - Sequential db.select call counting to distinguish auth middleware vs route queries
    - createTestToken + authHeader helper pattern for all authenticated endpoint tests

key-files:
  created:
    - artifacts/api-server/src/__tests__/helpers.ts
    - artifacts/api-server/src/__tests__/auth.integration.test.ts
    - artifacts/api-server/src/__tests__/invoices.integration.test.ts
  modified:
    - artifacts/api-server/package.json (added supertest devDeps)
    - pnpm-lock.yaml

key-decisions:
  - "Use inline vi.fn() in vi.mock factories (not outer variables) to avoid hoisting ReferenceError"
  - "Thenable mock chain (Promise.resolve with extra methods) handles mixed .where()/.limit() and .where()/.orderBy() Drizzle query shapes"
  - "Sequential call counting on db.select distinguishes auth middleware lookup from route-level invoice queries"
  - "Token-based auth approach for integration tests (not mocking auth middleware) — more realistic test coverage"

patterns-established:
  - "Integration test mocking: vi.mock('@workspace/db') with inline factories, call-count tracking for multi-query routes"
  - "Thenable db mock: return Promise.resolve(result) with .limit() and .orderBy() attached for flexible chain resolution"
  - "Rate limiter bypass: vi.mock('../lib/rate-limiter.js') with passthrough next() for all integration tests"
  - "Password mock: vi.mock('../lib/password.js') for fast tests (no real bcrypt)"

requirements-completed: [TEST-01, TEST-02]

duration: 12min
completed: 2026-04-11
---

# Phase 19 Plan 01: API Integration Tests Summary

**supertest integration test suite covering auth (17 tests) and invoice (14 tests) endpoints with vi.mock db isolation — all 54 tests passing**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-11T06:45:00Z
- **Completed:** 2026-04-11T06:57:51Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Installed supertest and @types/supertest in api-server devDependencies
- Created shared test helpers with createTestToken, createAdminToken, authHeader, SEED_IDS exports
- Wrote 17 auth integration tests covering register (validation + email conflict + success + shape), login (validation + not-found + wrong-password + success), /me (no-auth + success), and upgrade (no-auth + validation + success)
- Wrote 14 invoice integration tests covering list (auth + success + number type check), summary (auth + shape + totalOutstanding calculation), detail (auth + 404 + success), pay (auth + missing fields + wavepay + kbzpay)
- Full test suite: 54 tests passing (23 unit + 31 integration) with no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Install supertest and create shared integration test helpers** - `8ad39b6` (feat)
2. **Task 2: Write auth endpoint integration tests (TEST-01)** - `2eae29c` (feat)
3. **Task 3: Write invoice/bill endpoint integration tests (TEST-02)** - `6669c5f` (feat)

## Files Created/Modified

- `artifacts/api-server/src/__tests__/helpers.ts` - Shared test utilities: supertest app wrapper, createTestToken, createAdminToken, authHeader, SEED_IDS
- `artifacts/api-server/src/__tests__/auth.integration.test.ts` - 17 auth endpoint integration tests
- `artifacts/api-server/src/__tests__/invoices.integration.test.ts` - 14 invoice endpoint integration tests
- `artifacts/api-server/package.json` - Added supertest + @types/supertest devDependencies
- `pnpm-lock.yaml` - Updated lockfile

## Decisions Made

- Used token-based auth (not mocking requireAuth middleware) for more realistic integration test coverage
- Thenable mock chain pattern: `Promise.resolve(result)` with `.limit()` and `.orderBy()` attached — handles Drizzle's mixed query shapes where some routes await `.where()` directly and others chain `.limit()` or `.orderBy()`
- Sequential call counting to distinguish auth middleware db.select (call 1 = user lookup) from route-level db.select (call 2+ = invoice queries)
- Mocked rate-limiter, password, and @workspace/db in all integration test files for isolation and speed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed thenable mock chain for mixed Drizzle query shapes**
- **Found during:** Task 3 (invoice integration tests)
- **Issue:** Invoice routes use `.where()` both as a final step (summary, pay) and as intermediate (followed by `.orderBy()` or `.limit()`). Initial mock only handled `.limit()`, causing `invoices.filter is not a function` when the route awaited `.where()` directly.
- **Fix:** Return `Promise.resolve(result)` from `.where()` with `.limit()` and `.orderBy()` attached as properties — allows both await-directly and chain-extension patterns.
- **Files modified:** `artifacts/api-server/src/__tests__/invoices.integration.test.ts`
- **Verification:** All 14 invoice tests pass, including summary (direct `.where()` await) and list (`.where().orderBy()` chain)
- **Committed in:** `6669c5f` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Required fix for invoice route query pattern compatibility. No scope creep.

## Issues Encountered

- Drizzle ORM query chain mock required thenable pattern to support both direct `await` and chained `.orderBy()` / `.limit()` in the same mock implementation. Resolved with `Promise.resolve(result)` decorated with chain methods.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Integration test infrastructure is established — other phases can add test files in `src/__tests__/`
- Phase 22 (CI/CD) can wire `pnpm run test` to run all 54+ tests on push
- Pattern reference available in auth.integration.test.ts and invoices.integration.test.ts for future test suites (tickets, bookings, etc.)

---
*Phase: 19-api-integration-tests*
*Completed: 2026-04-11*
