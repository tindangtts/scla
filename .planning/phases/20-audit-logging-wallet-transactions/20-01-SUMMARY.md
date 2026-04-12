---
phase: 20-audit-logging-wallet-transactions
plan: 01
subsystem: backend/database
tags: [audit-logging, wallet, drizzle, schema, admin-api]
dependency_graph:
  requires: []
  provides: [audit_logs-table, wallet_transactions-table, audit-middleware, admin-audit-endpoint]
  affects: [artifacts/api-server/src/routes/admin.ts]
tech_stack:
  added: []
  patterns: [drizzle-pgEnum, non-blocking-try-catch, staff-email-helper]
key_files:
  created:
    - lib/db/src/schema/audit_logs.ts
    - lib/db/src/schema/wallet_transactions.ts
    - artifacts/api-server/src/lib/audit-middleware.ts
  modified:
    - lib/db/src/schema/index.ts
    - artifacts/api-server/src/routes/admin.ts
decisions:
  - auditLog() wraps db.insert in try/catch and logs but does not throw — audit failures are non-blocking
  - getStaffEmail() helper added to admin.ts to avoid per-handler staff email lookups
  - wallet_transactions category column defaults to "wallet" to distinguish from "deposit" type transactions
metrics:
  duration: "~10 minutes"
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_changed: 5
---

# Phase 20 Plan 01: Audit Logging + Wallet Transactions Schema Summary

**One-liner:** Drizzle schemas for audit_logs (10-action pgEnum) and wallet_transactions tables, plus Express audit middleware wired into all admin mutation endpoints with a paginated GET /admin/audit-logs endpoint.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create audit_logs and wallet_transactions Drizzle schemas | 796a563 | lib/db/src/schema/audit_logs.ts, lib/db/src/schema/wallet_transactions.ts, lib/db/src/schema/index.ts |
| 2 | Create audit middleware and wire into admin routes | 5053e80 | artifacts/api-server/src/lib/audit-middleware.ts, artifacts/api-server/src/routes/admin.ts |

## What Was Built

### audit_logs Schema (lib/db/src/schema/audit_logs.ts)
- `auditActionEnum` pgEnum with 10 action types: upgrade_approve, upgrade_reject, booking_cancel, staff_create, staff_deactivate, staff_update, content_create, content_update, content_delete, wallet_adjust
- `auditLogsTable` with columns: id (UUID PK), actorId, actorEmail, action (enum), targetType, targetId, metadata (JSON nullable), createdAt

### wallet_transactions Schema (lib/db/src/schema/wallet_transactions.ts)
- `walletTransactionTypeEnum` pgEnum with values: credit, debit
- `walletTransactionsTable` with columns: id (UUID PK), userId, type (enum), amount (numeric 15,2), description, reference (nullable), category (default "wallet"), reason (nullable), createdAt

### Audit Middleware (artifacts/api-server/src/lib/audit-middleware.ts)
- `auditLog()` async function accepting actorId, actorEmail, action, targetType, targetId, metadata
- Non-blocking: wrapped in try/catch that logs errors via pino but does not throw

### Admin Routes Updates (artifacts/api-server/src/routes/admin.ts)
- Added `getStaffEmail()` helper to avoid repeated staff DB lookups per handler
- PATCH /upgrade-requests/:id: logs upgrade_approve or upgrade_reject
- PATCH /bookings/:id/cancel: logs booking_cancel with bookingNumber in metadata
- POST /staff: logs staff_create with role and email in metadata
- PATCH /staff/:id: logs staff_deactivate (when isActive === false) or staff_update
- New GET /admin/audit-logs endpoint with filters: action, actorId, from (ISO date), to (ISO date), page, limit; returns { logs, total, page, limit }

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all functionality is fully implemented. The wallet_transactions table is defined and exported but not yet used by any routes (those are planned in subsequent plans of this phase).

## Self-Check: PASSED

Files created:
- FOUND: lib/db/src/schema/audit_logs.ts
- FOUND: lib/db/src/schema/wallet_transactions.ts
- FOUND: artifacts/api-server/src/lib/audit-middleware.ts

Commits:
- FOUND: 796a563 (feat(20-01): add audit_logs and wallet_transactions Drizzle schemas)
- FOUND: 5053e80 (feat(20-01): add audit middleware and wire into all admin mutation endpoints)

TypeScript: Passes with no errors from our changes (pre-existing api-zod build artifact error unrelated to this plan)
