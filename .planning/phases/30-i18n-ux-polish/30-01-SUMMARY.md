---
phase: 30-i18n-ux-polish
plan: 01
subsystem: ui
tags: [next-intl, next-themes, i18n, dark-mode, myanmar, tailwindcss]

requires:
  - phase: 24-foundation
    provides: Next.js App Router layout structure and Tailwind CSS 4 theming
  - phase: 25-authentication
    provides: Supabase Auth middleware and requireAuth/requireAdmin helpers
provides:
  - next-intl i18n infrastructure with cookie-based locale detection (en/my)
  - next-themes dark mode with system detection and manual toggle
  - English and Myanmar translation files (120+ keys across 14 namespaces)
  - ThemeToggle, LocaleSwitcher, and ThemeProvider components
  - Responsive bottom nav (hidden on lg+ breakpoints)
  - Dark mode support on resident header, bottom nav, and admin main area
affects: [30-02, all-future-ui-work]

tech-stack:
  added: [next-intl@4.9, next-themes@0.4]
  patterns: [cookie-based-locale-detection, server-component-getTranslations, client-component-useTranslations]

key-files:
  created:
    - artifacts/web/src/i18n/request.ts
    - artifacts/web/src/i18n/routing.ts
    - artifacts/web/messages/en.json
    - artifacts/web/messages/my.json
    - artifacts/web/src/components/theme-provider.tsx
    - artifacts/web/src/components/theme-toggle.tsx
    - artifacts/web/src/components/locale-switcher.tsx
  modified:
    - artifacts/web/next.config.ts
    - artifacts/web/src/app/layout.tsx
    - artifacts/web/src/app/(resident)/layout.tsx
    - artifacts/web/src/app/(admin)/layout.tsx
    - artifacts/web/src/app/login/page.tsx
    - artifacts/web/src/app/register/page.tsx
    - artifacts/web/src/app/admin/login/page.tsx
    - artifacts/web/src/app/(resident)/more/page.tsx

key-decisions:
  - "Cookie-based locale (NEXT_LOCALE cookie) instead of URL path-based routing to avoid breaking existing routes"
  - "Server Components use getTranslations, Client Components use useTranslations for proper SSR/CSR split"
  - "Theme cycles system -> light -> dark with mounted guard to prevent hydration mismatch"

patterns-established:
  - "i18n server: use getTranslations from next-intl/server in async Server Components"
  - "i18n client: use useTranslations from next-intl in 'use client' components"
  - "Translation keys organized by namespace (nav, header, auth, admin, etc.)"
  - "Dark mode: add dark: variant classes alongside light classes"

requirements-completed: [UX-01, UX-02, UX-03]

duration: 6min
completed: 2026-04-11
---

# Phase 30 Plan 01: i18n + Dark Mode Infrastructure Summary

**next-intl i18n with English/Myanmar translations, next-themes dark mode with system detection, and responsive bottom nav hidden on desktop**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-11T18:26:39Z
- **Completed:** 2026-04-11T18:32:17Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Full i18n infrastructure with cookie-based locale detection supporting English and Myanmar (120+ translation keys)
- Dark mode with system detection, manual toggle cycling system/light/dark, persisted via localStorage
- Responsive bottom nav hidden on lg+ breakpoints, with dark mode support
- Translated nav labels, header, auth pages (login/register/admin-login), and More settings page
- ThemeToggle and LocaleSwitcher available in both resident header and admin sidebar

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create i18n + theme infrastructure** - `2d7b035` (feat)
2. **Task 2: Wire i18n keys into layouts, add dark mode support, fix responsive bottom nav** - `e77d9aa` (feat)

## Files Created/Modified
- `artifacts/web/src/i18n/request.ts` - Cookie-based locale config for next-intl
- `artifacts/web/src/i18n/routing.ts` - Locale constants and types
- `artifacts/web/messages/en.json` - English translations (120+ keys, 14 namespaces)
- `artifacts/web/messages/my.json` - Myanmar translations matching all English keys
- `artifacts/web/src/components/theme-provider.tsx` - next-themes ThemeProvider wrapper
- `artifacts/web/src/components/theme-toggle.tsx` - Theme cycle button (system/light/dark)
- `artifacts/web/src/components/locale-switcher.tsx` - EN/MY toggle with cookie + router.refresh
- `artifacts/web/next.config.ts` - Added next-intl plugin wrapper
- `artifacts/web/src/app/layout.tsx` - Wrapped with ThemeProvider + NextIntlClientProvider
- `artifacts/web/src/app/(resident)/layout.tsx` - Translated nav/header, dark mode classes, lg:hidden nav
- `artifacts/web/src/app/(admin)/layout.tsx` - Translated sidebar, added theme/locale controls
- `artifacts/web/src/app/login/page.tsx` - Translated form labels and buttons
- `artifacts/web/src/app/register/page.tsx` - Translated form labels and buttons
- `artifacts/web/src/app/admin/login/page.tsx` - Translated form labels, dark mode bg
- `artifacts/web/src/app/(resident)/more/page.tsx` - Added settings section with language/theme controls

## Decisions Made
- Cookie-based locale detection (NEXT_LOCALE cookie) to avoid URL path changes and preserve existing routing
- Server Components use `getTranslations` from `next-intl/server`, Client Components use `useTranslations` from `next-intl`
- Theme toggle cycles system -> light -> dark with mounted guard to prevent hydration mismatch

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript error in admin layout translation call**
- **Found during:** Task 2 (admin layout wiring)
- **Issue:** `t(item.key as keyof IntlMessages["admin"])` failed type check because Object.keys returns `string | number | symbol`
- **Fix:** Changed cast to `Parameters<typeof t>[0]` for proper type inference
- **Files modified:** artifacts/web/src/app/(admin)/layout.tsx
- **Verification:** Build passes without type errors
- **Committed in:** e77d9aa (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type fix, no scope change.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- i18n infrastructure ready for incremental translation of remaining pages
- Dark mode foundation in place, remaining pages use shadcn/ui components which inherit CSS variable theming automatically
- Plan 30-02 can build on this for PWA offline support and additional UX polish

## Self-Check: PASSED

All 7 created files verified. Both task commits (2d7b035, e77d9aa) found in git log.

---
*Phase: 30-i18n-ux-polish*
*Completed: 2026-04-11*
