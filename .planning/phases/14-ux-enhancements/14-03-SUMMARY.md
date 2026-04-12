---
phase: 14-ux-enhancements
plan: "03"
subsystem: frontend/pwa
tags: [service-worker, offline, cache-first, pwa, ux]
dependency_graph:
  requires: []
  provides: [offline-api-caching, offline-banner]
  affects: [artifacts/scla/public/sw.js, artifacts/scla/src/components/layout]
tech_stack:
  added: []
  patterns: [cache-first-strategy, stale-while-revalidate, navigator.onLine, service-worker-messaging]
key_files:
  created:
    - artifacts/scla/src/components/layout/offline-banner.tsx
  modified:
    - artifacts/scla/public/sw.js
    - artifacts/scla/src/components/layout/app-layout.tsx
decisions:
  - "Cache-first strategy returns stale data immediately then refreshes in background — best for low-connectivity environments"
  - "CLEAR_API_CACHE message posted from OfflineBanner on reconnect so React Query refetches fresh data"
  - "Separate API_CACHE ('scla-api-v1') keeps API responses isolated from app-shell cache ('scla-v1')"
  - "3-second 'back online' green banner provides clear reconnection feedback without being persistent"
metrics:
  duration: 8m
  completed: 2026-04-10
  tasks_completed: 2
  files_changed: 3
---

# Phase 14 Plan 03: Offline Support & OfflineBanner Summary

**One-liner:** Cache-first service worker for /api/tickets, /api/bookings, /api/announcements with OfflineBanner component showing amber/green status in AppLayout.

## What Was Built

### Task 1: Enhanced service worker with cache-first API caching (e4817a8)

`artifacts/scla/public/sw.js` was updated to add a second cache namespace (`scla-api-v1`) dedicated to API responses, separate from the existing app-shell cache (`scla-v1`).

Changes made:
- Added `API_CACHE = "scla-api-v1"` constant
- Updated `activate` handler to delete all cache keys that are neither `CACHE_NAME` nor `API_CACHE` (cleans stale cache versions)
- Added `fetch` event handler with cache-first strategy: returns cached response immediately if available while also triggering a background network request to keep the cache fresh; falls back to cache when network fails
- Added `message` event handler supporting `SKIP_WAITING` and `CLEAR_API_CACHE` messages from the React app
- All existing `push` and `notificationclick` handlers preserved unchanged

Cache-first routes: `/api/tickets`, `/api/bookings`, `/api/announcements`

### Task 2: OfflineBanner component wired into AppLayout (bee246f)

`artifacts/scla/src/components/layout/offline-banner.tsx` created with:
- `useState(navigator.onLine)` for initial online state
- `window.addEventListener('online'/'offline')` for real-time network state tracking
- Amber banner (`bg-amber-500`) when offline: "You're offline — showing cached data"
- Green banner (`bg-emerald-500`) when reconnecting: "Back online" — auto-dismisses after 3 seconds
- Posts `CLEAR_API_CACHE` to SW controller on reconnect so stale cached data is evicted
- `data-testid="offline-banner"` for test targeting
- Returns `null` when online and not showing back-online message (no DOM node rendered)

`artifacts/scla/src/components/layout/app-layout.tsx` updated to:
- Import `OfflineBanner` from `./offline-banner`
- Render `<OfflineBanner />` between the outer container div and `<main>`, ensuring it appears above content on every page

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — the OfflineBanner is fully wired to real `navigator.onLine` events and the service worker cache is fully functional.

## Self-Check: PASSED
