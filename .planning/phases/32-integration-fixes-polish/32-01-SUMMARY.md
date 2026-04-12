---
phase: 32-integration-fixes-polish
plan: 01
subsystem: ui
tags: [nextjs, routing, dark-mode, prettier, app-router]

requires:
  - phase: 28-admin-portal
    provides: admin portal pages under route group
  - phase: 26-resident-core
    provides: resident layout with bottom nav and dashboard
provides:
  - Admin pages accessible at /admin/* URL paths (not route group)
  - Client-side bottom nav navigation with Next.js Link
  - Dark mode support on dashboard quick action cards
  - Consistent code formatting across all source files
affects: []

tech-stack:
  added: []
  patterns:
    - "Admin pages use /admin/* segment routing (not route group parentheses)"
    - "Bottom nav uses Next.js Link for client-side navigation"

key-files:
  created: []
  modified:
    - artifacts/web/src/app/admin/ (renamed from (admin))
    - artifacts/web/src/app/admin/upgrade-requests/actions.ts
    - artifacts/web/src/app/(resident)/layout.tsx
    - artifacts/web/src/app/(resident)/page.tsx

key-decisions:
  - "Renamed (admin) route group to admin segment for URL-matching file-system routing"
  - "Used git mv to preserve git history across the rename"

patterns-established:
  - "Admin route segment: use /admin/* not /(admin)/* for correct sidebar/redirect/revalidate resolution"

requirements-completed: [ADM-01, ADM-02, ADM-03, ADM-04, ADM-05, ADM-06, ADM-07, ADM-08, ADM-09, ADM-10]

duration: 2min
completed: 2026-04-12
---

# Phase 32 Plan 01: Integration Fixes and Polish Summary

**Renamed admin route group to /admin segment, fixed revalidatePath, added client-side bottom nav, dark mode cards, and formatted 153 files**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-12T02:03:06Z
- **Completed:** 2026-04-12T02:05:35Z
- **Tasks:** 2
- **Files modified:** 198 (47 renamed + 151 formatted)

## Accomplishments
- Renamed (admin) route group to /admin segment so all 9 sidebar links, redirects, and revalidatePath calls resolve correctly
- Fixed both revalidatePath calls in upgrade-requests/actions.ts to use /admin/upgrade-requests prefix
- Replaced 5 bottom nav `<a>` tags with Next.js `<Link>` for client-side navigation (no full page reload)
- Added dark:bg-gray-800 and dark:border-gray-700 to all 3 dashboard quick action cards
- Ran Prettier on all 153 source files and verified format:check passes
- Verified Next.js build completes successfully after all changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix admin routing and resident polish** - `9150e1b` (fix)
2. **Task 2: Run code formatter and verify build** - `8ab7e3a` (chore)

## Files Created/Modified
- `artifacts/web/src/app/admin/` - Renamed from (admin) for correct URL-based routing
- `artifacts/web/src/app/admin/upgrade-requests/actions.ts` - Fixed revalidatePath to /admin/upgrade-requests
- `artifacts/web/src/app/(resident)/layout.tsx` - Replaced bottom nav <a> with <Link>, added Link import
- `artifacts/web/src/app/(resident)/page.tsx` - Added dark mode classes to quick action cards
- 151 additional files reformatted by Prettier

## Decisions Made
- Renamed (admin) route group to admin segment rather than updating all link references -- the links already pointed to /admin/*, the filesystem just needed to match
- Used git mv to move individual items since target admin/ directory already existed (contained login/ page)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Merged (admin) contents into existing admin directory**
- **Found during:** Task 1 (admin rename)
- **Issue:** admin/ directory already existed with login/ subdirectory, so `git mv (admin) admin` would fail
- **Fix:** Moved each item individually with `git mv` into the existing admin/ directory, then removed empty (admin)/
- **Files modified:** All 45 files under (admin)/
- **Verification:** ls admin/layout.tsx succeeds, (admin)/ does not exist
- **Committed in:** 9150e1b

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary adaptation for existing directory structure. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all changes are functional, no placeholder data.

## Next Phase Readiness
- All admin routing works at /admin/* URLs
- Resident UX polished with client-side nav and dark mode
- Codebase consistently formatted
- Build passes cleanly

---
*Phase: 32-integration-fixes-polish*
*Completed: 2026-04-12*
