---
phase: 15-api-hardening-and-code-quality-fixes
plan: "01"
subsystem: api-auth
tags: [security, authentication, transactions, express, drizzle]
dependency_graph:
  requires: []
  provides: [admin-gated upgrade-request endpoints, transactional approve/reject]
  affects: [artifacts/api-server/src/routes/auth.ts]
tech_stack:
  added: []
  patterns: [requireAdmin middleware guard, db.transaction for atomic multi-table updates]
key_files:
  created: []
  modified:
    - artifacts/api-server/src/routes/auth.ts
decisions:
  - "Copied verifyAdmin/requireAdmin verbatim from admin.ts to auth.ts — keeps auth logic consistent across routes without extracting to shared middleware (no architectural change needed)"
  - "db.select for fetching request placed outside transaction (read-only, no atomicity requirement) — transaction wraps only the two UPDATE statements"
metrics:
  duration: "~10 minutes"
  completed: "2026-04-10T12:48:27Z"
  tasks_completed: 2
  files_modified: 1
---

# Phase 15 Plan 01: Auth Endpoint Hardening — Admin Auth + Transactional Approve/Reject Summary

Admin auth guard and Drizzle transaction wrapping added to three previously unauthenticated upgrade-request endpoints in auth.ts.

## What Was Built

Three upgrade-request admin endpoints in `artifacts/api-server/src/routes/auth.ts` were hardened:

1. `GET /upgrade-requests` — now requires a valid admin Bearer token (returns 401 otherwise)
2. `POST /upgrade-requests/:id/approve` — requires admin token; both UPDATE statements (upgradeRequestsTable + usersTable) now wrapped in a single `db.transaction` block
3. `POST /upgrade-requests/:id/reject` — same pattern as approve

The `requireAdmin`, `verifyAdmin`, and `AdminTokenPayload` helpers were copied verbatim from `admin.ts` to ensure consistent HMAC-based admin token verification across both route files.

## Verification Results

```
requireAdmin count: 4 (definition + 3 handler calls)  -- PASS
db.transaction count: 2 (approve + reject)             -- PASS
tx.update count: 4 (2 per transaction × 2 handlers)   -- PASS
```

TypeScript compilation: Pre-existing errors only (unbuilt `lib/db/dist` workspace artifacts and implicit `any` in other route files — none introduced by this plan).

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | e088b7e | feat(15-01): add admin auth helpers to auth.ts |
| Task 2 | b398a4d | feat(15-01): gate upgrade-request endpoints with admin auth and transactions |

## Self-Check: PASSED

- [x] `artifacts/api-server/src/routes/auth.ts` exists and modified
- [x] Commit e088b7e exists
- [x] Commit b398a4d exists
- [x] requireAdmin count = 4
- [x] db.transaction count = 2
- [x] tx.update count = 4
