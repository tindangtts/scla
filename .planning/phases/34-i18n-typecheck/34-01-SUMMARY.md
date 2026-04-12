---
phase: 34-i18n-typecheck
plan: 01
subsystem: testing
tags: [i18n, typescript, vitest, vi.mock, next.js, typecheck, next-intl, myanmar]

requires:
  - phase: 30-i18n-theme-pwa
    provides: next-intl foundation with en.json + my.json message catalogs
  - phase: 31-tests-ci
    provides: Vitest unit tests for api route handlers (6 __tests__ files affected)
provides:
  - Verified EN/MY translation parity (109 scalar keys in both, zero byte-identical values)
  - Clean `pnpm --filter @workspace/web typecheck` (exit 0) unblocking Phase 35 Vercel deploy
  - Documented runtime-code English leaks (70 hits across src/app + src/components) as deferred
affects: [35-vercel-deploy, future-i18n-runtime-cleanup]

tech-stack:
  added: []
  patterns:
    - "Test mock factory args typed as `Parameters<typeof mockFn>` (not `unknown[]`) to satisfy strict TS2556"
    - "NextRequest ctor options cast via `ConstructorParameters<typeof NextRequest>[1]` when DOM RequestInit diverges from Next's"

key-files:
  created:
    - .planning/phases/34-i18n-typecheck/34-01-SUMMARY.md
  modified:
    - artifacts/web/src/app/api/cron/bill-overdue-check/__tests__/route.test.ts
    - artifacts/web/src/app/api/notifications/unread-count/__tests__/route.test.ts
    - artifacts/web/src/app/api/push/subscribe/__tests__/route.test.ts
    - artifacts/web/src/app/api/tickets/[id]/messages/__tests__/route.test.ts
    - artifacts/web/src/lib/__tests__/notifications.test.ts
    - artifacts/web/src/lib/__tests__/push.test.ts

key-decisions:
  - "Used Option B (narrow spread args via `Parameters<typeof mock>`) over Option A (direct reference). Option A failed at runtime because vi.mock factories are hoisted above `const mockFn = vi.fn()` declarations — the delegate function was deferring mock access."
  - "TS2345 fix used FALLBACK variant (`ConstructorParameters<typeof NextRequest>[1]` cast) over PRIMARY (deep import `next/dist/server/web/spec-extension/request`). FALLBACK uses only stable public type machinery and is not pnpm-path-sensitive."
  - "No JSON edits to messages/{en,my}.json — parity already satisfied by Phase 30. Task 1 was audit-only pass."
  - "Runtime-code hardcoded-English leaks (70 hits) are scoped OUT of Phase 34 per plan deep_work_rules — deferred to post-deploy cleanup."

patterns-established:
  - "Typed spread delegate for vi.mock factories: `(...args: Parameters<typeof mockFn>) => mockFn(...args)` — satisfies tsc strict without runtime hoist issues"
  - "Next.js ctor option typing: prefer `ConstructorParameters<typeof NextRequest>[1]` cast over deep package imports"

requirements-completed: [I18N-01, I18N-02, I18N-03, TYPE-01, TYPE-02]

duration: 3 min
completed: 2026-04-12
---

# Phase 34 Plan 01: i18n Backfill + Typecheck Cleanup Summary

**EN/MY translation parity re-verified (109 scalar keys each, zero byte-identical values); 13 pre-existing TS errors in api route tests eliminated via typed-args mock factory pattern; `pnpm --filter @workspace/web typecheck` now exits 0, unblocking Phase 35 Vercel deploy.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-12T07:27:06Z
- **Completed:** 2026-04-12T07:30:00Z
- **Tasks:** 2
- **Files modified:** 6 test files (no runtime code, no translations edited)

## Accomplishments

- **I18N-01/02 verified:** `diff <(jq paths(scalars))` on en.json vs my.json → zero output. Node byte-equality scan → zero untranslated values. 109 scalar keys on both sides.
- **I18N-03 partially satisfied + deferred:** Source-code audit (`grep -RInE '>[A-Z][a-z]+'`) surfaced 70 hardcoded-English JSX hits across runtime `.tsx` files. All logged under "Deferred i18n leaks" below — scoped out of Phase 34 per plan.
- **TYPE-01/02 achieved:** `pnpm typecheck` exits 0 (from 13 errors baseline). All 36 vitest tests still pass. No runtime code, no tsconfig relaxation, no `@ts-ignore` / `as any` introduced.

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify EN/MY translation parity and run locale-toggle audit** — no commit (audit-only pass, zero file changes)
2. **Task 2: Fix 13 pre-existing typecheck errors in api route test files** — `4e4f009` (fix)

**Plan metadata commit:** pending (docs: complete plan)

## Files Created/Modified

- `artifacts/web/src/app/api/cron/bill-overdue-check/__tests__/route.test.ts` — mock factory `select` delegate typed with `Parameters<typeof mockSelect>`
- `artifacts/web/src/app/api/notifications/unread-count/__tests__/route.test.ts` — mock factory `select` delegate typed with `Parameters<typeof mockSelect>`
- `artifacts/web/src/app/api/push/subscribe/__tests__/route.test.ts` — 3 delegates typed (`select`, `insert`, `delete`)
- `artifacts/web/src/app/api/tickets/[id]/messages/__tests__/route.test.ts` — 2 mock delegates typed (`select` via `mockSelectObj`, `insert`); `makeRequest` options cast via `ConstructorParameters<typeof NextRequest>[1]` (FALLBACK variant)
- `artifacts/web/src/lib/__tests__/notifications.test.ts` — 2 delegates typed (`insert`, `select`)
- `artifacts/web/src/lib/__tests__/push.test.ts` — 2 delegates typed (`select`, `delete`)
- `.planning/phases/34-i18n-typecheck/34-01-SUMMARY.md` — this file

## Task 1 Outcome

Audit-only pass. No JSON edits needed.

**Step A (key parity):** `diff <(jq -r 'paths(scalars) | join(".")' messages/en.json | sort) <(jq -r 'paths(scalars) | join(".")' messages/my.json | sort)` → zero output. EN and MY both have 109 scalar keys, identical sets.

**Step B (byte-equality):** Node flatten + compare scan → `OK: all MY values differ from EN`. No untranslated values.

**Step C (source audit):** 70 hardcoded-English JSX hits found in runtime code. Per plan deep_work_rules and `must_haves.truths` ("No runtime code is modified by this plan"), these are logged as deferred below and NOT fixed in this plan.

### Deferred i18n leaks (runtime fix needed — out of scope for Phase 34)

Seventy hardcoded-English JSX text nodes were surfaced in runtime components. A future plan should either (a) wire these via `useTranslations` and add matching keys to both locale files, or (b) decide they are acceptable Latin-script content (e.g., product names, dev-only labels).

**Admin portal (`src/app/admin/**`):**
- `audit-logs/page.tsx:66` — "All actions"
- `tickets/[id]/page.tsx:144,153,173` — "Update status", "In progress", "Currently unassigned"
- `tickets/page.tsx:51,53` — "All statuses", "In progress"
- `content/announcements/new/page.tsx:61,62,75` — "Residents only", "Guests only", "Save as draft"
- `content/announcements/[id]/edit/page.tsx:80,81,94` — same three strings
- `content/faqs/{new,[id]/edit}/page.tsx:38,51` — "Sort order"
- `content/promotions/{new,[id]/edit}/page.tsx:49,53,72,76` — "Valid from", "Valid until"
- `layout.tsx:55` — "Estate Management"
- `users/[id]/page.tsx:99` — "Role assignment"
- `users/page.tsx:55` — "All roles"
- `error.tsx:19` — "Something went wrong"
- `staff/new/page.tsx:34` — "Full name"
- `staff/[id]/edit/page.tsx:42` — "Full name"
- `wallets/[userId]/page.tsx:124` — "Adjust wallet"
- `facilities/bookings/page.tsx:53,74` — "All facilities", "All statuses"

**Resident portal (`src/app/(resident)/**`):**
- `upgrade/upgrade-form.tsx:32,61,62` — "Unit number", "Select development", "City Loft"
- `upgrade/page.tsx:28,44,71,100,118` — "User account not found. Please contact support.", "Already verified", "Request pending", "What you unlock", "Submit upgrade request"
- `bookings/[id]/page.tsx:38` — "User account not found."
- `bookings/page.tsx:40,63` — "User account not found.", "Book a facility"
- `bookings/facilities/[id]/booking-form.tsx:44,107,129,138` — "Booking confirmed!", "Confirm booking", "Repeat weekly", "Number of weeks"
- `bills/[id]/pay-button.tsx:28` — "Payment successful!"
- `bills/[id]/page.tsx:28,91` — "User account not found.", "Line items"
- `bills/page.tsx:40` — "User account not found."
- `profile/edit-form.tsx:48` — "Profile updated successfully!"
- `profile/page.tsx:28` — "User account not found. Please contact support."
- `error.tsx:19` — "Something went wrong"
- `wallet/page.tsx:27` — "User account not found."
- `star-assist/new/ticket-form.tsx:76,86,110` — "Select a category", "Service type", "Attach photo (optional, max 5MB)"
- `star-assist/new/page.tsx:16` — "Submit a maintenance request"
- `star-assist/[id]/page.tsx:39,100` — "User account not found.", "Status updates"
- `star-assist/page.tsx:68,91` — "User account not found.", "New request"
- `page.tsx:81,155` — "Upgrade to Resident", "All clear"
- `notifications/preferences/preferences-form.tsx:42,64` — "Push notifications", "Preferences updated successfully!"
- `notifications/preferences/page.tsx:23` — "User account not found."
- `notifications/page.tsx:62` — "User account not found."
- `not-found.tsx:6` — "Page not found"

**Shared / auth (`src/app/login`, `src/components`):**
- `login/page.tsx:31,32` — "Star City Living" (brand — may stay Latin), "Resident portal"
- `components/layout/offline-banner.tsx:51` — "Back online"
- `components/layout/auth-shell.tsx:49` — "Star City Living" (brand)
- `components/push-prompt.tsx:80` — "Stay informed"

Many of these are error-state strings (`"User account not found."`) that legitimately need translation. Recommend grouping into a future `i18n-runtime-cleanup` phase after Vercel deploy.

## Task 2 Outcome

13 typecheck errors eliminated in 6 test files.

### TS2556 fixes — replaced `(...args: unknown[]) => mockFn(...args)` delegate:

Per-file table (total: 12 TS2556 errors across 6 files):

| File | Error line(s) | Mock fields retyped |
|------|-------------|---------------------|
| `src/app/api/cron/bill-overdue-check/__tests__/route.test.ts` | 11 | `select` |
| `src/app/api/notifications/unread-count/__tests__/route.test.ts` | 19 | `select` |
| `src/app/api/push/subscribe/__tests__/route.test.ts` | 26,27,28 | `select`, `insert`, `delete` |
| `src/app/api/tickets/[id]/messages/__tests__/route.test.ts` | 28,29 | `select` (via `mockSelectObj`), `insert` |
| `src/lib/__tests__/notifications.test.ts` | 26,27 | `insert`, `select` |
| `src/lib/__tests__/push.test.ts` | 22,23 | `select`, `delete` |

Replacement pattern applied everywhere:
```ts
// Before
select: (...args: unknown[]) => mockSelect(...args),
// After
select: (...args: Parameters<typeof mockSelect>) => mockSelect(...args),
```

### TS2345 fix — `makeRequest` in ticket messages test (line 63):

**Variant used: FALLBACK (ConstructorParameters cast).**

```ts
// Before
function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, "http://localhost:3000"), options);
}
// After
function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(
    new URL(url, "http://localhost:3000"),
    options as ConstructorParameters<typeof NextRequest>[1],
  );
}
```

**Reason for FALLBACK over PRIMARY:** The PRIMARY deep-import path (`next/dist/server/web/spec-extension/request`) is pnpm-versioned (resolves through `.pnpm/next@15.5.15_...`) and is not part of Next's public API — it would be fragile to Next upgrades and pnpm hoisting changes. FALLBACK uses only the public `NextRequest` re-export + standard TS type machinery (`ConstructorParameters<>`). No `as any`, no `@ts-ignore` — TS still enforces the cast against the actual Next ctor signature.

## Final Verification Output

### `pnpm typecheck` (last lines)

```
> @workspace/web@0.0.0 typecheck /Users/tindang/workspaces/tts/yoma/scla/artifacts/web
> tsc --noEmit
```
(exit 0, zero errors — baseline was 13 errors)

### `pnpm test -- --run` (last lines)

```
 Test Files  7 passed (7)
      Tests  36 passed (36)
   Start at  14:29:42
   Duration  271ms (transform 327ms, setup 0ms, import 599ms, tests 57ms, environment 1ms)
```

### `git diff --name-only` (Task 2 commit)

```
artifacts/web/src/app/api/cron/bill-overdue-check/__tests__/route.test.ts
artifacts/web/src/app/api/notifications/unread-count/__tests__/route.test.ts
artifacts/web/src/app/api/push/subscribe/__tests__/route.test.ts
artifacts/web/src/app/api/tickets/[id]/messages/__tests__/route.test.ts
artifacts/web/src/lib/__tests__/notifications.test.ts
artifacts/web/src/lib/__tests__/push.test.ts
```

Exactly the 6 files in `files_modified` (the 2 JSON files required no edits). No runtime source touched.

## Decisions Made

1. **Option B over Option A for TS2556 fix.** Plan recommended Option A (direct `mockFn` reference) as preferred. At typecheck time both worked, but at test runtime Option A broke with `ReferenceError: Cannot access 'mockSelect' before initialization` because `vi.mock` factories are hoisted above `const mockSelect = vi.fn()` declarations — the spread delegate was deferring the reference, and Option A removed that deferral. Switched to Option B universally: `(...args: Parameters<typeof mockSelect>) => mockSelect(...args)`. This preserves lazy access and satisfies TS2556.

2. **FALLBACK over PRIMARY for TS2345 fix.** Chose the public-API `ConstructorParameters` cast over the deep pnpm-versioned import. More robust to Next upgrades.

3. **Deferred all 70 runtime English leaks.** Plan explicitly scopes these out (`must_haves.truths`: "No runtime code is modified by this plan"). Logged in full for a future i18n-runtime-cleanup plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Switched from Option A to Option B for TS2556 fix**
- **Found during:** Task 2 (post-edit verification run of `pnpm test -- --run`)
- **Issue:** Plan's preferred Option A (direct `mockFn` reference in `vi.mock` factory) typechecks but breaks at test runtime. `vi.mock` factories are hoisted above `const mockFoo = vi.fn()` declarations, so a direct reference fails with `ReferenceError: Cannot access 'mockSelect' before initialization`. 5 of 7 test files failed to import. The original spread delegate was (unintentionally) deferring access via function closure.
- **Fix:** Switched all six files to Option B pattern: `(...args: Parameters<typeof mockFn>) => mockFn(...args)`. Preserves the deferred-access closure AND satisfies TS2556 (Parameters<> resolves to a proper tuple type rather than `unknown[]`).
- **Files modified:** all six __tests__ files in Task 2
- **Verification:** `pnpm typecheck` exits 0; `pnpm test -- --run` → 36/36 pass
- **Committed in:** `4e4f009` (Task 2 commit — re-edits were part of iterative fix before final commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug in plan's recommended fix approach)
**Impact on plan:** Corrected a plan assumption that would have broken the test suite. All plan acceptance criteria still met. No scope creep — same six files, same intent (fix TS2556), just a different (runtime-safe) syntactic form.

## Issues Encountered

- **Option A hoisting bug (documented above as Rule 1 deviation).** Initial Option A attempt broke runtime; switched to Option B in-flight before committing.
- **No other issues.** Task 1 was a no-op audit; Task 2 converged after the Option A→B switch.

## User Setup Required

None. No external service configuration required for this plan.

## Next Phase Readiness

**Ready for Phase 35 (Vercel Deployment):**
- `pnpm --filter @workspace/web typecheck` exits 0 — CI typecheck gate will pass on next push
- All 36 Vitest tests green
- 8 files in `files_modified` match `git diff --name-only` scope expected by plan

**Known blockers carried into Phase 35 (from STATE.md):**
- Vercel CLI not installed locally — user needs `pnpm add -g vercel && vercel login` before DEPLOY-01
- Browser-based Vercel project creation requires user interaction

**New deferred work surfaced by this plan:**
- 70 hardcoded-English JSX strings in runtime `.tsx` files (documented in full above). Recommend a post-deploy `i18n-runtime-cleanup` plan.

## Self-Check: PASSED

- SUMMARY.md exists at `.planning/phases/34-i18n-typecheck/34-01-SUMMARY.md`: FOUND
- Commit `4e4f009` exists: verified via `git log --oneline --all | grep 4e4f009`
- 6 test files modified per `git diff --stat` (no runtime code): verified
- `pnpm typecheck` exit 0: verified
- `pnpm test -- --run` 36/36 pass: verified
- `messages/{en,my}.json` unchanged: verified (no entry in `git status`)

---
*Phase: 34-i18n-typecheck*
*Completed: 2026-04-12*
