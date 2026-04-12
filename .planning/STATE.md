---
gsd_state_version: 1.0
milestone: v3.1
milestone_name: Deploy-Ready Polish
status: executing
stopped_at: Completed 35-01-PLAN.md
last_updated: "2026-04-12T08:01:03.557Z"
last_activity: 2026-04-12
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 4
  completed_plans: 3
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-12)

**Core value:** Residents can manage their apartment lifecycle — bills, maintenance, bookings, and community info — from a single mobile-first web app without visiting the management office.
**Current focus:** Phase 35 — vercel-deployment

## Current Position

Phase: 35 (vercel-deployment) — EXECUTING
Plan: 2 of 2
Status: Ready to execute
Last activity: 2026-04-12

## Roadmap Summary

| Phase | Name | Requirements | Depends on |
|-------|------|--------------|------------|
| 33 | UI Polish | UI-01…UI-05 | — |
| 34 | i18n Backfill + Typecheck Cleanup | I18N-01…I18N-03, TYPE-01, TYPE-02 | 33 |
| 35 | Vercel Deployment | DEPLOY-01…DEPLOY-06, WS-01, WS-02 | 34 |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v3.1]: Polish-only milestone after v3.0 functional ship — no new features
- [v3.1]: WebSocket chat stays on polling fallback — Supabase Realtime deferred to separate milestone
- [v3.1]: Deploy target is Vercel — Replit deploy config can be archived
- [v3.1]: UI gaps sourced from agent-browser visual review of v3.0 production build
- [v3.1]: Phase numbering continues from 33 (v3.0 ended at 32)
- [v3.1]: 3 phases at coarse granularity — UI Polish → i18n/Typecheck → Vercel Deployment
- [Phase 33]: 33-01: SC mark placed ABOVE existing h2 heading (not replacing it) to preserve E2E heading probes and auth.login translation contract
- [Phase 33]: 33-01: Gold (accent) chosen over teal (primary) for nav active indicator to avoid monochrome active state paired with primary-filled icon tile
- [Phase 33]: 33-01: Dark-mode badge legibility via scoped .dark .badge-* overrides on fixed-hue classes only; destructive/muted badges rely on token flips
- [Phase 34-i18n-typecheck]: 34-01: Used Option B (Parameters<typeof mock>) over Option A (direct reference) for TS2556 fix — Option A breaks at runtime because vi.mock factories are hoisted above const declarations
- [Phase 34-i18n-typecheck]: 34-01: TS2345 NextRequest fix used FALLBACK (ConstructorParameters cast) over PRIMARY (deep pnpm-versioned import) — public-API machinery is more robust to Next upgrades
- [Phase 34-i18n-typecheck]: 34-01: 70 hardcoded-English JSX leaks in runtime .tsx deferred to post-deploy i18n-runtime-cleanup plan — plan scope forbids runtime edits
- [Phase 35]: 35-01: Cron route uses dual auth (Bearer OR x-cron-secret) via shared runOverdueCheck helper — additive, preserves legacy Phase 29 manual-invocation contract
- [Phase 35]: 35-01: Vercel region sin1 (Singapore) + cron at 02:00 UTC (08:30 Asia/Yangon) — closest region, low DB contention window
- [Phase 35]: 35-01: Stray Replit references in pnpm-workspace.yaml/mockup-sandbox/.gitignore/CLAUDE.md left in place — out of plan scope per DEPLOY-06 boundary; post-deploy cleanup plan needed

### Pending Todos

None yet.

### Blockers/Concerns

- Vercel CLI not installed locally — user needs to `pnpm add -g vercel && vercel login` before Phase 35 can run
- Browser-based Vercel project creation requires user interaction (Phase 35 DEPLOY-01)
- Phase 35 requires Phase 34 to pass typecheck so CI is green before promoting to production

## Session Continuity

Last session: 2026-04-12T08:01:03.554Z
Stopped at: Completed 35-01-PLAN.md
Resume file: None
Next step: `/gsd:plan-phase 33`
