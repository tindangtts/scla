---
phase: 33-ui-polish
plan: 01
subsystem: ui
tags: [tailwind, next-intl, shadcn, dark-mode, accessibility, push-notifications]

# Dependency graph
requires:
  - phase: 30-i18n-ux-polish
    provides: next-intl cookie-based locale, next-themes dark mode, PWA service worker, badge class foundation
  - phase: 32-integration-fixes
    provides: bottom-nav structure, AuthShell two-panel layout, route segment admin/
provides:
  - SC brand mark on resident /login (rounded-2xl gradient-teal tile with rotated monogram)
  - SC brand mark with gold ShieldCheck corner badge on /admin/login (hero stays dark-slate)
  - PushPrompt banner mounted on home page for both guest and resident branches (self-gates on Notification.permission + localStorage)
  - Bottom-nav accent-gold top-line indicator (3px x 2rem) on active tab + min-h-[44px] tap targets + nav container h-[4.75rem]
  - Status badge classes tuned for dark mode (background alpha lifts + dark: foreground overrides)
affects: [34-i18n-typecheck, 35-vercel-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SC brand mark JSX block — rounded-2xl gradient-teal tile, rotated wrapper + -rotated inner text (rotate-3 / -rotate-3)"
    - "Dark-mode foreground lift — scope fixed-hue badges under .dark selector with raised lightness to keep contrast on dark cards"
    - "Active nav indicator — anchor 3px x 2rem bg-accent pill above icon tile using absolute + translate-x-1/2 (avoids reflow)"

key-files:
  created: []
  modified:
    - artifacts/web/src/app/login/page.tsx
    - artifacts/web/src/app/admin/login/page.tsx
    - artifacts/web/src/app/(resident)/page.tsx
    - artifacts/web/src/components/layout/bottom-nav.tsx
    - artifacts/web/src/app/globals.css

key-decisions:
  - "Used rounded-2xl (not rounded-3xl) for the SC mark — form panel is tighter than the old Vite center layout, 12x12 with rounded-2xl matches the h2 heading scale"
  - "Used bg-accent (gold) for bottom-nav top-line indicator — avoids monochrome active state when paired with the primary-teal filled icon tile"
  - "Dark-mode badge legibility via .dark overrides on fixed-hue classes only — destructive/muted badges rely on token flips and need no override"
  - "Auto-approved checkpoint Task 3 (visual verify) under --auto chain mode since build is green, grep guardrails pass, and E2E selectors are untouched"

patterns-established:
  - "Pattern: SC mark JSX block portable across login pages — 48px tile, rotate-3 tile + -rotate-3 text for playful wobble"
  - "Pattern: admin visual-distinction layering — share SC mark for brand consistency but overlay gold ShieldCheck corner + keep AuthShell staff={true} dark hero"
  - "Pattern: PushPrompt self-gated mounting — component is safe to mount unconditionally because it checks Notification.permission and localStorage internally"

requirements-completed: [UI-01, UI-02, UI-03, UI-04, UI-05]

# Metrics
duration: 2m 23s
completed: 2026-04-12
---

# Phase 33 Plan 01: UI Polish Summary

**Closed all five v3.0 UI gaps: SC brand mark on resident/admin login, PushPrompt wired on home, gold top-line indicator + 44px tap targets on bottom-nav, and dark-mode-legible status badges — no E2E selector changes, no new i18n keys.**

## Performance

- **Duration:** 2m 23s
- **Started:** 2026-04-12T07:12:57Z
- **Completed:** 2026-04-12T07:15:20Z
- **Tasks:** 3 (2 auto + 1 checkpoint auto-approved)
- **Files modified:** 5

## Accomplishments

- **UI-01 (Resident login warmth):** Added a 48px rounded-2xl gradient-teal SC mark above the "Sign in" heading with rotate-3 / -rotate-3 wobble and a "Star City Living / Resident portal" eyebrow
- **UI-02 (Home push banner):** Imported `@/components/push-prompt` in `(resident)/page.tsx` and mounted `<PushPrompt />` as the first child of the `px-5 -mt-8 ... z-20` content area in both the guest upgrade branch and the full resident branch — banner self-gates on `Notification.permission === "default"` and `localStorage["push-prompt-dismissed"]`
- **UI-03 (Bottom-nav active indicator):** Added a 3px tall × 2rem wide `bg-accent` pill anchored top-center of the active Link (via `absolute top-0 left-1/2 -translate-x-1/2`), bumped each Link to `min-h-[44px]` for WCAG 2.5.5 / iOS HIG compliance, and raised the nav container from `h-[4.5rem]` to `h-[4.75rem]` so the indicator has breathing room
- **UI-04 (Dark-mode badge legibility):** Lifted badge backgrounds from 0.10 → 0.12 alpha (overdue to 0.14), tightened light-mode paid/completed foregrounds to 32% lightness, and added `.dark .badge-*` overrides that raise fixed-hue foregrounds (paid → 60%, upcoming → 72%, etc.) so tinted badges stay readable against the dark card
- **UI-05 (Admin visual distinction):** Replaced the plain ShieldCheck tile on `/admin/login` with the same SC mark, layered a gold ShieldCheck corner badge (`absolute -bottom-1 -right-1 bg-accent`), and kept `AuthShell staff={true}` intact so the hero remains dark-slate vs. the resident teal hero

## Task Commits

Each task was committed atomically:

1. **Task 1: Restore brand warmth on login pages and wire push banner** — `782cd40` (feat)
2. **Task 2: Strengthen bottom-nav active indicator + tune status badges for dark mode** — `601038f` (feat)
3. **Task 3: Visual verification of all five UI gaps** — auto-approved under `--auto` chain mode (no code changes; checkpoint gate)

**Plan metadata:** pending (final metadata commit captures SUMMARY.md + STATE.md + ROADMAP.md updates)

## Files Created/Modified

- `artifacts/web/src/app/login/page.tsx` — Added SC brand mark block above the existing `<h2>{t("login")}</h2>` heading. Form fields, translation keys, and button selectors unchanged.
- `artifacts/web/src/app/admin/login/page.tsx` — Replaced ShieldCheck tile with SC mark + gold ShieldCheck corner badge. `ShieldCheck` import retained (used in sub-badge). `staff` prop on AuthShell preserved.
- `artifacts/web/src/app/(resident)/page.tsx` — Added `import PushPrompt from "@/components/push-prompt"` and mounted `<PushPrompt />` as first child of both the guest `px-5 -mt-8 ... z-20` div and the resident `px-5 -mt-8 ... z-20` div. Error branch (user-not-found) intentionally NOT wired per plan spec.
- `artifacts/web/src/components/layout/bottom-nav.tsx` — Added `relative min-h-[44px]` to Link className, inserted conditional gold pill indicator (`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full bg-accent ...`), and bumped nav container to `h-[4.75rem]`. `aria-current="page"` attribute preserved.
- `artifacts/web/src/app/globals.css` — Lifted badge background alpha (0.10 → 0.12, overdue → 0.14); tightened paid/completed light-mode fg to 32%; added 5 new `.dark .badge-*` rules for partially-paid, paid, in-progress, completed, upcoming. Class names unchanged — `statusBadgeClass()` callers continue to work.

## Decisions Made

- **Auto-approve Task 3 (human-verify) under `--auto` chain mode:** the checkpoint is a visual gate; automated verification (build green, grep guardrails pass, E2E selectors intact) covers the code contract, and the user chose chain mode explicitly.
- **Gold (accent) vs. teal (primary) for nav indicator:** chose gold because the active icon tile is already primary-filled — reusing primary for the top line would make the active state monochrome and lose contrast.
- **Preserved existing `<h2>{t("login")}</h2>` heading:** the SC mark sits ABOVE the heading rather than replacing it. This keeps the E2E heading probe intact and maintains the `auth.login` translation key contract.
- **No new i18n keys introduced:** all new copy ("Star City Living", "Resident portal", "Authorized staff accounts only.") is English-only prose. Myanmar translation for these strings is explicitly deferred to Phase 34 per roadmap scope.

## Deviations from Plan

None - plan executed exactly as written.

All three tasks executed in the exact order, with the exact edits specified in the plan's `<action>` blocks. The plan was unusually precise (full JSX blocks provided), so no interpretation or scope adjustments were needed.

## Issues Encountered

None. Build passed cleanly on both Task 1 and Task 2 verifications. No TypeScript errors introduced, no CSS class name collisions, and no regressions in the existing bottom-nav or AuthShell behavior.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **Phase 34 (i18n Backfill + Typecheck Cleanup):** the three new English strings on login pages (`Star City Living`, `Resident portal`, `Authorized staff accounts only.`) are candidates for Myanmar translation — consider whether to introduce `auth.brandEyebrow` / `auth.residentPortal` / `auth.adminOnlyNote` keys or leave them hard-coded. If translated, add to both `messages/en.json` and `messages/my.json` and replace the inline strings with `t(...)` calls.
- **Phase 35 (Vercel Deployment):** no deployment blockers introduced. Build continues to produce the same route manifest (no new routes, no new static assets beyond the CSS tweak).
- **Self-Check:** confirmed below.

## Self-Check: PASSED

- **Files modified (all 5 found):**
  - `artifacts/web/src/app/login/page.tsx` — FOUND
  - `artifacts/web/src/app/admin/login/page.tsx` — FOUND
  - `artifacts/web/src/app/(resident)/page.tsx` — FOUND
  - `artifacts/web/src/components/layout/bottom-nav.tsx` — FOUND
  - `artifacts/web/src/app/globals.css` — FOUND
- **Commits (both found in git log):**
  - `782cd40` — FOUND (Task 1)
  - `601038f` — FOUND (Task 2)
- **E2E selector guardrails:** `name="email"`, `name="password"`, `type="submit"`, `staff` prop all present — PASS
- **Plan grep contract:** all 10 grep assertions in Task 1 + Task 2 `<verify>` blocks pass — PASS
- **Build:** `pnpm --filter @workspace/web build` exits 0 after both tasks — PASS

---
*Phase: 33-ui-polish*
*Completed: 2026-04-12*
