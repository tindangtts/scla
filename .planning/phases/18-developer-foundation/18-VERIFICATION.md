---
phase: 18-developer-foundation
verified: 2026-04-11T13:20:00Z
status: gaps_found
score: 6/7 must-haves verified
re_verification: false
gaps:
  - truth: "TypeScript compilation succeeds for test files"
    status: partial
    reason: "auth-middleware.test.ts and scheduler.test.ts introduce 2 TS2352 type casting errors in vi.mock return types — mock objects cast to Drizzle/Express types that don't overlap sufficiently. Tests pass at runtime but typecheck fails for newly created test files."
    artifacts:
      - path: "artifacts/api-server/src/lib/__tests__/auth-middleware.test.ts"
        issue: "TS2352 on line 42 (mockRes cast) and line 78 (db.select mock cast to PgSelectBuilder)"
      - path: "artifacts/api-server/src/lib/__tests__/scheduler.test.ts"
        issue: "TS2352 on line 49 (db.select mock cast to PgSelectBuilder)"
    missing:
      - "Cast mock objects through `unknown` first: `{ from: ... } as unknown as ReturnType<typeof db.select>` and `res as unknown as Partial<Response> & {...}`"
human_verification:
  - test: "Run pnpm run seed against a real database"
    expected: "All 13 seed functions complete without error; re-running a second time also completes without error or duplicate key violations"
    why_human: "Requires a live PostgreSQL connection; cannot verify idempotency against a real DB in CI grep checks alone"
---

# Phase 18: Developer Foundation Verification Report

**Phase Goal:** Developers can run the app against realistic data and trust unit-tested building blocks
**Verified:** 2026-04-11T13:20:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Running `pnpm run seed` once creates demo accounts, invoices, tickets, bookings, and announcements | ? UNCERTAIN | seed.ts fully implemented with all entity types; requires live DB to confirm end-to-end execution |
| 2 | Running `pnpm run seed` a second time completes without errors or duplicates | ? UNCERTAIN | onConflictDoNothing pattern verified in code (12 occurrences); count-guards on remaining tables; runtime re-run requires live DB |
| 3 | A developer can reset the database by re-running the seed command | ? UNCERTAIN | Script is idempotent by design; same runtime dependency |
| 4 | Unit tests for JWT verification pass on valid tokens and fail on bad/expired tokens | ✓ VERIFIED | auth-middleware.test.ts: 10 tests covering no header, invalid token, expired token, user-not-in-DB, valid token — all pass |
| 5 | Unit tests for role-check middleware reject insufficient roles | ✓ VERIFIED | requireAdmin tested: no header → null+401, invalid sig → null, wrong ctx → null, valid → payload |
| 6 | Unit tests for bill-overdue scheduler select correct invoices and trigger notifications | ✓ VERIFIED | scheduler.test.ts: 5 tests — empty case (no-op), per-invoice email call, per-invoice push call, correct args to both services — all pass |
| 7 | Unit tests for password hashing confirm bcrypt round-trip and SHA256 migration path | ✓ VERIFIED | password.test.ts: 8 tests — $2b$ prefix, unique salts, bcrypt verify true/false, SHA256 legacy true/false, isLegacyHash — all pass |

**Score:** 4 truths VERIFIED, 3 UNCERTAIN (live DB required), 0 FAILED

Note: The 3 seed truths are marked UNCERTAIN rather than FAILED because code verification confirms correct idempotent patterns (12 `onConflictDoNothing` calls, SEED_IDS deterministic UUIDs, count guards on reference tables). A human run against a real DB is the only remaining confirmation needed.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `artifacts/api-server/src/seed.ts` | Idempotent seed script with upsert logic | ✓ VERIFIED | 12 onConflictDoNothing calls, 21 SEED_IDS references, bookingsTable with BK-0001/BK-0002/BK-0003, no early-return bail-out |
| `artifacts/api-server/vitest.config.ts` | Vitest configuration for api-server | ✓ VERIFIED | defineConfig present, node environment, correct glob, @workspace/db alias |
| `artifacts/api-server/src/lib/__tests__/password.test.ts` | Password hashing unit tests | ✓ VERIFIED | Imports hashPasswordBcrypt, 8 test cases |
| `artifacts/api-server/src/lib/__tests__/auth-middleware.test.ts` | Auth middleware unit tests | ✓ VERIFIED | Imports requireAuth/requireAdmin, 10 test cases |
| `artifacts/api-server/src/lib/__tests__/scheduler.test.ts` | Scheduler unit tests | ✓ VERIFIED | Imports checkBillOverdue, 5 test cases, vi.mock for db/email/push |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `seed.ts` | `@workspace/db` | Drizzle ORM insert with onConflictDoNothing | ✓ WIRED | `import { usersTable, bookingsTable, ... } from "@workspace/db"` + `db.insert(...).onConflictDoNothing()` confirmed |
| `password.test.ts` | `src/lib/password.ts` | import { hashPasswordBcrypt, verifyPassword, isLegacyHash } | ✓ WIRED | Line 3: `import { hashPasswordBcrypt, verifyPassword, isLegacyHash } from "../password.js"` |
| `auth-middleware.test.ts` | `src/lib/jwt.ts` | import * as jwt | ⚠️ PARTIAL | Test does NOT import jwt.ts directly; instead tests requireAuth/requireAdmin from auth-middleware.ts which itself imports jwt.ts — JWT behavior is exercised indirectly. Tests pass (10/10). |
| `scheduler.test.ts` | `src/lib/scheduler.ts` | vi.mock for db and notification services | ✓ WIRED | Line 40: `import { checkBillOverdue } from "../scheduler.js"` + vi.mock for @workspace/db, email-service, push-service |

**Note on auth-middleware key link:** The PLAN specified `import * as jwt` in the test file. The implementation tests JWT behavior via requireAuth/requireAdmin (which internally use jwt.ts). This is functionally equivalent and arguably better isolation — the test verifies the middleware contract, not jwt.ts internals. No gap from a goal perspective.

### Data-Flow Trace (Level 4)

Not applicable — this phase produces seed scripts and test infrastructure, not components that render dynamic data from a data source.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 23 unit tests pass | `cd artifacts/api-server && pnpm run test` | `23 passed (23)`, 0 failures, 3 test files | ✓ PASS |
| vitest installed and configured | `grep '"vitest"' artifacts/api-server/package.json` | `"vitest": "^4.1.4"` in devDependencies | ✓ PASS |
| Test scripts exist | `grep '"test"' artifacts/api-server/package.json` | `"test": "vitest run"` and `"test:watch": "vitest"` | ✓ PASS |
| checkBillOverdue exported | `grep "export async function checkBillOverdue" artifacts/api-server/src/lib/scheduler.ts` | Line 10 match | ✓ PASS |
| onConflictDoNothing count | `grep -c "onConflictDoNothing" artifacts/api-server/src/seed.ts` | 12 (>= 5 required) | ✓ PASS |
| TypeScript compilation | `cd artifacts/api-server && pnpm run typecheck` | 2 TS2352 errors in test files + 1 pre-existing health.ts error | ✗ FAIL |
| pnpm run seed (live DB) | Cannot test without live PostgreSQL | N/A | ? SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DX-01 | 18-01-PLAN.md | Seed script creates demo residents, guests, and staff accounts | ✓ SATISFIED | seed.ts: 4 users (1 guest, 1 resident, 2 guests) + 3 staff with fixed SEED_IDS |
| DX-02 | 18-01-PLAN.md | Seed script populates invoices, tickets, bookings, and announcements | ✓ SATISFIED | seed.ts: seedInvoices, seedTickets, seedBookings (BK-0001/2/3), seedAnnouncements all present |
| DX-03 | 18-01-PLAN.md | Seed script is idempotent (safe to re-run) | ✓ SATISFIED | onConflictDoNothing for constrained tables, count-guards for reference tables, deterministic SEED_IDS |
| TEST-05 | 18-02-PLAN.md | Unit tests cover auth middleware (JWT verification, role checks) | ✓ SATISFIED | auth-middleware.test.ts: requireAuth (6 cases) + requireAdmin (4 cases), all pass |
| TEST-06 | 18-02-PLAN.md | Unit tests cover scheduler logic (bill-overdue detection, notification triggers) | ✓ SATISFIED | scheduler.test.ts: 5 tests covering empty invoices, email trigger, push trigger, correct args |
| TEST-07 | 18-02-PLAN.md | Unit tests cover password hashing (bcrypt, SHA256 migration path) | ✓ SATISFIED | password.test.ts: 8 tests covering hashPasswordBcrypt, verifyPassword (bcrypt+SHA256), isLegacyHash |

**Note on traceability table:** REQUIREMENTS.md traceability table (lines 222-223) still shows Phase 18 status as "Pending" while the individual requirement checkboxes (`[x]`) correctly show complete. This is a documentation inconsistency — no functional impact, but should be updated to "Complete" for accuracy.

**Orphaned requirements:** None — all 6 requirement IDs declared in plans (DX-01, DX-02, DX-03, TEST-05, TEST-06, TEST-07) appear in REQUIREMENTS.md and are accounted for.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/__tests__/auth-middleware.test.ts` | 42, 78 | TS2352 type cast (mock to Express/Drizzle type without `as unknown` first) | ⚠️ Warning | Tests pass at runtime; typecheck fails for these files. Fix: add `as unknown as TargetType` double-cast. |
| `src/lib/__tests__/scheduler.test.ts` | 49 | TS2352 type cast (db.select mock to PgSelectBuilder) | ⚠️ Warning | Same — runtime tests pass, but typecheck fails for this file. |

No blockers. No placeholder/TODO comments. No empty implementations.

### Human Verification Required

#### 1. Seed Script — Live Database Run

**Test:** In an environment with a live PostgreSQL database and DATABASE_URL configured, run `cd artifacts/api-server && pnpm run seed` twice.
**Expected:** First run: all 13 seed functions complete with console output for each section, no errors. Second run: same output, no duplicate key violation errors or crashes.
**Why human:** Requires a live PostgreSQL connection — the onConflictDoNothing behavior, count guards, and SEED_IDS determinism can only be confirmed against a real Postgres instance.

### Gaps Summary

**One functional gap (warning-severity):** The test files introduced in 18-02 contain 2 TypeScript type casting errors (TS2352) in the mock setup for `auth-middleware.test.ts` and `scheduler.test.ts`. These are `as` casts where Drizzle's `PgSelectBuilder` and Express's `Response` types don't overlap with the mock objects. The tests pass at runtime (23/23), but `pnpm run typecheck` fails for these files. The plan acceptance criterion "TypeScript compilation succeeds" is not fully met.

**Fix is straightforward:** change `{ ... } as ReturnType<typeof db.select>` to `{ ... } as unknown as ReturnType<typeof db.select>` (and similarly for the Response mock). This is a 2-line change across 2 files.

**Three truths are UNCERTAIN** (not FAILED): seed.ts is correctly implemented with idempotent patterns, but live-database confirmation requires human execution.

---

_Verified: 2026-04-11T13:20:00Z_
_Verifier: Claude (gsd-verifier)_
