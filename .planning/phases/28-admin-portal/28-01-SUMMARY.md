---
phase: 28-admin-portal
plan: 01
subsystem: admin
tags: [next.js, server-components, drizzle, admin-dashboard, user-management]

requires:
  - phase: 25-authentication
    provides: Supabase Auth with requireAdmin helper and admin login
provides:
  - Admin dashboard with 6 KPI stat cards (residents, guests, tickets, bookings, revenue)
  - User list with search and role filter
  - User detail with profile, wallet balance, and role assignment
  - Admin sidebar with all 9 navigation sections
  - Query helpers for admin dashboard stats and user management
affects: [28-02, 28-03, admin-portal]

tech-stack:
  added: []
  patterns: [admin query helpers in src/lib/queries/admin-*.ts, server actions for admin mutations]

key-files:
  created:
    - artifacts/web/src/lib/queries/admin-dashboard.ts
    - artifacts/web/src/lib/queries/admin-users.ts
    - artifacts/web/src/app/(admin)/users/page.tsx
    - artifacts/web/src/app/(admin)/users/[id]/page.tsx
    - artifacts/web/src/app/(admin)/users/[id]/actions.ts
  modified:
    - artifacts/web/src/app/(admin)/dashboard/page.tsx
    - artifacts/web/src/app/(admin)/layout.tsx
    - artifacts/web/src/app/(admin)/upgrade-requests/page.tsx

key-decisions:
  - "Admin query helpers follow same pattern as resident queries in src/lib/queries/"
  - "Role assignment syncs both app DB and Supabase Auth user_metadata for dual-source consistency"

patterns-established:
  - "Admin query files: src/lib/queries/admin-*.ts for admin-specific data fetching"
  - "Server actions for admin mutations: co-located actions.ts files in route directories"

requirements-completed: [ADM-01, ADM-02, ADM-03, ADM-10]

duration: 3min
completed: 2026-04-11
---

# Phase 28 Plan 01: Admin Dashboard and User Management Summary

**Admin dashboard with 6 KPI stat cards, user list with search/filter, user detail with role assignment, and complete 9-item sidebar navigation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-11T17:32:34Z
- **Completed:** 2026-04-11T17:35:41Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Admin dashboard displays live KPI counts (residents, guests, open tickets, in-progress tickets, active bookings, total revenue)
- User management with searchable list, detail view showing profile/wallet/role, and role assignment updating both app DB and Supabase Auth
- Upgrade requests page enhanced with pending count badge and back-to-dashboard navigation
- Admin sidebar updated from 6 items to complete 9-item navigation using Next.js Link components

## Task Commits

Each task was committed atomically:

1. **Task 1: Admin dashboard KPIs, query helpers, and sidebar navigation update** - `d1ed9f7` (feat)
2. **Task 2: User management pages and upgrade request improvements** - `2b13744` (feat)

## Files Created/Modified
- `artifacts/web/src/lib/queries/admin-dashboard.ts` - KPI aggregate queries (residents, guests, tickets, bookings, revenue)
- `artifacts/web/src/lib/queries/admin-users.ts` - User list/detail/wallet balance queries
- `artifacts/web/src/app/(admin)/dashboard/page.tsx` - Rewritten with 6 KPI cards and quick-action links
- `artifacts/web/src/app/(admin)/layout.tsx` - Updated sidebar with 9 nav items using Link components
- `artifacts/web/src/app/(admin)/users/page.tsx` - User list with search and role filter
- `artifacts/web/src/app/(admin)/users/[id]/page.tsx` - User detail with profile, wallet, role assignment
- `artifacts/web/src/app/(admin)/users/[id]/actions.ts` - updateUserRole server action
- `artifacts/web/src/app/(admin)/upgrade-requests/page.tsx` - Added pending count badge and back link

## Decisions Made
- Admin query helpers follow the same pattern as resident queries (src/lib/queries/) for consistency
- Role assignment syncs both app DB and Supabase Auth user_metadata, matching the pattern from upgrade-requests/actions.ts

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Admin dashboard and user management operational
- Query helper patterns established for remaining admin pages (tickets, facilities, content, staff, audit logs, wallets)
- Sidebar navigation ready for all admin sections (pages to be built in plans 02 and 03)

---
*Phase: 28-admin-portal*
*Completed: 2026-04-11*
