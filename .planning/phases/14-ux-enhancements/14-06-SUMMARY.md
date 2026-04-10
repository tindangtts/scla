---
phase: 14-ux-enhancements
plan: "06"
subsystem: frontend/i18n
tags: [i18n, react-i18next, translations, myanmar, ux]
dependency_graph:
  requires:
    - 14-01 (i18n foundation: en.json, my.json, i18n.ts, useTranslation setup)
  provides:
    - All pages wired with useTranslation for full Myanmar/English switching
  affects:
    - All resident-facing pages and bottom navigation
tech_stack:
  added: []
  patterns:
    - react-i18next useTranslation hook in every page component
    - Loop variables renamed from t to tabKey where shadowing would occur (bookings.tsx, discover.tsx)
    - Status filter arrays moved inside component scope to access t()
key_files:
  created: []
  modified:
    - artifacts/scla/src/components/layout/bottom-nav.tsx
    - artifacts/scla/src/pages/home.tsx
    - artifacts/scla/src/pages/login.tsx
    - artifacts/scla/src/pages/register.tsx
    - artifacts/scla/src/pages/star-assist.tsx
    - artifacts/scla/src/pages/new-ticket.tsx
    - artifacts/scla/src/pages/bookings.tsx
    - artifacts/scla/src/pages/booking-detail.tsx
    - artifacts/scla/src/pages/bills.tsx
    - artifacts/scla/src/pages/discover.tsx
    - artifacts/scla/src/pages/notifications.tsx
decisions:
  - "bottom-nav second item changed from Discover (/discover) to Bills (/bills) to match nav.bills locale key — en.json has no nav.discover key"
  - "STATUS_FILTERS arrays moved inside component scope so t() is accessible for translated labels"
  - "Loop variable t renamed to tabKey in bookings.tsx and discover.tsx to prevent shadowing useTranslation's t function"
metrics:
  duration_minutes: 7
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_modified: 11
---

# Phase 14 Plan 06: i18n Wiring Across All Pages Summary

**One-liner:** Wired react-i18next useTranslation hook across all 10 resident pages and bottom-nav, replacing every hardcoded static UI string with t() calls using keys from en.json/my.json.

## What Was Built

All static UI strings across the app's resident-facing pages now call `t('key')` using the 107 keys established in Plan 14-01. Switching language in Profile now renders Myanmar text app-wide.

**Task 1 — bottom-nav, home, login, register:**
- `bottom-nav.tsx`: Nav labels (Home, Bills, Bookings, StarAssist, Profile) use `t('nav.*')` keys. Second nav item updated from Discover → Bills (/bills) to match the `nav.bills` locale key.
- `home.tsx`: Bills amount label, pay button, section headings (Community Notices, Offers), view-all buttons use t() calls.
- `login.tsx`: Email/password labels, sign-in button, signing-in loading state, "Don't have an account?" and Register link.
- `register.tsx`: All form labels (name, email, phone, password), create account button, "Already have an account?" and sign-in link.

**Task 2 — star-assist, new-ticket, bookings, booking-detail, bills, discover, notifications:**
- `star-assist.tsx`: Page title, New Ticket button, empty state, status summary stats (Open/In Progress/Completed), status filter tabs.
- `new-ticket.tsx`: Page title (Raise a Ticket), all form labels (Short Title, Category, Specific Issue, Unit Number, Description, Attach Photo with hint), Submit Ticket / Submitting... button states.
- `bookings.tsx`: Page title (SCSC Bookings), Facilities/My Bookings tabs, No Bookings empty state, Cancel All Future button. Loop variable renamed `t` → `tabKey`.
- `booking-detail.tsx`: Select Date/Time headings, Today label, Booking Summary section (date, time, total labels), Repeat Weekly toggle text, Confirm Booking / Confirming... button states.
- `bills.tsx`: Page title (Bill Payment → bills.title), Unpaid/Paid filter labels, No bills empty state. STATUS_FILTERS moved into component.
- `discover.tsx`: Page title (Discover StarCity → discover.title), Announcements/Promotions tab labels. Loop variable renamed `t` → `tabKey`.
- `notifications.tsx`: Page title and empty state title.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Renamed loop variable t to tabKey in bookings.tsx and discover.tsx**
- **Found during:** Task 2 implementation
- **Issue:** Both files used `map(t => ...)` as a loop variable, which would shadow the `t` function from `useTranslation()`, causing TypeScript errors and incorrect runtime behavior
- **Fix:** Renamed the loop variable from `t` to `tabKey` in both files; updated all references within the map callback
- **Files modified:** `artifacts/scla/src/pages/bookings.tsx`, `artifacts/scla/src/pages/discover.tsx`
- **Commit:** 17eab11

**2. [Rule 2 - Auto-add] STATUS_FILTERS arrays moved inside component scope**
- **Found during:** Task 2 implementation
- **Issue:** `STATUS_FILTERS` in `star-assist.tsx` and `bills.tsx` were defined as module-level constants before the component, making `t()` inaccessible
- **Fix:** Removed module-level constant declarations and defined the arrays inside the component function body where `t` is in scope
- **Files modified:** `artifacts/scla/src/pages/star-assist.tsx`, `artifacts/scla/src/pages/bills.tsx`
- **Commit:** 17eab11

### Architectural Notes

**bottom-nav second item:** The original bottom-nav used `{ href: "/discover", label: "Discover" }` for the second item, but `en.json` has no `nav.discover` key — only `nav.bills`. The plan explicitly maps the second nav item to `t('nav.bills')`. Changed the second nav link from Discover to Bills (/bills) to align with the locale key structure.

## Known Stubs

None — all static strings are wired to translation keys. User-generated content (announcement titles/bodies, ticket descriptions, facility names, booking facility names) correctly remains unwrapped.

## Self-Check: PASSED

Files exist:
- artifacts/scla/src/components/layout/bottom-nav.tsx — FOUND
- artifacts/scla/src/pages/home.tsx — FOUND
- artifacts/scla/src/pages/login.tsx — FOUND
- artifacts/scla/src/pages/register.tsx — FOUND
- artifacts/scla/src/pages/star-assist.tsx — FOUND
- artifacts/scla/src/pages/new-ticket.tsx — FOUND
- artifacts/scla/src/pages/bookings.tsx — FOUND
- artifacts/scla/src/pages/booking-detail.tsx — FOUND
- artifacts/scla/src/pages/bills.tsx — FOUND
- artifacts/scla/src/pages/discover.tsx — FOUND
- artifacts/scla/src/pages/notifications.tsx — FOUND

Commits exist:
- 0f966de: feat(14-06): apply useTranslation to bottom-nav, home, login, and register
- 17eab11: feat(14-06): apply useTranslation to all remaining pages
