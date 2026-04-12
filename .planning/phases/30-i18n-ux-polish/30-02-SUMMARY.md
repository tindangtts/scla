---
phase: 30-i18n-ux-polish
plan: 02
subsystem: ui
tags: [pwa, service-worker, offline, skeleton, loading, error-boundary, next.js]

requires:
  - phase: 30-01
    provides: i18n and dark mode theming with CSS variables
provides:
  - PWA web app manifest with standalone display mode
  - Enhanced service worker with caching strategies (network-first navigation, cache-first static)
  - Offline fallback page with branded UI and dark mode
  - Reusable skeleton components (Skeleton, CardSkeleton, ListSkeleton, PageSkeleton, DetailSkeleton)
  - 18 loading.tsx files across all resident and admin route groups
  - Error boundaries for resident and admin with retry functionality
  - Not-found page for resident routes
affects: []

tech-stack:
  added: []
  patterns: [pwa-manifest, service-worker-caching, nextjs-loading-convention, nextjs-error-boundary]

key-files:
  created:
    - artifacts/web/public/manifest.json
    - artifacts/web/public/offline.html
    - artifacts/web/src/components/skeletons.tsx
    - artifacts/web/src/app/(resident)/error.tsx
    - artifacts/web/src/app/(admin)/error.tsx
    - artifacts/web/src/app/(resident)/not-found.tsx
  modified:
    - artifacts/web/public/sw.js
    - artifacts/web/src/app/layout.tsx

key-decisions:
  - "Preserve existing push notification handlers in sw.js while adding caching strategy at top"
  - "Network-first for navigation with offline.html fallback, cache-first for static assets, skip API requests"
  - "Server-renderable skeletons using CSS variable colors (bg-muted) for automatic dark mode"

patterns-established:
  - "Loading convention: each route group has loading.tsx importing from @/components/skeletons"
  - "Error boundary: 'use client' with error.message display and reset() retry button"
  - "Service worker: caching strategy layered on top of push notification handlers"

requirements-completed: [UX-04, UX-05]

duration: 3min
completed: 2026-04-11
---

# Phase 30 Plan 02: PWA & Loading States Summary

**PWA manifest with offline caching service worker, 18 route-level loading skeletons, and error boundaries for resident and admin sections**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-11T18:26:42Z
- **Completed:** 2026-04-11T18:30:05Z
- **Tasks:** 2
- **Files modified:** 28

## Accomplishments
- PWA manifest enables install-to-homescreen for mobile browser users with standalone display mode
- Service worker caches static assets and serves branded offline fallback for navigation failures
- All 18 route groups (9 resident, 9 admin) have loading skeletons preventing blank screens during data fetch
- Error boundaries in both resident and admin catch render errors with retry functionality

## Task Commits

Each task was committed atomically:

1. **Task 1: PWA manifest, enhanced service worker, and offline fallback** - `34f21f3` (feat)
2. **Task 2: Loading skeletons and error boundaries for all route groups** - `4ad7ed7` (feat)

## Files Created/Modified
- `artifacts/web/public/manifest.json` - PWA web app manifest with standalone display
- `artifacts/web/public/sw.js` - Service worker with install/activate/fetch caching + push handlers
- `artifacts/web/public/offline.html` - Branded offline fallback page with dark mode
- `artifacts/web/public/icon-192.png` - Placeholder PWA icon (192x192)
- `artifacts/web/public/icon-512.png` - Placeholder PWA icon (512x512)
- `artifacts/web/src/app/layout.tsx` - Added manifest and themeColor to metadata
- `artifacts/web/src/components/skeletons.tsx` - Reusable skeleton components (6 exports)
- `artifacts/web/src/app/(resident)/loading.tsx` - PageSkeleton fallback
- `artifacts/web/src/app/(resident)/error.tsx` - Client error boundary with retry
- `artifacts/web/src/app/(resident)/not-found.tsx` - 404 page with home link
- `artifacts/web/src/app/(resident)/bills/loading.tsx` - ListSkeleton rows=6
- `artifacts/web/src/app/(resident)/star-assist/loading.tsx` - ListSkeleton rows=5
- `artifacts/web/src/app/(resident)/bookings/loading.tsx` - CardGridSkeleton count=6
- `artifacts/web/src/app/(resident)/discover/loading.tsx` - CardGridSkeleton count=4
- `artifacts/web/src/app/(resident)/wallet/loading.tsx` - CardSkeleton + ListSkeleton
- `artifacts/web/src/app/(resident)/notifications/loading.tsx` - ListSkeleton rows=8
- `artifacts/web/src/app/(resident)/info-centre/loading.tsx` - ListSkeleton rows=6
- `artifacts/web/src/app/(resident)/profile/loading.tsx` - DetailSkeleton
- `artifacts/web/src/app/(admin)/loading.tsx` - PageSkeleton fallback
- `artifacts/web/src/app/(admin)/error.tsx` - Client error boundary with retry
- `artifacts/web/src/app/(admin)/dashboard/loading.tsx` - CardGridSkeleton count=4
- `artifacts/web/src/app/(admin)/users/loading.tsx` - ListSkeleton rows=10
- `artifacts/web/src/app/(admin)/tickets/loading.tsx` - ListSkeleton rows=8
- `artifacts/web/src/app/(admin)/facilities/loading.tsx` - CardGridSkeleton count=6
- `artifacts/web/src/app/(admin)/content/loading.tsx` - ListSkeleton rows=6
- `artifacts/web/src/app/(admin)/audit-logs/loading.tsx` - ListSkeleton rows=10
- `artifacts/web/src/app/(admin)/wallets/loading.tsx` - ListSkeleton rows=8
- `artifacts/web/src/app/(admin)/staff/loading.tsx` - ListSkeleton rows=5

## Decisions Made
- Preserved existing push notification handlers in sw.js, adding caching strategy above them
- Used network-first for navigation (offline.html fallback), cache-first for static assets, skip API requests entirely
- Skeletons are server-renderable (no "use client") using CSS variable colors for automatic dark mode support
- Push-prompt.tsx already registers the service worker, so no additional registration script needed in layout

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 30 (i18n-ux-polish) complete with both plans executed
- All resident and admin routes have loading states, error boundaries, and PWA support
- Placeholder PWA icons should be replaced with branded assets for production

---
*Phase: 30-i18n-ux-polish*
*Completed: 2026-04-11*

## Self-Check: PASSED
