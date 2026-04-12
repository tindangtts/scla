---
phase: 17-scheduler-and-db-migration-bootstrap
verified: 2026-04-10T18:45:00Z
status: passed
score: 8/8 must-haves verified
re_verification: false
---

# Phase 17: Scheduler and DB Migration Bootstrap Verification Report

**Phase Goal:** Add a bill-overdue email/push scheduler and auto-apply DB migrations at server startup
**Verified:** 2026-04-10T18:45:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | Server starts without error on a fresh database that has no sequences | ✓ VERIFIED | `applyMigrations()` is called before `app.listen`; process.exit(1) on failure |
| 2  | booking_number_seq and ticket_number_seq exist in PostgreSQL after server startup | ✓ VERIFIED | `0001_add_number_sequences.sql` contains both `CREATE SEQUENCE IF NOT EXISTS` statements; executed by `pool.query` in migration-runner.ts |
| 3  | CREATE SEQUENCE IF NOT EXISTS is idempotent — restart does not fail if sequences already exist | ✓ VERIFIED | SQL uses `IF NOT EXISTS` on both sequences (lines 1 and 4 of the SQL file) |
| 4  | sendBillOverdueEmail is called for every invoice where dueDate < today AND status is unpaid or partially_paid | ✓ VERIFIED | Drizzle query uses `and(lt(invoicesTable.dueDate, today), or(eq(..., "unpaid"), eq(..., "partially_paid")))` — matches all qualifying invoices |
| 5  | The check runs once at server startup and again every 24 hours | ✓ VERIFIED | `checkBillOverdue()` called immediately in `startScheduler()`, plus `setInterval(checkBillOverdue, 24*60*60*1000)` |
| 6  | sendPushToUser is called alongside sendBillOverdueEmail for each overdue invoice owner | ✓ VERIFIED | Both called inside `Promise.allSettled([sendBillOverdueEmail(...), sendPushToUser(...)])` per invoice |
| 7  | Scheduler uses no external cron dependency — plain setInterval inside the Express process | ✓ VERIFIED | Only `setInterval` used; no cron package imports in scheduler.ts |
| 8  | No scheduler error crashes the server — errors are logged and the interval continues | ✓ VERIFIED | Both the startup call and setInterval callback use `.catch(err => logger.error(...))` — errors swallowed and logged |

**Score:** 8/8 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `artifacts/api-server/src/lib/migration-runner.ts` | applyMigrations() that reads SQL and calls pool.query | ✓ VERIFIED | 18 lines; exports `applyMigrations`; imports pool from @workspace/db; resolves SQL path via import.meta.url |
| `artifacts/api-server/src/lib/scheduler.ts` | startScheduler() with overdue check on startup + 24h interval | ✓ VERIFIED | 67 lines; exports `startScheduler`; real Drizzle query + both notification calls |
| `artifacts/api-server/src/index.ts` | Entry point calling applyMigrations before listen, startScheduler inside listen callback | ✓ VERIFIED | Imports both `applyMigrations` (line 3) and `startScheduler` (line 4); correct call order verified |
| `lib/db/migrations/0001_add_number_sequences.sql` | SQL with CREATE SEQUENCE IF NOT EXISTS for both sequences | ✓ VERIFIED | 5 lines; both sequences present with correct CREATE SEQUENCE IF NOT EXISTS syntax |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `artifacts/api-server/src/index.ts` | `migration-runner.ts` | import applyMigrations + await before listen | ✓ WIRED | Line 3: import; lines 20-33: `applyMigrations().then(() => app.listen(...))` |
| `migration-runner.ts` | `lib/db/migrations/0001_add_number_sequences.sql` | fs.readFileSync + pool.query | ✓ WIRED | Lines 8-12: path resolution; line 15-16: `readFileSync(SQL_PATH)` then `pool.query(sql)` |
| `scheduler.ts` | `email-service.ts` | import sendBillOverdueEmail | ✓ WIRED | Line 4: import; line 41: called inside Promise.allSettled per invoice |
| `scheduler.ts` | `push-service.ts` | import sendPushToUser | ✓ WIRED | Line 5: import; lines 42-46: called alongside email per invoice |
| `scheduler.ts` | `lib/db/src/schema/invoices.ts` | drizzle query on invoicesTable | ✓ WIRED | Lines 1-2: `db` and `invoicesTable` imported from @workspace/db; lines 13-24: full Drizzle select query |
| `artifacts/api-server/src/index.ts` | `scheduler.ts` | import startScheduler, call after listen | ✓ WIRED | Line 4: import; line 28: `startScheduler()` called inside listen callback after "Server listening" log |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `scheduler.ts` | `overdueInvoices` | Drizzle `db.select().from(invoicesTable).where(and(lt(...), or(...)))` | Yes — live DB query with real filter conditions | ✓ FLOWING |
| `migration-runner.ts` | SQL string | `readFileSync(SQL_PATH, "utf-8")` reading the real SQL file | Yes — file contains two CREATE SEQUENCE statements | ✓ FLOWING |
| `sendBillOverdueEmail` (dependency) | `user` | `db.select().from(usersTable).where(eq(usersTable.id, userId))` | Yes — live DB query; returns early if user has emailNotifications off | ✓ FLOWING |
| `sendPushToUser` (dependency) | `subscriptions` | `db.select().from(pushSubscriptionsTable).where(eq(..., userId))` | Yes — live DB query for active push subscriptions | ✓ FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| esbuild bundles scheduler + migration-runner without error | `pnpm --filter @workspace/api-server run build` | "Done in 158ms", dist/index.mjs at 4.4mb | ✓ PASS |
| applyMigrations exported from migration-runner.ts | `grep "export async function applyMigrations" migration-runner.ts` | match found | ✓ PASS |
| startScheduler exported from scheduler.ts | `grep "export function startScheduler" scheduler.ts` | match found | ✓ PASS |
| TypeScript errors in phase 17 files specifically | `npx tsc --project artifacts/api-server/tsconfig.json --noEmit 2>&1 \| grep -E "migration-runner\|scheduler\|index"` | only pre-existing health.ts/api-zod error (unrelated) — no errors in phase 17 files | ✓ PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| COMM-02 | 17-01-PLAN.md, 17-02-PLAN.md | Email notifications for critical events (bill due, ticket update) | ✓ SATISFIED | sendBillOverdueEmail (email) + sendPushToUser (push) both called per overdue invoice; email function has real Resend integration via sendEmail(); push function has real web-push integration |

---

### Anti-Patterns Found

None. No TODO/FIXME/placeholder comments, no empty return values, no hardcoded stubs in the three phase-17 files.

---

### Human Verification Required

#### 1. Overdue Email Received on Real Deploy

**Test:** With at least one invoice where `dueDate` is past today and `status` is `unpaid`, restart the server and check that the user's inbox receives a "Invoice Overdue" email from SCLA.
**Expected:** Email arrives within seconds of server startup; subject contains invoice number; amount due is the correct unpaid balance.
**Why human:** Cannot test email delivery against a live SMTP/Resend account in a static analysis pass.

#### 2. Push Notification Delivered

**Test:** With a registered push subscription for a user who has an overdue invoice, restart the server and verify the push notification arrives in the browser/device.
**Expected:** Notification titled "Invoice Overdue" with body containing the invoice number and amount.
**Why human:** Push delivery requires a live browser subscription and VAPID keys configured in the environment.

#### 3. Scheduler Log Output Visible

**Test:** Run the server with a populated DB and observe the server log output.
**Expected:** On startup: "Scheduler: bill-overdue job started", then either "Scheduler: no overdue invoices found" or "Scheduler: processing overdue invoices" with a count.
**Why human:** Requires a running server connected to the DB.

---

### Gaps Summary

No gaps. All eight observable truths are verified. All four required artifacts exist and are substantive, wired, and have confirmed data flow. The esbuild build passes. The only TypeScript error (`health.ts` referencing an unbuilt `api-zod` dist file) is pre-existing and predates Phase 17 — confirmed by reverting the phase and seeing the same error.

---

_Verified: 2026-04-10T18:45:00Z_
_Verifier: Claude (gsd-verifier)_
