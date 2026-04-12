---
phase: 19-api-integration-tests
plan: "02"
subsystem: testing
tags: [vitest, supertest, integration-tests, tickets, bookings, facilities]

# Dependency graph
requires:
  - phase: 19-01
    provides: Shared test helpers (helpers.ts), auth and invoice integration tests, vi.mock patterns established
provides:
  - Ticket endpoint integration tests (20 tests covering create, list, detail, messages read/write)
  - Booking endpoint integration tests (21 tests covering create, list, detail, cancel, facility list, slots)
  - Full API test coverage for TEST-03 and TEST-04 requirements
affects: [phase-20-audit-logging, phase-22-cicd-pipeline, phase-23-e2e-tests]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Thenable from() mock: db.select().from() returns a Promise with .where() attached for facility routes without auth"
    - "Call-count based select mock: 1st call returns auth user, subsequent calls return domain data"
    - "Per-test select override for ownership/403 testing in ticket messages"

key-files:
  created:
    - artifacts/api-server/src/__tests__/tickets.integration.test.ts
    - artifacts/api-server/src/__tests__/bookings.integration.test.ts
  modified: []

key-decisions:
  - "Facility route mocks use thenable from() (Promise + .where()) since GET /api/facilities awaits db.select().from() directly without .where()"
  - "Per-test inline select mock implementation for ticket message 403 ownership tests (not global setupMocks)"

patterns-established:
  - "setupFacilitiesMock: from() returns a thenable Promise with .where() chained — handles both bare db.select().from(t) and db.select().from(t).where().limit() query shapes"
  - "Per-describe setupMocks resets call counters for clean test isolation"

requirements-completed: [TEST-03, TEST-04]

# Metrics
duration: 15min
completed: 2026-04-11
---

# Phase 19 Plan 02: Ticket and Booking Integration Tests Summary

**20 ticket tests + 21 booking/facility tests covering full CRUD, auth, ownership, SA-XXXX/BK-XXXX number patterns, and slot generation across 95 total passing tests**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-11T07:00:00Z
- **Completed:** 2026-04-11T07:03:17Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Wrote 20 ticket integration tests covering POST /api/tickets (creation with SA-XXXX), GET list, GET detail, GET messages (with 403 ownership check), POST messages
- Wrote 21 booking/facility integration tests covering GET /api/bookings, POST (BK-XXXX), GET detail, POST cancel (status=cancelled), GET /api/facilities, GET slots
- All 95 tests across 7 test files pass together — zero conflicts with Phase 18 unit tests or Phase 19 Plan 01 tests

## Task Commits

1. **Task 1: Ticket endpoint integration tests** - `2e5e42a` (feat)
2. **Task 2: Booking and facility endpoint integration tests** - `69a23ec` (feat)

## Files Created/Modified
- `artifacts/api-server/src/__tests__/tickets.integration.test.ts` - 20 integration tests for all ticket endpoints
- `artifacts/api-server/src/__tests__/bookings.integration.test.ts` - 21 integration tests for booking + facility endpoints

## Decisions Made
- Facility routes use a `setupFacilitiesMock()` helper that returns a thenable `from()` result (Promise with `.where()` attached), because `GET /api/facilities` awaits `db.select().from(facilitiesTable)` directly without calling `.where()`, while `GET /api/facilities/:id/slots` uses `.where().limit(1)`. A single mock pattern handles both shapes.
- Ticket message ownership tests (403) use inline per-test select mock implementations with a call counter, overriding the global `setupMocks` to return a ticket with `userId !== user.id`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed facility mock returning 500 due to wrong Promise shape**
- **Found during:** Task 2 (GET /api/facilities tests)
- **Issue:** Initial `setupMocks` helper set up `from()` to return an object with `.where()`, but the facilities list route awaits `db.select().from(facilitiesTable)` as a Promise directly — no `.where()` call — causing unhandled rejection and 500 response
- **Fix:** Created dedicated `setupFacilitiesMock()` that returns `from()` as a thenable (Promise with `.where()` attached), compatible with both the bare-await and chained-where query shapes
- **Files modified:** artifacts/api-server/src/__tests__/bookings.integration.test.ts
- **Verification:** Both GET /api/facilities tests and GET /api/facilities/:id/slots tests pass
- **Committed in:** 69a23ec (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in mock shape)
**Impact on plan:** Mock fix was necessary for correct test behavior. No scope creep.

## Issues Encountered
- Facility route is the only public (no-auth) route, making it the only case where `db.select().from()` is awaited directly without `.where()`. The thenable mock pattern resolves this cleanly for both bare and chained usage.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 19 complete: all 4 requirements (TEST-01 through TEST-04) covered by 95 passing tests
- Phase 20 (Audit Logging & Wallet Transactions) can proceed — API integration test foundation is solid
- CI/CD pipeline (Phase 22) can include `pnpm run test` in api-server for automated regression testing

---
*Phase: 19-api-integration-tests*
*Completed: 2026-04-11*
