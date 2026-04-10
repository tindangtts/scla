---
phase: 17-scheduler-and-db-migration-bootstrap
plan: "02"
subsystem: api-server/scheduler
tags: [scheduler, notifications, email, push, invoices, overdue]
dependency_graph:
  requires:
    - "17-01"
    - "13-04"
    - "13-05"
  provides:
    - "Bill-overdue scheduler running at startup and every 24h"
    - "COMM-02: email + push notifications for overdue invoices"
  affects:
    - "artifacts/api-server/src/index.ts"
tech_stack:
  added: []
  patterns:
    - "setInterval-based scheduler in Express process (no external cron)"
    - "Promise.allSettled for fire-and-forget parallel notification dispatch"
key_files:
  created:
    - artifacts/api-server/src/lib/scheduler.ts
  modified:
    - artifacts/api-server/src/index.ts
decisions:
  - "startScheduler called inside app.listen callback so scheduler only starts after HTTP server is confirmed listening and DB migrations have completed"
  - "Promise.allSettled used at both outer (per-invoice) and inner (email+push per invoice) levels so a single failure never blocks remaining notifications"
  - "No external cron dependency — plain setInterval inside Express process, matching plan constraint"
metrics:
  duration_seconds: 107
  completed_date: "2026-04-10"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 1
---

# Phase 17 Plan 02: Bill-Overdue Scheduler Summary

**One-liner:** Plain-setInterval scheduler querying overdue invoices (dueDate < today, status unpaid/partially_paid) and dispatching email + push notifications in parallel per invoice.

## What Was Built

`artifacts/api-server/src/lib/scheduler.ts` — new module exporting `startScheduler()` that:
1. Calls `checkBillOverdue()` immediately on startup (fire-and-forget, errors caught)
2. Sets `setInterval(checkBillOverdue, 24h)` for daily repeat

`checkBillOverdue()` uses a Drizzle `and(lt(dueDate, today), or(eq(status, 'unpaid'), eq(status, 'partially_paid')))` query, then for each matching invoice calls `sendBillOverdueEmail` and `sendPushToUser` concurrently via `Promise.allSettled`.

`artifacts/api-server/src/index.ts` — updated to import and call `startScheduler()` inside `app.listen` callback, after the "Server listening" log line.

## Verification Results

- `grep -n "startScheduler" index.ts` — 2 matches (import line 4, call line 28)
- `grep -n "sendBillOverdueEmail|sendPushToUser" scheduler.ts` — matches for both
- `grep -n "setInterval|checkBillOverdue" scheduler.ts` — matches for both
- `pnpm --filter @workspace/api-server run build` — exits 0 (esbuild done in 168ms)
- TypeScript: no errors in scheduler.ts or index.ts (pre-existing health.ts api-zod error is out of scope)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing workspace dependencies**
- **Found during:** Task 1 verification (typecheck step)
- **Issue:** `resend` and `web-push` packages not installed in node_modules, causing esbuild to fail on email-service.ts and push-service.ts imports
- **Fix:** Ran `pnpm install` at workspace root — restored 29 packages from lockfile in ~1s
- **Files modified:** None (pnpm-lock.yaml already had correct entries)
- **Commit:** No separate commit needed (no lockfile changes)

## Known Stubs

None — scheduler.ts wires real implementations of sendBillOverdueEmail and sendPushToUser with no placeholder data.

## Commits

| Hash    | Message                                                     |
|---------|-------------------------------------------------------------|
| c3c1540 | feat(17-02): create scheduler.ts with bill-overdue job      |
| 0676f66 | feat(17-02): wire startScheduler into index.ts after app.listen |
