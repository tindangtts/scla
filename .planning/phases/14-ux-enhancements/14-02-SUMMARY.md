---
phase: 14-ux-enhancements
plan: "02"
subsystem: frontend-theming
tags: [dark-mode, tailwind-css, localStorage, react-hooks, css-variables]
dependency_graph:
  requires: []
  provides: [dark-mode-css-variables, useTheme-hook, theme-toggle-profile]
  affects: [artifacts/scla/src/index.css, artifacts/scla/src/App.tsx, artifacts/scla/src/pages/profile.tsx]
tech_stack:
  added: []
  patterns: [css-custom-properties-dark-mode, tailwind-dark-variant, react-hook-localStorage-sync, matchMedia-system-preference]
key_files:
  created:
    - artifacts/scla/src/hooks/use-theme.ts
  modified:
    - artifacts/scla/src/index.css
    - artifacts/scla/src/App.tsx
    - artifacts/scla/src/pages/profile.tsx
decisions:
  - useTheme hook reads localStorage scla_theme on init and falls back to system preference
  - ThemeInitializer component placed inside QueryClientProvider as first child to ensure dark class applied before render
  - Dark palette uses teal primary at hsl(185 62% 42%) — slightly lighter than light mode to maintain visibility on dark backgrounds
metrics:
  duration: "2m 13s"
  completed: "2026-04-10"
  tasks_completed: 2
  files_modified: 4
---

# Phase 14 Plan 02: Dark Mode System Summary

Dark mode implementation with CSS variable overrides, useTheme hook with system preference detection and localStorage persistence, html-class injection via ThemeInitializer in App.tsx, and Light/System/Dark toggle pills on the profile page.

## What Was Built

### Task 1: Dark mode CSS variables and useTheme hook

Added a `.dark { ... }` block to `artifacts/scla/src/index.css` immediately after the `:root` block. The dark palette:
- Uses `hsl(222 20% 10%)` for backgrounds and `hsl(220 15% 92%)` for foreground text
- Keeps teal primary at `hsl(185 62% 42%)` (slightly brighter than light mode's 32% for dark background visibility)
- Dark cards at `hsl(222 20% 14%)`, dark sidebar retains teal identity

Created `artifacts/scla/src/hooks/use-theme.ts` exporting `useTheme` and `Theme` type:
- Reads `localStorage.getItem('scla_theme')` on init, defaults to `'system'`
- `resolvedTheme` computed synchronously from `window.matchMedia`
- `useEffect` applies/removes `dark` class on `document.documentElement` when `resolvedTheme` changes
- Second `useEffect` registers `matchMedia` change listener when theme is `'system'` to respond to OS preference changes at runtime

### Task 2: ThemeInitializer in App.tsx and theme toggle on profile page

`App.tsx`: Added `ThemeInitializer` component (calls `useTheme()`, returns null) rendered as first child of `QueryClientProvider` — ensures dark class is applied on app mount before any UI renders.

`profile.tsx`: Added App Settings card with three pill buttons (Light / System / Dark):
- Active pill: `bg-primary text-primary-foreground`
- Inactive pill: `bg-muted text-muted-foreground`
- Data-testid: `button-theme-light`, `button-theme-system`, `button-theme-dark`
- Moon icon used for the theme row label

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `0b4eec4` | feat(14-02): add dark mode CSS variables and useTheme hook |
| Task 2 | `8689100` | feat(14-02): wire ThemeInitializer into App.tsx and add theme toggle to profile page |

## Deviations from Plan

### Auto-fixed Issues

None - plan executed exactly as written.

### Notes

- Build verification via `pnpm --filter scla build` failed due to pre-existing environment issue: missing `@rollup/rollup-darwin-arm64` native module. This is an environment setup issue unrelated to these changes. TypeScript check confirmed no new errors introduced by this plan's files.
- Parallel agent (14-01) modified `App.tsx` and `profile.tsx` concurrently, adding `import './i18n'` and `useLanguage` imports. These are compatible additions that do not conflict with this plan's changes.

## Known Stubs

None — all theme functionality is fully wired. The toggle on the profile page stores preference in localStorage, applies the dark class to the HTML element, and responds to system preference changes.

## Self-Check: PASSED

- `artifacts/scla/src/hooks/use-theme.ts` — EXISTS
- `artifacts/scla/src/index.css` contains `.dark` block — VERIFIED (line 151)
- `artifacts/scla/src/App.tsx` contains `ThemeInitializer` — VERIFIED
- `artifacts/scla/src/pages/profile.tsx` contains `button-theme-light/system/dark` — VERIFIED
- Commit `0b4eec4` — EXISTS
- Commit `8689100` — EXISTS
