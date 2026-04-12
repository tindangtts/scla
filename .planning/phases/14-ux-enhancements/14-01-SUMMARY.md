---
phase: 14-ux-enhancements
plan: "01"
subsystem: frontend-i18n
tags: [i18n, react-i18next, myanmar, localization, profile]
dependency_graph:
  requires: []
  provides: [i18n-foundation, useLanguage-hook, en-my-translations]
  affects: [artifacts/scla/src/App.tsx, artifacts/scla/src/pages/profile.tsx]
tech_stack:
  added: [react-i18next@17, i18next@26]
  patterns: [localStorage-language-persistence, flat-dot-notation-i18n-keys]
key_files:
  created:
    - artifacts/scla/src/i18n.ts
    - artifacts/scla/src/locales/en.json
    - artifacts/scla/src/locales/my.json
    - artifacts/scla/src/hooks/use-language.ts
  modified:
    - artifacts/scla/src/App.tsx
    - artifacts/scla/src/pages/profile.tsx
    - artifacts/scla/package.json
    - pnpm-lock.yaml
decisions:
  - "i18next hook-based API used (no I18nextProvider wrapper needed) — global i18n instance initialized via import './i18n' in App.tsx"
  - "107 flat dot-notation keys in en.json and my.json covering all static UI strings across nav, bills, tickets, bookings, profile, auth, discover, wallet, info, notifications, upgrade, and offline banners"
  - "Language persisted to localStorage key scla_language; read on init in i18n.ts via localStorage.getItem"
metrics:
  duration_minutes: 8
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_changed: 8
---

# Phase 14 Plan 01: i18n Foundation with Myanmar Translation Summary

**One-liner:** react-i18next configured with 107-key English/Myanmar translation files; language toggle added to profile page with localStorage persistence via scla_language key.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Install react-i18next and create translation files | c8fe631 | i18n.ts, en.json (107 keys), my.json (107 keys), package.json |
| 2 | Wire I18nextProvider into App.tsx and add language toggle to profile | b15cb71 + prior | App.tsx, use-language.ts, profile.tsx |

## What Was Built

- **react-i18next + i18next** installed as dependencies in `artifacts/scla`
- **`src/i18n.ts`**: Initializes i18next with `initReactI18next`, loads en/my resources, reads `scla_language` from localStorage as initial language, falls back to 'en'
- **`src/locales/en.json`**: 107 English translation keys covering all static UI strings (nav, bills, tickets, bookings, profile, auth, discover, wallet, info, notifications, upgrade, offline)
- **`src/locales/my.json`**: 107 Myanmar (Burmese) translation keys with correct Burmese script for every key in en.json
- **`src/hooks/use-language.ts`**: `useLanguage()` hook exposing `language` and `setLanguage(lang)` — `setLanguage` calls `i18n.changeLanguage()` and persists to `localStorage.setItem('scla_language', lang)`
- **`App.tsx`**: `import './i18n'` added as first import, initializing i18next for the entire app
- **`profile.tsx`**: Language toggle card added to App Settings section with English and Myanmar pill buttons (`data-testid="button-lang-en"` and `data-testid="button-lang-my"`), Globe2 icon header

## Deviations from Plan

None - plan executed exactly as written.

Note: App.tsx and profile.tsx modifications were confirmed present in HEAD. In a parallel execution environment, these changes were already committed by concurrent plan 14-02 (theme toggle). The i18n import and language toggle additions verified present via `git show HEAD`.

## Known Stubs

None — translation keys are fully populated with real English and Burmese content. Language toggle wires directly to `useLanguage()` hook backed by i18next + localStorage.

## Self-Check: PASSED

- `artifacts/scla/src/i18n.ts` — FOUND
- `artifacts/scla/src/locales/en.json` — FOUND (107 keys)
- `artifacts/scla/src/locales/my.json` — FOUND (107 keys, matching en.json)
- `artifacts/scla/src/hooks/use-language.ts` — FOUND
- `App.tsx` has `import './i18n'` — VERIFIED in HEAD
- `profile.tsx` has `use-language`, `Globe2`, `button-lang-en`, `button-lang-my` — VERIFIED in HEAD
- Commits c8fe631 and b15cb71 — FOUND in git log
