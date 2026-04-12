---
phase: quick
plan: 260412-v5w
subsystem: resident-dashboard
tags: [ui, dashboard, announcements, promotions]
dependency_graph:
  requires: [announcements-schema, promotions-schema]
  provides: [dashboard-announcements, dashboard-promotions]
  affects: [resident-home-page]
tech_stack:
  patterns: [conditional-rendering, drizzle-select]
key_files:
  modified:
    - artifacts/web/src/lib/queries/dashboard.ts
    - artifacts/web/src/app/(resident)/page.tsx
decisions:
  - Used existing announcementsTable and promotionsTable schemas without modification
  - Placed new sections between Recent Tickets and Quick Actions for visual hierarchy
metrics:
  duration_seconds: 126
  completed: 2026-04-12T15:30:54Z
  tasks_completed: 2
  tasks_total: 2
---

# Quick Plan 260412-v5w: Add Community Notices and Offers for You Summary

Dashboard query extended with announcement and promotions queries; resident home page renders both sections conditionally between Recent Tickets and Quick Actions.

## What Was Done

### Task 1: Extend dashboard query (c18e3ad)
- Added `announcementsTable` and `promotionsTable` imports from `@workspace/db/schema`
- Added query for latest non-draft announcement (ordered by `publishedAt desc`, limit 1)
- Added query for top 3 active promotions (ordered by `validFrom desc`, limit 3)
- Both fields returned from `getDashboardData`: `latestAnnouncement` (object or null) and `promotions` (array)

### Task 2: Add UI sections to home page (643a1a6)
- **Community Notices** section: renders latest announcement card with pinned badge, title, and summary; links to `/discover/announcements/{id}`
- **Offers for You** section: renders up to 3 promotion cards with partner name and percentage icon; links to `/discover/promotions/{id}`
- Both sections conditionally rendered only when data exists
- "View all" links navigate to `/discover`

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- TypeScript compiles cleanly (`pnpm --filter web exec -- npx tsc --noEmit` passes with no errors)
- Existing sections (Wallet, Bills, Tickets, Quick Actions) unchanged

## Known Stubs

None - all data is wired to live database queries.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | c18e3ad | Extend dashboard query with announcements and promotions |
| 2 | 643a1a6 | Add Community Notices and Offers for You sections to home page |
