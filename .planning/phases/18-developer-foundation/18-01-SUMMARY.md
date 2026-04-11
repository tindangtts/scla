---
phase: 18-developer-foundation
plan: "01"
subsystem: api-server/seed
tags: [dx, seed, idempotent, database]
dependency_graph:
  requires: []
  provides: [idempotent-seed-script, booking-seed-data, deterministic-user-ids]
  affects: [artifacts/api-server/src/seed.ts]
tech_stack:
  added: []
  patterns: [onConflictDoNothing, deterministic-UUIDs, per-entity-seed-functions]
key_files:
  created: []
  modified:
    - artifacts/api-server/src/seed.ts
decisions:
  - "onConflictDoNothing with email target for users/staff (only tables with DB-level unique constraint); count-first guard for all other tables (no unique constraint on invoiceNumber, ticketNumber, etc.)"
  - "Deterministic UUID SEED_IDS constants instead of .returning() for cross-insert references — script works identically on every run"
  - "Added onConflictDoNothing() (no target) to invoices/facilities/tickets/bookings as belt-and-suspenders alongside count guards"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-11"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 18 Plan 01: Idempotent Seed Script Summary

Rewrote `artifacts/api-server/src/seed.ts` to be fully idempotent using `onConflictDoNothing` upsert patterns and deterministic UUID constants, adding missing bookings seed data so `pnpm run seed` can be safely re-run without duplicates or errors.

## What Was Built

**Idempotent seed script** with:
- `SEED_IDS` constant map of 7 fixed UUIDs (4 users + 3 staff) used across all inserts — eliminates `.returning()` dependency for cross-table references
- `onConflictDoNothing({ target: usersTable.email })` and `onConflictDoNothing({ target: staffUsersTable.email })` on the two tables with DB-level unique email constraints
- `.onConflictDoNothing()` (no target, PK guard) added to invoices, facilities, tickets, and bookings inserts as belt-and-suspenders
- Count-first guards (`if (existing.length > 0) return`) for tables without unique constraints (announcements, promotions, upgrade_requests, info categories/articles, FAQs, notifications)
- New `seedBookings()` function inserting 3 bookings: upcoming (BK-0001, Swimming Pool), completed (BK-0002, Tennis Court), cancelled (BK-0003, Gym) — all linked to `SEED_IDS.residentUser`
- Refactored into 13 independent per-entity seed functions — each section runs whether or not others have already completed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Schema Reality] onConflictDoNothing target columns only for tables with actual DB-level unique constraints**
- **Found during:** Task 1 — reading schema files
- **Issue:** Plan specified `onConflictDoNothing` on `invoiceNumber`, `ticketNumber`, `facilityName`, and `bookingNumber`, but these columns are not marked `unique()` in the Drizzle schema (only `notNull()`). Using a column target on a non-unique column would cause a Drizzle/Postgres error.
- **Fix:** Used `onConflictDoNothing({ target: col })` only for `usersTable.email` and `staffUsersTable.email` (verified unique). Used count-first guards for all other tables. Added `.onConflictDoNothing()` (no target) to invoices/facilities/tickets/bookings as PK-level safety net.
- **Files modified:** `artifacts/api-server/src/seed.ts`
- **Commit:** 1545221

## Known Stubs

None — all seed data is fully wired.

## Verification Results

```
grep -c "onConflictDoNothing" artifacts/api-server/src/seed.ts  → 12 (>= 5 required)
grep -c "SEED_IDS" artifacts/api-server/src/seed.ts             → 21
grep -c "bookingsTable" artifacts/api-server/src/seed.ts        → 3
grep -c "BK-000" artifacts/api-server/src/seed.ts               → 3
grep "existingUsers.length > 0" artifacts/api-server/src/seed.ts → 0 (removed)
pnpm run typecheck errors in seed.ts                             → 0 (pre-existing errors in test mocks unrelated to this plan)
```

## Commits

| Task | Description | Hash | Files |
|------|-------------|------|-------|
| 1 | Rewrite seed.ts — idempotent with all entity types | 1545221 | artifacts/api-server/src/seed.ts |

## Self-Check: PASSED
