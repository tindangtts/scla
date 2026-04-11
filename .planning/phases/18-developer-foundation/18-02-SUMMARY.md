---
phase: 18-developer-foundation
plan: "02"
subsystem: api-server/testing
tags: [vitest, unit-tests, password, auth-middleware, scheduler, tdd]
dependency_graph:
  requires: []
  provides: [unit-test-infrastructure, password-tests, auth-middleware-tests, scheduler-tests]
  affects: [artifacts/api-server]
tech_stack:
  added: [vitest ^4.1.4]
  patterns: [vi.mock hoisting pattern, inline mock factory pattern, db chain mocking]
key_files:
  created:
    - artifacts/api-server/vitest.config.ts
    - artifacts/api-server/src/__test-setup.ts
    - artifacts/api-server/src/lib/__tests__/password.test.ts
    - artifacts/api-server/src/lib/__tests__/auth-middleware.test.ts
    - artifacts/api-server/src/lib/__tests__/scheduler.test.ts
  modified:
    - artifacts/api-server/package.json
    - artifacts/api-server/src/lib/scheduler.ts
    - pnpm-lock.yaml
decisions:
  - "Use inline vi.fn() factories in vi.mock() to avoid hoisting ReferenceError with outer variables"
  - "Export checkBillOverdue from scheduler.ts to enable unit testing without module gymnastics"
  - "Install @rollup/rollup-darwin-arm64 as optional dep to fix native binary missing on arm64 macOS"
metrics:
  duration: "~6 minutes"
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_changed: 8
---

# Phase 18 Plan 02: Vitest Unit Tests for Password, Auth Middleware, and Scheduler

Vitest installed and configured in api-server; 23 unit tests across 3 suites covering the three most critical backend building blocks: password hashing with bcrypt+SHA256 migration, JWT auth middleware with requireAuth/requireAdmin, and the bill-overdue scheduler with mocked db/email/push services.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install Vitest and create config | c088dad | package.json, vitest.config.ts, src/__test-setup.ts |
| 2 | Write unit tests for password, auth middleware, and scheduler | e1c6550 | 3 test files, scheduler.ts |

## What Was Built

### Vitest Infrastructure (Task 1)
- **vitest.config.ts**: Node environment, glob `src/**/__tests__/**/*.test.ts`, alias `@workspace/db` to workspace source
- **src/__test-setup.ts**: Sets `SESSION_SECRET` and `DATABASE_URL` env vars before module imports so `jwt.ts` and `@workspace/db` don't throw during test init
- **package.json**: Added `"test": "vitest run"` and `"test:watch": "vitest"` scripts; vitest ^4.1.4 in devDependencies

### Test Suite (Task 2)

**password.test.ts** (8 tests):
- `hashPasswordBcrypt` returns $2b$ prefix, produces unique salted hashes
- `verifyPassword` returns true/false for bcrypt round-trip
- `verifyPassword` returns true/false for legacy SHA256 migration path (scla-salt)
- `isLegacyHash` distinguishes bcrypt vs SHA256 hex strings

**auth-middleware.test.ts** (10 tests):
- `requireAuth` returns 401: no header, non-Bearer header, invalid token, expired token, user-not-in-DB
- `requireAuth` calls next() and attaches user to `req.user` on valid token + existing user
- `requireAdmin` returns null + 401 on no header or invalid signature
- `requireAdmin` returns null on wrong ctx field in token header
- `requireAdmin` returns payload on valid admin token

**scheduler.test.ts** (5 tests):
- `checkBillOverdue` does nothing (no email, no push) when no overdue invoices
- Calls `sendBillOverdueEmail` once per invoice
- Calls `sendPushToUser` once per invoice
- Passes correct userId, invoiceNumber, computed amountDue, dueDate to email service
- Passes correct userId and push payload (title, url) to push service

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed vi.mock hoisting ReferenceError**
- **Found during:** Task 2 — first test run
- **Issue:** `vi.mock` factories are hoisted to top of file by vitest; any outer `const mockX = vi.fn()` referenced inside the factory throws `ReferenceError: Cannot access 'mockX' before initialization`
- **Fix:** Rewrote mock factories to use inline `vi.fn()` calls instead of referencing outer variables. Used `vi.mocked(db.select).mockReturnValue(...)` in `setDbResult()`/`setOverdueInvoices()` helpers inside `beforeEach` for configurable return values.
- **Files modified:** auth-middleware.test.ts, scheduler.test.ts
- **Commit:** e1c6550

**2. [Rule 3 - Blocking] Installed missing @rollup/rollup-darwin-arm64 native binary**
- **Found during:** Task 2 — first test run
- **Issue:** `Cannot find module @rollup/rollup-darwin-arm64` — vitest 4.x uses rollup 4.x which requires native ARM binaries not included by default via pnpm optional deps
- **Fix:** `pnpm add @rollup/rollup-darwin-arm64 --save-optional -w` at root workspace
- **Commit:** included in pnpm-lock update (e815452)

**3. [Rule 2 - Missing Export] Exported checkBillOverdue from scheduler.ts**
- **Found during:** Task 2 design
- **Issue:** `checkBillOverdue` was a private function in scheduler.ts; plan required testing it directly
- **Fix:** Added `export` keyword to `async function checkBillOverdue()` per plan's explicit instruction
- **Files modified:** artifacts/api-server/src/lib/scheduler.ts
- **Commit:** e1c6550

## Known Stubs

None — all tests are fully wired with real logic (password.ts uses real bcrypt/crypto) and correctly mocked dependencies (db, email, push services).

## Self-Check

### Files Exist
- [x] `artifacts/api-server/vitest.config.ts`
- [x] `artifacts/api-server/src/__test-setup.ts`
- [x] `artifacts/api-server/src/lib/__tests__/password.test.ts`
- [x] `artifacts/api-server/src/lib/__tests__/auth-middleware.test.ts`
- [x] `artifacts/api-server/src/lib/__tests__/scheduler.test.ts`

### Commits Exist
- [x] c088dad — chore(18-02): install vitest and create test config
- [x] e815452 — chore(18-02): update pnpm-lock.yaml after vitest install
- [x] e1c6550 — test(18-02): add unit tests for password, auth middleware, and scheduler

### Test Results
- 23/23 tests pass (`pnpm run test` in artifacts/api-server)
- 0 failures

## Self-Check: PASSED
