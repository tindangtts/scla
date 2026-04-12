---
phase: 14-ux-enhancements
plan: "05"
subsystem: bookings
tags: [recurring-bookings, api, schema, drizzle]
dependency_graph:
  requires: []
  provides: [recurring-booking-creation, cancel-group-endpoint, recurringGroupId-column]
  affects: [bookings-api, bookings-schema]
tech_stack:
  added: []
  patterns: [drizzle-orm-insert-loop, group-cancellation-query]
key_files:
  created: []
  modified:
    - lib/db/src/schema/bookings.ts
    - artifacts/api-server/src/routes/bookings.ts
decisions:
  - "recurringGroupId is nullable text (not a FK) — matches existing codebase pattern of no FK constraints"
  - "cancel-group cancels bookings on or after today — past bookings in group remain untouched"
  - "POST /bookings returns only the first created booking — UI navigates to that date; all 4 accessible via GET /bookings"
  - "db push skipped in local env (no DATABASE_URL) — column will be applied on Replit deploy"
metrics:
  duration_minutes: 5
  completed_date: "2026-04-10T16:53:29Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 14 Plan 05: Recurring Bookings Summary

**One-liner:** Recurring booking support with 4-weekly-occurrence creation and cancel-group endpoint sharing a UUID recurringGroupId.

## What Was Built

Added recurring booking support to the bookings API:

1. **Schema change** (`lib/db/src/schema/bookings.ts`): Added nullable `recurringGroupId: text("recurring_group_id")` column to `bookingsTable` after the `notes` column. Types auto-update via drizzle-zod `$inferSelect`.

2. **API updates** (`artifacts/api-server/src/routes/bookings.ts`):
   - `POST /bookings` now accepts `recurring: true` — creates 4 bookings on weekly intervals (date, +7, +14, +21 days), all sharing a `recurringGroupId` UUID
   - Each booking gets its own unique `bookingNumber` via `nextval('booking_number_seq')`
   - `mapBooking` updated to include `recurringGroupId` in response
   - New `POST /bookings/:id/cancel-group` endpoint: finds booking's group, cancels all upcoming bookings in the group on or after today for the authenticated user
   - Single bookings (recurring omitted/false) work identically to before

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add recurringGroupId to bookings schema | 5ee4b66 | lib/db/src/schema/bookings.ts |
| 2 | Update bookings API — recurring POST and cancel-group | c71774c | artifacts/api-server/src/routes/bookings.ts |

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Notes

- `db push` was not run locally (DATABASE_URL not set in local environment — Replit-hosted DB). The schema change is correct and will be applied on Replit deployment. This is expected behavior noted in the plan's fallback instructions.
- Pre-existing build errors (`resend` and `web-push` missing dependencies in `email-service.ts` / `push-service.ts`) are out of scope — TypeScript check for `bookings.ts` passed cleanly after rebuilding `lib/db` declarations.

## Self-Check: PASSED

- [x] `lib/db/src/schema/bookings.ts` has `recurringGroupId: text("recurring_group_id")`
- [x] `artifacts/api-server/src/routes/bookings.ts` has `cancel-group` endpoint
- [x] Commit `5ee4b66` exists
- [x] Commit `c71774c` exists
- [x] TypeScript types validate cleanly for bookings.ts
