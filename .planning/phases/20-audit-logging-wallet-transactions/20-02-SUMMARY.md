---
phase: 20-audit-logging-wallet-transactions
plan: 02
subsystem: payments
tags: [drizzle-orm, postgres, wallet, invoices, audit]

# Dependency graph
requires:
  - phase: 20-01
    provides: walletTransactionsTable schema, auditLogsTable schema, auditLog() middleware

provides:
  - GET /wallet: real wallet balance computed from SUM of wallet_transactions (category=wallet) with pagination
  - GET /deposit: real deposit balance computed from SUM of wallet_transactions (category=deposit) with pagination
  - POST /invoices/:id/pay: atomic wallet deduction + invoice status update in db.transaction()
  - POST /admin/wallet/:userId/adjust: admin credit/debit for wallet or deposit with audit trail

affects: [21-websocket-chat, 22-ci-cd-pipeline, 23-e2e-tests]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "COALESCE SUM CASE WHEN pattern for computing net balance from credit/debit transaction rows"
    - "db.transaction() for atomic multi-table writes (debit insert + invoice status update)"
    - "Integer cents arithmetic (Math.round * 100) for precise floating point comparison"

key-files:
  created: []
  modified:
    - artifacts/api-server/src/routes/wallet.ts
    - artifacts/api-server/src/routes/invoices.ts
    - artifacts/api-server/src/routes/admin.ts

key-decisions:
  - "Wallet balance computed on-demand via SQL SUM — no cached balance column"
  - "Invoice pay deducts only from wallet category (not deposit) — deposit is security-only"
  - "Admin wallet adjust supports category=deposit for security deposit management (WALLET-04)"
  - "Debit adjustments require sufficient balance check before insert to prevent overdraft"

patterns-established:
  - "Balance SUM pattern: COALESCE(SUM(CASE WHEN type='credit' THEN amount ELSE -amount END), 0)"
  - "db.transaction() for atomicity when inserting into wallet_transactions + updating invoices"

requirements-completed: [WALLET-01, WALLET-02, WALLET-03, WALLET-04]

# Metrics
duration: 18min
completed: 2026-04-11
---

# Phase 20 Plan 02: Wallet Routes & Invoice Payment Summary

**Real DB-backed wallet balance (SUM pattern), atomic invoice payment via db.transaction(), and admin wallet adjust endpoint with audit trail**

## Performance

- **Duration:** 18 min
- **Started:** 2026-04-11T07:35:00Z
- **Completed:** 2026-04-11T07:53:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Replaced hardcoded wallet balances (1250000 MMK stub) with COALESCE SUM query on wallet_transactions table
- Rewrote POST /invoices/:id/pay to atomically deduct from wallet and update invoice in a single db.transaction()
- Added POST /admin/wallet/:userId/adjust with validation, balance checking for debits, and audit logging

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite wallet routes with real DB queries** - `61c120e` (feat)
2. **Task 2: Rewrite invoice pay + add admin wallet adjust endpoint** - `5d5df8d` (feat)

**Plan metadata:** (to be committed with SUMMARY)

## Files Created/Modified
- `artifacts/api-server/src/routes/wallet.ts` - GET /wallet and GET /deposit backed by walletTransactionsTable with COALESCE SUM balance
- `artifacts/api-server/src/routes/invoices.ts` - POST /:id/pay rewritten to use db.transaction() for atomic wallet debit + invoice status update
- `artifacts/api-server/src/routes/admin.ts` - Added POST /wallet/:userId/adjust endpoint with validation, balance check, and auditLog()

## Decisions Made
- Wallet balance computed on-demand from SUM query rather than a cached column — simpler, always accurate
- Invoice pay endpoint drops the payment gateway redirect (WavePay/KBZPay) in favor of wallet-only deduction for v2.1
- Admin wallet adjust supports both `wallet` and `deposit` categories, enabling security deposit adjustments (WALLET-04)
- Integer cents arithmetic (`Math.round * 100`) used for outstanding amount to avoid floating point errors

## Deviations from Plan

None - plan executed exactly as written. The worktree required merging 20-01 changes first (from `worktree-agent-a9eb5dd6`) via `git merge` before schema files were available.

## Issues Encountered
- Worktree `agent-a8d0d671` initially lacked 20-01 schema files (`wallet_transactions.ts`, `audit_logs.ts`, `audit-middleware.ts`). Resolved by fast-forward merging `worktree-agent-a9eb5dd6` into the current branch before starting implementation.

## Known Stubs
None — all wallet endpoints now query real data from the database.

## Self-Check: PASSED

All created/modified files found. Task commits `61c120e` and `5d5df8d` verified in git history.

## Next Phase Readiness
- Wallet transaction infrastructure is complete and ready for consumption by frontend
- Phase 20 plan 03 (if any) or phase 21 (WebSocket Chat) can proceed
- No blockers

---
*Phase: 20-audit-logging-wallet-transactions*
*Completed: 2026-04-11*
