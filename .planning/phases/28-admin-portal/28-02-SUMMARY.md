---
phase: 28-admin-portal
plan: 02
subsystem: admin
tags: [next.js, server-actions, drizzle, crud, admin, tickets, facilities, content, audit-log]

requires:
  - phase: 28-01
    provides: Admin layout, auth, dashboard, staff/user management

provides:
  - Admin ticket management with status update and staff assignment
  - Admin facility overview with booking management
  - Content CRUD for announcements, promotions, and FAQs with audit logging

affects: [28-03, admin-portal, content-management]

tech-stack:
  added: []
  patterns: [server-action-forms, admin-query-helpers, audit-logging-on-mutations]

key-files:
  created:
    - artifacts/web/src/lib/queries/admin-tickets.ts
    - artifacts/web/src/lib/queries/admin-facilities.ts
    - artifacts/web/src/lib/queries/admin-content.ts
    - artifacts/web/src/app/(admin)/tickets/page.tsx
    - artifacts/web/src/app/(admin)/tickets/[id]/page.tsx
    - artifacts/web/src/app/(admin)/tickets/[id]/actions.ts
    - artifacts/web/src/app/(admin)/facilities/page.tsx
    - artifacts/web/src/app/(admin)/facilities/bookings/page.tsx
    - artifacts/web/src/app/(admin)/content/page.tsx
    - artifacts/web/src/app/(admin)/content/announcements/actions.ts
    - artifacts/web/src/app/(admin)/content/announcements/page.tsx
    - artifacts/web/src/app/(admin)/content/announcements/new/page.tsx
    - artifacts/web/src/app/(admin)/content/announcements/[id]/edit/page.tsx
    - artifacts/web/src/app/(admin)/content/promotions/actions.ts
    - artifacts/web/src/app/(admin)/content/promotions/page.tsx
    - artifacts/web/src/app/(admin)/content/promotions/new/page.tsx
    - artifacts/web/src/app/(admin)/content/promotions/[id]/edit/page.tsx
    - artifacts/web/src/app/(admin)/content/faqs/actions.ts
    - artifacts/web/src/app/(admin)/content/faqs/page.tsx
    - artifacts/web/src/app/(admin)/content/faqs/new/page.tsx
    - artifacts/web/src/app/(admin)/content/faqs/[id]/edit/page.tsx
  modified: []

key-decisions:
  - "Admin ticket queries join usersTable to show submitter name/email without user scope"
  - "Admin facility queries include all facilities regardless of availability for full oversight"
  - "All content mutations (create/update/delete) create audit log entries with actor tracking"

patterns-established:
  - "Admin query helpers in src/lib/queries/admin-*.ts for admin-scoped data access"
  - "Server action pattern: requireAdmin() -> extract formData -> mutate -> audit log -> revalidate/redirect"
  - "Content CRUD pattern: list/new/edit pages with shared actions.ts file"

requirements-completed: [ADM-04, ADM-05, ADM-06]

duration: 5min
completed: 2026-04-11
---

# Phase 28 Plan 02: Ticket, Facility & Content Management Summary

**Admin pages for ticket management with status/assignment, facility/booking oversight, and full content CRUD (announcements, promotions, FAQs) with audit logging**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-11T17:32:37Z
- **Completed:** 2026-04-11T17:37:47Z
- **Tasks:** 2
- **Files modified:** 21

## Accomplishments
- Ticket management: list with status filter, detail with status update and staff assignment forms
- Facility overview: card grid with availability badges, bookings table with facility/status filters
- Content CRUD for announcements (with type, audience targeting, draft/publish), promotions (with validity dates), and FAQs (with sort order)
- All content mutations produce audit log entries tracking actor and action

## Task Commits

Each task was committed atomically:

1. **Task 1: Ticket management and facility/booking admin pages** - `7613373` (feat)
2. **Task 2: Content management CRUD (announcements, promotions, FAQs)** - `25435ea` (feat)

## Files Created/Modified
- `artifacts/web/src/lib/queries/admin-tickets.ts` - All-user ticket queries with user join for admin
- `artifacts/web/src/lib/queries/admin-facilities.ts` - All-facility and all-booking queries with user join
- `artifacts/web/src/lib/queries/admin-content.ts` - Content CRUD queries for announcements, promotions, FAQs
- `artifacts/web/src/app/(admin)/tickets/page.tsx` - Ticket list with status filter
- `artifacts/web/src/app/(admin)/tickets/[id]/page.tsx` - Ticket detail with status update and assignment
- `artifacts/web/src/app/(admin)/tickets/[id]/actions.ts` - Server actions for ticket status/assignment
- `artifacts/web/src/app/(admin)/facilities/page.tsx` - Facility card grid
- `artifacts/web/src/app/(admin)/facilities/bookings/page.tsx` - Bookings table with filters
- `artifacts/web/src/app/(admin)/content/page.tsx` - Content hub with section links
- `artifacts/web/src/app/(admin)/content/announcements/*` - Full CRUD for announcements
- `artifacts/web/src/app/(admin)/content/promotions/*` - Full CRUD for promotions
- `artifacts/web/src/app/(admin)/content/faqs/*` - Full CRUD for FAQs

## Decisions Made
- Admin ticket queries join usersTable to show submitter name/email without user scope
- Admin facility queries include all facilities regardless of availability for full oversight
- All content mutations create audit log entries with actor tracking via requireAdmin()

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Ticket management, facility oversight, and content CRUD all functional
- Ready for Plan 03 (audit logs, settings, and remaining admin features)

---
*Phase: 28-admin-portal*
*Completed: 2026-04-11*
