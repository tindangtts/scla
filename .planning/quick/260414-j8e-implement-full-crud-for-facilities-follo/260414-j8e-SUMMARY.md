---
phase: quick
plan: 260414-j8e
subsystem: admin-facilities
tags: [crud, server-actions, admin, facilities]
key-files:
  created:
    - artifacts/web/src/app/admin/(authed)/facilities/actions.ts
    - artifacts/web/src/app/admin/(authed)/facilities/new/page.tsx
    - artifacts/web/src/app/admin/(authed)/facilities/[id]/edit/page.tsx
  modified:
    - artifacts/web/src/app/admin/(authed)/facilities/page.tsx
    - artifacts/web/src/lib/queries/admin-facilities.ts
    - lib/db/src/schema/audit_logs.ts
decisions:
  - "Extended auditActionEnum with facility_create, facility_update, facility_delete — required for type-safe audit log inserts"
metrics:
  duration: "~14 minutes"
  tasks_completed: 3
  files_changed: 6
  completed_date: "2026-04-14"
---

# Quick Task 260414-j8e: Implement Full CRUD for Facilities Summary

**One-liner:** Full CRUD for admin facilities — server actions with audit logs, new/edit forms matching edit_facility.png design, list page with Add/Edit/Delete controls.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create server actions and admin query | 5dbc6cb | actions.ts, admin-facilities.ts, audit_logs.ts |
| 2 | Create new and edit facility form pages | f71243d | new/page.tsx, [id]/edit/page.tsx |
| 3 | Update facilities list page with actions | e602967 | page.tsx |

## What Was Built

### actions.ts
Three server actions following the announcements pattern:
- `createFacility` — validates name/description/category, inserts into DB, writes audit log, redirects to list
- `updateFacility` — updates by ID, writes audit log, revalidates and redirects
- `deleteFacility` — deletes by ID, writes audit log, redirects

All three call `requireAdmin()` before any DB operation.

### new/page.tsx
New facility form with all 8 field groups from the design:
- Name (text input)
- Category (styled select, 7 facility types)
- Description (textarea, 4 rows)
- Member Rate / Non-member Rate (side-by-side number inputs with step=0.01)
- Opening Time / Closing Time (side-by-side time inputs)
- Max Capacity (number input)
- Available for booking (checkbox, defaultChecked=true)
- "Create facility" submit button

### [id]/edit/page.tsx
Edit form with `getFacilityById` lookup, `notFound()` on missing record, all fields pre-filled from DB values. Time fields use `.substring(0, 5)` to strip seconds from stored HH:MM:SS format. Save + Cancel buttons in flex row.

### page.tsx (list)
- Header action updated: "View bookings" demoted to muted secondary button, "New facility" added as primary
- Each facility card footer gains Edit link and Delete form
- Delete uses `<form action={deleteFacility}>` — no client JS

### admin-facilities.ts
Added `getFacilityById(id)` following the same pattern as other admin query files.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Extended auditActionEnum with facility_* values**
- **Found during:** Task 1 TypeScript check
- **Issue:** `auditActionEnum` in `lib/db/src/schema/audit_logs.ts` only contained content/booking/staff/wallet actions. Inserting `facility_create`, `facility_update`, `facility_delete` caused TS2769 type errors.
- **Fix:** Added three facility action values to the pgEnum definition
- **Files modified:** `lib/db/src/schema/audit_logs.ts`
- **Commit:** 5dbc6cb

Note: This enum change requires a DB migration (`ALTER TYPE audit_action ADD VALUE ...`) before deploying to production. The enum values are additive and non-breaking.

## Known Stubs

None — all fields are wired to DB. `imageUrl` field exists in the schema but was intentionally excluded from the form (not in the edit_facility.png design scope, no image upload infrastructure exists).

## Threat Flags

None — all new routes are admin-only (`requireAdmin()` on every page and action). No new public-facing surface introduced.

## Self-Check: PASSED

Files verified:
- FOUND: artifacts/web/src/app/admin/(authed)/facilities/actions.ts
- FOUND: artifacts/web/src/app/admin/(authed)/facilities/new/page.tsx
- FOUND: artifacts/web/src/app/admin/(authed)/facilities/[id]/edit/page.tsx

Commits verified:
- FOUND: 5dbc6cb (server actions + query + enum)
- FOUND: f71243d (new + edit form pages)
- FOUND: e602967 (list page updates)
