---
phase: 15-api-hardening-and-code-quality-fixes
plan: "03"
subsystem: database/api
tags: [race-condition, postgresql-sequences, drizzle-orm, booking, tickets]
dependency_graph:
  requires: []
  provides: [booking_number_seq, ticket_number_seq, atomic-number-generation]
  affects: [lib/db, artifacts/api-server]
tech_stack:
  added: []
  patterns: [postgresql-sequence-nextval, drizzle-pgSequence]
key_files:
  created:
    - lib/db/migrations/0001_add_number_sequences.sql
  modified:
    - lib/db/src/schema/bookings.ts
    - lib/db/src/schema/tickets.ts
    - artifacts/api-server/src/routes/bookings.ts
    - artifacts/api-server/src/routes/tickets.ts
decisions:
  - "Used result.rows[0].num pattern instead of array destructuring because drizzle-orm node-postgres adapter returns QueryResult (pg type) from db.execute(), not an iterable array"
  - "Created manual migration SQL file at lib/db/migrations/0001_add_number_sequences.sql since drizzle.config.ts has no out directory configured and no existing migrations directory"
metrics:
  duration: "~10 minutes"
  completed: "2026-04-10"
  tasks: 2
  files: 5
requirements: [QUAL-02]
---

# Phase 15 Plan 03: Atomic Sequence-Based Number Generation Summary

**One-liner:** Replaced race-condition count-based booking/ticket number generation with atomic PostgreSQL sequences (`nextval`) declared in Drizzle schema, eliminating duplicate number risk under concurrent inserts.

## What Was Built

Two PostgreSQL sequences (`booking_number_seq`, `ticket_number_seq`) declared using Drizzle ORM's `pgSequence` API and used in the booking and ticket creation routes via `nextval()`. The sequences are exported from the schema files so drizzle-kit can manage them, and a manual SQL migration file was created to create them in the database.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Declare pg sequences in Drizzle schema | 98138a3 | lib/db/src/schema/bookings.ts, lib/db/src/schema/tickets.ts, lib/db/migrations/0001_add_number_sequences.sql |
| 2 | Replace count-based number generation with nextval in route handlers | 35a1135 | artifacts/api-server/src/routes/bookings.ts, artifacts/api-server/src/routes/tickets.ts |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed array destructuring type error with db.execute() return type**
- **Found during:** Task 2 TypeScript compilation
- **Issue:** The plan's suggested pattern `const [{ num }] = await db.execute(...)` fails TypeScript because drizzle-orm's `node-postgres` adapter returns `QueryResult<Record<string, unknown>>` (a pg type), not an iterable array. TS error: `Type 'QueryResult<Record<string, unknown>>' must have a '[Symbol.iterator]()' method`.
- **Fix:** Changed to `const result = await db.execute(...); const bookingNumber = \`BK-\${result.rows[0].num}\`;` — accessing `.rows` array from `QueryResult` directly.
- **Files modified:** artifacts/api-server/src/routes/bookings.ts, artifacts/api-server/src/routes/tickets.ts
- **Commit:** 35a1135

## Decisions Made

1. **db.execute() return type:** Used `result.rows[0].num` pattern because `db` (drizzle with node-postgres) returns the raw `QueryResult` from `pg` library, which has a `.rows` property rather than being directly iterable.

2. **Manual migration file:** Created `lib/db/migrations/0001_add_number_sequences.sql` manually since `drizzle.config.ts` has no `out` directory, no existing migrations directory, and `drizzle-kit generate` requires a live DB connection for schema diffing.

## Known Stubs

None. Both sequences produce real values when `nextval()` is called at runtime.

## Success Criteria Verification

- `booking_number_seq` declared as `pgSequence` in `lib/db/src/schema/bookings.ts`: PASS
- `ticket_number_seq` declared as `pgSequence` in `lib/db/src/schema/tickets.ts`: PASS
- Both sequences exported from schema files: PASS (`export const bookingNumberSeq`, `export const ticketNumberSeq`)
- bookings.ts POST / uses `nextval('booking_number_seq')`: PASS
- tickets.ts POST / uses `nextval('ticket_number_seq')`: PASS
- No `count.length` race condition remaining: PASS
- Booking number format `BK-` + 4-digit zero-padded: PASS (unchanged)
- Ticket number format `SA-` + 4-digit zero-padded: PASS (unchanged)
- TypeScript compiles without errors in lib/db: PASS
- TypeScript compiles without errors in api-server (changed files): PASS
- Migration SQL file exists with `CREATE SEQUENCE IF NOT EXISTS`: PASS

## Self-Check: PASSED
