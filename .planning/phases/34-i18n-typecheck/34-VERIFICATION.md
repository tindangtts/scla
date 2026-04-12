---
phase: 34-i18n-typecheck
verified: 2026-04-11T00:00:00Z
status: human_needed
score: 5/6 must-haves verified
human_verification:
  - test: "Toggle locale EN↔MY on resident home (/), bills (/bills), and admin dashboard (/admin)"
    expected: "All visible UI text switches to Myanmar script; no English fallback leaks into MY mode except known-deferred runtime hardcoded strings"
    why_human: "Visual UI rendering and user flow through locale toggle cannot be verified programmatically — needs browser check"
  - test: "Push a commit to a feature branch and open a PR against main"
    expected: "GitHub Actions CI workflow 'lint-typecheck-test' runs and the Typecheck step exits 0"
    why_human: "Live CI execution on GitHub requires a real push/PR — only the local equivalent (pnpm typecheck) has been verified"
---

# Phase 34: i18n Backfill + Typecheck Cleanup — Verification Report

**Phase Goal:** Myanmar speakers see full translations across every route, and CI typecheck runs clean on every PR/push
**Verified:** 2026-04-11
**Status:** human_needed (all automated checks pass; manual locale-toggle audit + live CI run remain)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from success criteria + must_haves)

| #   | Truth                                                                                         | Status       | Evidence                                                                                                     |
| --- | --------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| 1   | Translation key paths in messages/en.json and messages/my.json are identical sets             | VERIFIED     | `diff <(jq paths)` produced zero output; 109 scalar keys on both sides                                       |
| 2   | Every scalar value in my.json is a real Myanmar translation (no byte-identical EN values)     | VERIFIED     | Node flatten + compare scan → "OK: all MY values differ from EN" (109/109 translated)                        |
| 3   | `pnpm --filter @workspace/web typecheck` exits with code 0                                    | VERIFIED     | Local run: `tsc --noEmit` exit 0, zero errors                                                                |
| 4   | Zero TS2556 spread-arg errors across the six listed test files                                | VERIFIED     | typecheck clean; all six files use `Parameters<typeof mockFn>` pattern                                       |
| 5   | Zero TS2345 RequestInit errors in tickets messages test                                       | VERIFIED     | typecheck clean; `ConstructorParameters<typeof NextRequest>[1]` cast applied at line 65                      |
| 6   | No runtime code (src/app, src/components, src/lib excluding __tests__) modified               | VERIFIED     | Commit 4e4f009 stat: only 6 __tests__ files, 15+/12- lines                                                   |
| 7   | Full EN↔MY locale toggle pass (audit/visual) — Success Criterion 3                            | NEEDS HUMAN  | Cannot verify UI rendering programmatically; SUMMARY documents 70 deferred runtime leaks                     |
| 8   | CI typecheck step passes on every push/PR — Success Criterion 5                               | NEEDS HUMAN  | `.github/workflows/ci.yml` exists with Typecheck step on push/PR to main; needs live CI run to confirm green |

**Score:** 6/6 programmatic truths verified. 2 truths require human verification.

### Required Artifacts

| Artifact                                                                                     | Expected                                                 | Status   | Details                                                                                            |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `artifacts/web/messages/en.json`                                                             | Canonical EN source, contains "nav"                      | VERIFIED | 109 scalar keys; has `nav` namespace with 5 keys                                                   |
| `artifacts/web/messages/my.json`                                                             | Complete MY translations, contains "nav"                 | VERIFIED | 109 scalar keys; `nav.home = "ပင်မ"`, `nav.bills = "ဘေလ်များ"` (real Myanmar script)              |
| `src/app/api/cron/bill-overdue-check/__tests__/route.test.ts`                                | Typed mock factory; vi.mock("@/lib/db")                  | VERIFIED | Line 11: `select: (...args: Parameters<typeof mockSelect>) => mockSelect(...args)`                 |
| `src/app/api/notifications/unread-count/__tests__/route.test.ts`                             | Typed mock factory                                       | VERIFIED | Line 19: typed Parameters<> pattern applied                                                        |
| `src/app/api/push/subscribe/__tests__/route.test.ts`                                         | Typed mock factory (insert/select/delete)                | VERIFIED | Lines 26-28: all three fields use Parameters<> pattern                                             |
| `src/app/api/tickets/[id]/messages/__tests__/route.test.ts`                                  | makeRequest with NextRequest-compat RequestInit; typed mocks | VERIFIED | Lines 28-29 typed; line 65 uses `ConstructorParameters<typeof NextRequest>[1]` cast             |
| `src/lib/__tests__/notifications.test.ts`                                                    | Typed mock factory                                       | VERIFIED | Lines 26-27: Parameters<> pattern                                                                  |
| `src/lib/__tests__/push.test.ts`                                                             | Typed mock factory                                       | VERIFIED | Lines 22-23: Parameters<> pattern                                                                  |
| `.github/workflows/ci.yml` (implicit for TYPE-02)                                            | CI workflow running typecheck on push/PR                 | VERIFIED | File exists; triggers on push to main + pull_request; runs `pnpm typecheck` at step line 30-31    |

### Key Link Verification

| From                                  | To                                | Via                                                      | Status | Details                                                                                  |
| ------------------------------------- | --------------------------------- | -------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| messages/my.json                      | messages/en.json                  | key-path parity via `jq paths(scalars)`                  | WIRED  | diff produced zero output; 109 == 109                                                    |
| src/app/api/**/__tests__/route.test.ts| tsconfig.json                     | `tsc --noEmit` compiles cleanly                          | WIRED  | `pnpm typecheck` exit 0 from `artifacts/web/` root                                       |
| artifacts/web/package.json            | CI typecheck workflow             | `"typecheck": "tsc --noEmit"` script                     | WIRED  | package.json has `"typecheck": "tsc --noEmit"`; ci.yml invokes `pnpm typecheck`          |

### Data-Flow Trace (Level 4)

Not applicable — this phase modifies JSON configuration (translations) and test files only. No dynamic rendering artifacts produced.

### Behavioral Spot-Checks

| Behavior                                       | Command                                                   | Result                                 | Status |
| ---------------------------------------------- | --------------------------------------------------------- | -------------------------------------- | ------ |
| Typecheck exits 0                              | `pnpm --filter @workspace/web typecheck`                  | exit 0, zero errors                    | PASS   |
| EN/MY key parity                               | `diff <(jq paths en) <(jq paths my)`                      | zero output (identical sets)           | PASS   |
| No byte-identical MY values                    | Node flatten + equality scan                              | "OK: all MY values differ from EN"     | PASS   |
| Test suite green (no regressions)              | `pnpm test -- --run`                                      | 7 test files / 36 tests passed         | PASS   |
| CI workflow declares typecheck on push/PR      | `grep typecheck .github/workflows/ci.yml`                 | Step "Typecheck" at line 30-31, triggers push/PR to main | PASS |
| No escape hatches introduced                   | grep `@ts-ignore / @ts-expect-error / as any` in test dirs| Zero matches                           | PASS   |
| MY uses real Myanmar script                    | `jq .nav messages/my.json`                                | "ပင်မ", "ဘေလ်များ", "စတား အကူအညီ"      | PASS   |

### Requirements Coverage

| Requirement | Source Plan   | Description                                                            | Status        | Evidence                                                                       |
| ----------- | ------------- | ---------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------ |
| I18N-01     | 34-01-PLAN.md | All user-facing v3.0 strings have MY translations; no EN byte-matches  | SATISFIED     | 109 keys, zero untranslated values (byte-equality scan clean)                 |
| I18N-02     | 34-01-PLAN.md | MY key count matches EN; no orphans in either direction                | SATISFIED     | `jq paths(scalars)` diff: zero output; 109 == 109                             |
| I18N-03     | 34-01-PLAN.md | Full EN↔MY toggle — every route renders without EN fallback            | NEEDS HUMAN   | Source audit surfaced 70 deferred runtime hardcoded-EN leaks (logged in SUMMARY); UI toggle requires browser |
| TYPE-01     | 34-01-PLAN.md | `pnpm --filter @workspace/web typecheck` exits 0 from clean checkout   | SATISFIED     | Local run exit 0, zero errors                                                  |
| TYPE-02     | 34-01-PLAN.md | CI typecheck step passes on every push/PR                              | NEEDS HUMAN   | `.github/workflows/ci.yml` wired correctly; live CI run needed for final confirmation |

No orphaned requirements detected — all 5 IDs claimed by PLAN and referenced in REQUIREMENTS.md.

### Anti-Patterns Found

| File                                                              | Line | Pattern                                     | Severity | Impact                                                                                                          |
| ----------------------------------------------------------------- | ---- | ------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `src/app/api/push/subscribe/__tests__/route.test.ts`              | 34   | `vi.fn((...args: unknown[]) => ...)`        | Info     | `and` helper uses unknown[] spread — acceptable (not a `Parameters<typeof X>` scenario; vi.fn factory literal) |
| `src/app/api/notifications/unread-count/__tests__/route.test.ts`  | 26   | `(...args: unknown[]) => mockGetUnreadCount(...args)` | Info | Non-db mock factory; doesn't produce TS2556 because `mockGetUnreadCount` is `vi.fn()` — typecheck still exit 0 |
| `src/app/api/cron/bill-overdue-check/__tests__/route.test.ts`     | 18, 23 | `(...args: unknown[]) => ...` / `vi.fn((...args: unknown[]) => ...)` | Info | Same as above; typecheck clean                                                                   |
| `src/lib/__tests__/push.test.ts`                                  | 8, 9 | `(...args: unknown[]) => mock...`           | Info     | web-push lib mocks; typecheck clean                                                                             |
| `src/lib/__tests__/notifications.test.ts`                         | 6, 13, 14 | `(...args: unknown[]) => mock...`      | Info     | Internal-module mocks; typecheck clean                                                                          |

Interpretation: Some `unknown[]` spread patterns remain in non-db mock factories where they don't trigger TS2556 (the TS error only fires when `unknown[]` is spread into a `Mock<Procedure>` with positional-param signature). Since `pnpm typecheck` exits 0 and no `@ts-ignore` / `as any` / tsconfig relaxation was introduced, these are cosmetic/informational only — **not blockers**.

**Deferred i18n runtime leaks (from SUMMARY):** 70 hardcoded English JSX strings across `src/app/admin/**`, `src/app/(resident)/**`, and `src/components/**` are documented in 34-01-SUMMARY.md as out-of-scope for Phase 34. These will affect I18N-03 manual verification — the goal statement "Myanmar speakers see full translations across every route" is only **partially achieved** if these strings appear in user-facing views. Plan deep_work_rules explicitly deferred these to a future `i18n-runtime-cleanup` phase.

### Human Verification Required

#### 1. Locale Toggle Audit (I18N-03)

**Test:** Start the web app locally, log in as a resident, toggle locale EN↔MY and navigate to at least these routes:
- Resident home `/`
- Bills list `/bills`
- Star Assist (tickets) `/star-assist`
- Bookings `/bookings`
- Admin dashboard `/admin` (log in as admin)
- Admin tickets `/admin/tickets`

**Expected:** All UI chrome (nav, header, buttons, form labels) switches between English and Myanmar script. Note any new hardcoded English strings not already on the 70-item deferred list in 34-01-SUMMARY.md. Record which of the deferred strings are in user-visible paths vs dev-only surfaces.

**Why human:** Visual UI rendering, user flow through locale switcher, and judgment about acceptable Latin-script content (brand names) cannot be automated.

#### 2. CI Typecheck Green on Live Push/PR (TYPE-02)

**Test:** Push a commit to a feature branch and open a PR to `main` (or push directly to `main` if permitted).

**Expected:** The GitHub Actions workflow `CI` (`.github/workflows/ci.yml`) runs `lint-typecheck-test` job; the `Typecheck` step (running `pnpm typecheck`) exits 0 and the workflow shows green.

**Why human:** Live CI execution on GitHub's runners requires a real push/PR. Local `pnpm typecheck` exit 0 is a strong proxy (CI delegates to the same command) but doesn't prove CI runner environment also passes.

### Gaps Summary

**No blockers** to the programmatic portion of the phase goal. All 6 must_haves truths verified by automated checks. The fix commit `4e4f009` eliminated 13 TS errors cleanly without runtime code changes or type escape hatches. EN/MY translation parity holds at 109/109 with zero byte-identical values.

**Open items requiring human verification:**

1. **I18N-03 (full locale toggle pass)** — 70 deferred runtime hardcoded-EN strings mean Myanmar speakers will still encounter English text on some screens. The SUMMARY explicitly scopes these out, and plan `must_haves.truths` codifies "no runtime code modified by this plan". The goal statement from ROADMAP ("Myanmar speakers see full translations across every route") is **aspirationally partial** — the i18n *infrastructure* goal is met (key parity, complete `messages/my.json`), but the *user-observable* goal depends on those 70 runtime leaks being addressed in a follow-up phase.

2. **TYPE-02 (CI green on push/PR)** — CI workflow is wired correctly and local equivalent passes, but the first live CI run after this phase merges is the final proof.

**Recommendation:** Mark Phase 34 passed with the documented deferral of 70 runtime i18n leaks to a dedicated `i18n-runtime-cleanup` phase. Live CI verification happens automatically on the next push/PR.

---

*Verified: 2026-04-11*
*Verifier: Claude (gsd-verifier)*
