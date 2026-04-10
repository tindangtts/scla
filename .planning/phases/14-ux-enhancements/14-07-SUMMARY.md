---
phase: 14-ux-enhancements
plan: "07"
subsystem: bookings-ui
tags: [recurring-bookings, ui, react, tanstack-query]
dependency_graph:
  requires: [14-05]
  provides: [repeat-weekly-toggle, cancel-all-future-button, recurring-badge]
  affects: [booking-detail-page, bookings-list-page, api-client-schemas]
tech_stack:
  added: []
  patterns: [useMutation-for-group-cancel, toggle-pill-ui, tanstack-query-invalidate]
key_files:
  created: []
  modified:
    - artifacts/scla/src/pages/booking-detail.tsx
    - artifacts/scla/src/pages/bookings.tsx
    - lib/api-client-react/src/generated/api.schemas.ts
decisions:
  - "Toggle pill is a plain <button> element (not a shadcn Switch) — matches existing codebase pattern of minimal primitives"
  - "cancelGroupMutation uses raw fetch (not generated API client hook) because cancel-group endpoint was added in 14-05 but client hooks were not regenerated"
  - "Recurring badge uses ml-2 inline next to status badge — avoids new layout container for minimal diff"
metrics:
  duration_minutes: 8
  completed_date: "2026-04-10T16:58:56Z"
  tasks_completed: 2
  files_modified: 3
---

# Phase 14 Plan 07: Recurring Booking UI Summary

**One-liner:** Repeat-weekly toggle on booking form sends recurring=true to API, violet Recurring badge and Cancel All Future button wired to POST /bookings/:id/cancel-group on My Bookings list.

## What Was Built

Added recurring booking UI completing the ENH-05 feature started in Plan 14-05:

1. **booking-detail.tsx** — Repeat Weekly toggle:
   - `Repeat2` icon imported from lucide-react
   - `repeatWeekly` state (default `false`) added alongside existing state declarations
   - Toggle pill button with `data-testid="toggle-repeat-weekly"` inserted above Confirm button in the Booking Summary section
   - `recurring: repeatWeekly` passed to `createMutation.mutate` call
   - Confirmation screen shows "4 weekly bookings created." span when `repeatWeekly` was true

2. **bookings.tsx** — Recurring indicator and cancellation:
   - `useMutation`, `useQueryClient` from `@tanstack/react-query` added
   - `Repeat2`, `Loader2` from lucide-react added
   - `useToast` hook imported and used
   - `cancelGroupMutation` wired to `POST /api/bookings/:id/cancel-group`
   - Violet "Recurring" badge appears next to status badge when `booking.recurringGroupId` is truthy
   - "Cancel All Future" button with `data-testid="button-cancel-group-{id}"` shown only for `upcoming` recurring bookings
   - On success: invalidates `getListBookingsQueryKey({})` and shows count toast; on error: destructive toast

3. **api.schemas.ts** (deviation fix) — Schema types updated:
   - `Booking` interface: added `recurringGroupId?: string | null`
   - `CreateBookingBody` interface: added `recurring?: boolean`

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add repeat-weekly toggle to booking-detail.tsx | 018c4a3 | artifacts/scla/src/pages/booking-detail.tsx, lib/api-client-react/src/generated/api.schemas.ts |
| 2 | Add recurring indicator and Cancel All Future to bookings list | 0f966de | artifacts/scla/src/pages/bookings.tsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated Booking and CreateBookingBody schemas in api.schemas.ts**
- **Found during:** Task 1 (when passing `recurring: repeatWeekly` to the mutate call)
- **Issue:** Plan 14-05 added `recurringGroupId` to the API response and `recurring` param to POST /bookings, but the generated TypeScript interfaces in `lib/api-client-react/src/generated/api.schemas.ts` were not updated. This caused TypeScript type errors: `recurring` was not a valid property on `CreateBookingBody`, and `recurringGroupId` was not on `Booking`.
- **Fix:** Added `recurringGroupId?: string | null` to `Booking` interface and `recurring?: boolean` to `CreateBookingBody` interface.
- **Files modified:** `lib/api-client-react/src/generated/api.schemas.ts`
- **Commit:** 018c4a3

## Known Stubs

None — all UI is wired to live API endpoints with real query invalidation.

## Self-Check: PASSED

- [x] `artifacts/scla/src/pages/booking-detail.tsx` exists and contains `repeatWeekly`, `toggle-repeat-weekly`, `recurring: repeatWeekly`, `Repeat2`
- [x] `artifacts/scla/src/pages/bookings.tsx` exists and contains `cancel-group`, `cancelGroupMutation`, `Recurring`, `recurringGroupId`
- [x] `lib/api-client-react/src/generated/api.schemas.ts` updated with `recurringGroupId` and `recurring`
- [x] Commit 018c4a3 exists (Task 1)
- [x] Commit 0f966de exists (Task 2)
