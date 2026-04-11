---
phase: 27-resident-secondary
plan: 02
subsystem: ui
tags: [nextjs, server-components, server-actions, drizzle, notifications, discover, info-centre]

requires:
  - phase: 24-foundation
    provides: "Next.js app structure, shadcn/ui, Supabase Auth, Drizzle ORM"
  - phase: 26-resident-core
    provides: "Query helper pattern, resident layout with bottom nav"
provides:
  - "Discover page with announcements, newsletters, and promotions"
  - "Info Centre with categorized articles and FAQs"
  - "Notification list with mark-as-read actions"
  - "Notification email preferences toggle"
  - "More menu page linking secondary features"
affects: [28-admin, 29-notifications]

tech-stack:
  added: []
  patterns: ["Query helpers for content retrieval", "Client component buttons for server actions"]

key-files:
  created:
    - artifacts/web/src/lib/queries/discover.ts
    - artifacts/web/src/lib/queries/info.ts
    - artifacts/web/src/lib/queries/notifications.ts
    - artifacts/web/src/app/(resident)/discover/page.tsx
    - artifacts/web/src/app/(resident)/info-centre/page.tsx
    - artifacts/web/src/app/(resident)/notifications/page.tsx
    - artifacts/web/src/app/(resident)/more/page.tsx
  modified: []

key-decisions:
  - "Extracted mark-as-read buttons into separate client component to keep notifications page as server component"
  - "FAQs rendered with native details/summary HTML elements instead of accordion component"

patterns-established:
  - "Client component extraction for interactive actions in server component pages"
  - "Relative time formatting with simple threshold logic (just now / hours / days / date)"

requirements-completed: [RES-07, RES-08, RES-09]

duration: 5min
completed: 2026-04-11
---

# Phase 27 Plan 02: Discover, Info Centre & Notifications Summary

**Discover page with announcements/newsletters/promotions, Info Centre with categorized articles and FAQs, notification list with mark-as-read and email preferences, and More menu navigation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-11T17:15:53Z
- **Completed:** 2026-04-11T17:20:32Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments
- Discover page with three content sections (announcements, newsletters, promotions) and detail pages for each
- Info Centre with category browsing, article detail pages, and expandable FAQ section
- Notification list with read/unread visual indicators, mark-as-read and mark-all-as-read server actions
- Notification preferences page with email notification toggle persisting to database
- More menu page providing navigation hub to all secondary features

## Task Commits

Each task was committed atomically:

1. **Task 1: Discover page and Info Centre** - `58fca9a` (feat)
2. **Task 2: Notifications, preferences, and More menu** - `f11f88c` (feat)

## Files Created/Modified
- `artifacts/web/src/lib/queries/discover.ts` - Query helpers for announcements, newsletters, promotions
- `artifacts/web/src/lib/queries/info.ts` - Query helpers for info categories, articles, FAQs
- `artifacts/web/src/lib/queries/notifications.ts` - Query helpers for user notifications with mark-as-read
- `artifacts/web/src/app/(resident)/discover/page.tsx` - Discover page with three content sections
- `artifacts/web/src/app/(resident)/discover/announcements/[id]/page.tsx` - Announcement detail page
- `artifacts/web/src/app/(resident)/discover/newsletters/[id]/page.tsx` - Newsletter detail page
- `artifacts/web/src/app/(resident)/discover/promotions/[id]/page.tsx` - Promotion detail page
- `artifacts/web/src/app/(resident)/info-centre/page.tsx` - Info Centre with categories and FAQs
- `artifacts/web/src/app/(resident)/info-centre/[id]/page.tsx` - Article detail page
- `artifacts/web/src/app/(resident)/notifications/page.tsx` - Notification list with read/unread styling
- `artifacts/web/src/app/(resident)/notifications/actions.ts` - Mark-as-read server actions
- `artifacts/web/src/app/(resident)/notifications/notification-buttons.tsx` - Client buttons for mark-as-read
- `artifacts/web/src/app/(resident)/notifications/preferences/page.tsx` - Notification preferences page
- `artifacts/web/src/app/(resident)/notifications/preferences/actions.ts` - Update preferences server action
- `artifacts/web/src/app/(resident)/notifications/preferences/preferences-form.tsx` - Preferences form client component
- `artifacts/web/src/app/(resident)/more/page.tsx` - More menu with links to secondary features

## Decisions Made
- Extracted mark-as-read buttons into separate client component (notification-buttons.tsx) to keep the notifications page as a pure server component
- Used native HTML details/summary elements for FAQs instead of adding an accordion component dependency
- Relative time formatting uses simple threshold logic rather than a library (date-fns/dayjs)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All resident secondary features complete (Discover, Info Centre, Notifications, More menu)
- Ready for Phase 28 (Admin portal) or Phase 29 (push notifications enhancement)
- Bottom nav "More" tab already links to /more from Phase 26 layout

---
*Phase: 27-resident-secondary*
*Completed: 2026-04-11*
