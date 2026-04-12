---
phase: 35-vercel-deployment
plan: 01
subsystem: infra
tags: [vercel, deployment, cron, env-vars, websocket, replit-cleanup]

requires:
  - phase: 34-i18n-typecheck
    provides: green typecheck baseline so deploy prep does not regress CI
provides:
  - vercel.json at repo root declaring monorepo install/build + sin1 region + daily cron
  - GET handler on /api/cron/bill-overdue-check accepting Vercel Cron Bearer auth
  - Dual auth (Bearer OR x-cron-secret) preserving legacy manual invocation
  - artifacts/web/.env.example listing all 11 prod env keys blank
  - DEPLOYMENT.md runbook covering env vars, cron schedule, and WS polling fallback decision
  - Replit-specific config removed from repo root
affects: [35-02-vercel-deploy, future phases touching cron handlers or env config]

tech-stack:
  added: []
  patterns:
    - "vercel.json at repo root for monorepo Next.js apps (not inside artifacts/web)"
    - "Dual auth helper isAuthorized() accepting both Bearer and custom header for cron handlers"
    - "Shared core handler (runOverdueCheck) exported via both GET and POST to satisfy Vercel Cron + legacy callers"

key-files:
  created:
    - vercel.json
    - artifacts/web/.env.example
    - DEPLOYMENT.md
  modified:
    - artifacts/web/src/app/api/cron/bill-overdue-check/route.ts
    - artifacts/web/src/app/api/cron/bill-overdue-check/__tests__/route.test.ts

key-decisions:
  - "Region sin1 (Singapore) chosen over iad1/hnd1 — closest Vercel region to Yangon"
  - "Cron scheduled at 02:00 UTC (08:30 Asia/Yangon) — residents asleep, low DB contention"
  - "No rootDirectory key in vercel.json — Vercel dashboard Root Directory stays at repo root so monorepo install command works"
  - "Dual auth (Bearer OR x-cron-secret) over replacing the legacy header — preserves manual invocation scripts and avoids breaking Phase 29 contract"
  - "Single shared runOverdueCheck helper exported via both GET and POST — no DB logic duplication, consistent response shape"
  - "Live-code Replit references outside the three deleted files (pnpm-workspace.yaml, mockup-sandbox, gitignore, CLAUDE.md platform constraint) left untouched — out of plan scope per DEPLOY-06 boundary in 35-01-PLAN.md"

patterns-established:
  - "Monorepo Vercel config: pnpm install --frozen-lockfile + workspace-filtered build + framework nextjs + outputDirectory at filtered path"
  - "Cron handler dual-method pattern: isAuthorized(request) accepts Bearer OR custom header, runCore(request) shared by GET+POST"
  - ".env.example as blank-valued reference for dashboard setup, separate from .env.local.example minimum dev reference"

requirements-completed: [DEPLOY-01, DEPLOY-03, DEPLOY-06, WS-01, WS-02]

duration: 14 min
completed: 2026-04-12
---

# Phase 35 Plan 01: Vercel Deploy Prep Summary

**Vercel deployment artifacts landed (vercel.json, dual-auth GET cron handler, blank env reference, DEPLOYMENT.md runbook); Replit config retired; repo is deploy-ready without any CLI interaction.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-04-12T07:45:19Z
- **Completed:** 2026-04-12T07:59:21Z
- **Tasks:** 5 of 5
- **Files created:** 3 (vercel.json, artifacts/web/.env.example, DEPLOYMENT.md)
- **Files modified:** 2 (cron route.ts, cron route.test.ts)
- **Files deleted:** 3 (.replit, .replitignore, replit.md)

## Accomplishments

- **vercel.json at repo root** — declares pnpm install, filtered `@workspace/web` build, Next.js framework, `artifacts/web/.next` output, `sin1` region, and daily cron at 02:00 UTC for `/api/cron/bill-overdue-check`.
- **Cron route dual auth** — refactored `route.ts` to export both GET (Vercel Cron Bearer) and POST (legacy x-cron-secret) through a shared `runOverdueCheck` helper. No DB logic duplication. Dev-mode permissive when CRON_SECRET unset.
- **9 cron tests total (5 new + 4 existing), all green** — Bearer auth happy/sad paths, force-mode SQL verification via drizzle mock capture, POST regression checks.
- **artifacts/web/.env.example** — 11 env keys with blank values and inline comments; safe to hand to Vercel dashboard.
- **DEPLOYMENT.md runbook** — Vercel config, env var table, cron schedule with manual-invocation curl snippets, WS-01/WS-02 polling-fallback decision, smoke-test checklist.
- **Replit cleanup** — `.replit`, `.replitignore`, `replit.md` removed from repo root.

## Task Commits

1. **Task 1: Create vercel.json** — `f1e11ac` (feat)
2. **Task 2 RED: Add failing GET tests** — `020ff72` (test)
3. **Task 2 GREEN: Refactor route with dual auth** — `4190006` (feat)
4. **Task 3: Delete Replit config files** — `32fb11e` (chore)
5. **Task 4: Create artifacts/web/.env.example** — `110f253` (docs)
6. **Task 5: Create DEPLOYMENT.md runbook** — `1a73eb2` (docs)

_Task 2 was TDD (RED → GREEN). No REFACTOR commit — the GREEN implementation was already clean (single shared helper, no duplication)._

## Files Created/Modified

**Created:**
- `vercel.json` — Vercel project config (monorepo build, cron, sin1 region)
- `artifacts/web/.env.example` — 11 blank env var keys for Vercel dashboard setup
- `DEPLOYMENT.md` — Deploy runbook (env vars, cron, WS polling-fallback decision, smoke tests)

**Modified:**
- `artifacts/web/src/app/api/cron/bill-overdue-check/route.ts` — Added GET export + `isAuthorized` + `runOverdueCheck` shared helper; POST preserved
- `artifacts/web/src/app/api/cron/bill-overdue-check/__tests__/route.test.ts` — Added 5 GET tests (Bearer auth, dev mode, force param SQL capture)

**Deleted:**
- `.replit`, `.replitignore`, `replit.md` at repo root (121 lines removed)

## Decisions Made

1. **Region `sin1`** — Singapore is the closest Vercel region to Yangon; locked in `35-CONTEXT.md` "Claude's Discretion".
2. **Cron at `0 2 * * *`** — 02:00 UTC = 08:30 Asia/Yangon; residents asleep, low DB contention.
3. **No `rootDirectory` in vercel.json** — Vercel dashboard Root Directory must stay at repo root so the monorepo `pnpm install` reaches the workspace. Plan 35-02 will confirm this during `vercel link`.
4. **Dual auth (Bearer OR x-cron-secret)** — Additive over replacing the legacy header; preserves manual invocation scripts and Phase 29 contract.
5. **Single `runOverdueCheck` helper** — GET and POST both delegate to it; no DB query duplication, identical response shape.
6. **Kept `artifacts/web/.env.local.example`** — existing minimum dev reference retained; new `.env.example` is the superset for prod. Optional consolidation is a follow-up.
7. **Deferred stray Replit references** — pnpm-workspace.yaml, mockup-sandbox, .gitignore, .prettierignore, CLAUDE.md platform line — explicitly out of plan scope per plan's DEPLOY-06 boundary.

## Deviations from Plan

None - plan executed exactly as written.

All 5 tasks completed with their acceptance criteria verified inline. No Rule 1-3 auto-fixes were needed. No Rule 4 architectural decisions encountered. No authentication gates (Plan 35-02 handles all interactive work).

## Issues Encountered

**Pre-existing E2E failures (not a regression):**
- `pnpm -r --if-present run test` runs the Playwright E2E suite in `e2e/`, which fails with "Test timeout of 60000ms exceeded — waiting for locator" across 10 tests. These failures exist because the suite requires a running Next dev server on port 3000 and Supabase credentials, neither of which is spun up by the recursive test script. This is environmental, not a Phase 35 change.
- Scoped verification: `pnpm --filter @workspace/web test` → 41/41 pass; `pnpm --filter @workspace/web typecheck` → clean. These are the two gates cited in the plan's own verification block.

## Follow-ups (out of scope for this plan)

These Replit live-code references remain in the repo and are intentionally untouched per the plan's DEPLOY-06 boundary:

- `pnpm-workspace.yaml` — `@replit/*` vite-plugin catalog entries (lines 11-13, 64-77) used by `artifacts/mockup-sandbox`
- `artifacts/mockup-sandbox/package.json` and `vite.config.ts` — still import `@replit/vite-plugin-*` (dev-only sandbox, not deployed)
- `.gitignore` line 48 — Replit comment block
- `.prettierignore` line 3 — ignores the now-deleted `.replit` path (harmless)
- `CLAUDE.md` — "Deployed on Replit" constraint line (needs refresh to Vercel post-deploy)
- `docs/runbook-db-restore.md` line 98 — references Replit dashboard for DB status checks
- `pnpm-lock.yaml` — locked versions of `@replit/*` vite plugins (transitively installed by mockup-sandbox)

Recommended: a post-deploy cleanup plan to update CLAUDE.md platform constraint, refresh the runbook, and evaluate whether `artifacts/mockup-sandbox` still needs the Replit Vite plugins.

## User Setup Required

None from this plan. All interactive deploy work (Vercel CLI, browser OAuth, env var provisioning, preview/prod deploys, cron verification) is deferred to **Plan 35-02**, which requires user + `vercel login`.

## Next Phase Readiness

**Ready for Plan 35-02 (interactive deploy, requires user + Vercel CLI):**
- vercel.json in place — `vercel link` will read it
- Cron handler GET-compatible with Bearer auth — Vercel Cron can invoke immediately after deploy
- `.env.example` available as the dashboard setup checklist
- DEPLOYMENT.md runbook referenced directly by 35-02 smoke-test steps

**Requirements status:**
- DEPLOY-01 — **partial** (vercel.json exists; project linking in 35-02)
- DEPLOY-03 — **partial** (cron handler ready; schedule goes live after deploy in 35-02)
- DEPLOY-06 — **full** (Replit files deleted)
- WS-01 — **full** (polling-fallback decision documented in DEPLOYMENT.md)
- WS-02 — **full** (future Supabase Realtime migration pointer to ENH-04 documented)

**Next:** Plan 35-02 (interactive deploy, requires user + Vercel CLI).

## Self-Check: PASSED

- All 5 created/modified files present on disk
- All 3 Replit files absent (deletion committed in 32fb11e)
- All 6 task commits present in git log: f1e11ac, 020ff72, 4190006, 32fb11e, 110f253, 1a73eb2
- Web unit tests: 41/41 passing
- Typecheck: clean

---
*Phase: 35-vercel-deployment*
*Completed: 2026-04-12*
