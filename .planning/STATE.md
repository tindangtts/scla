---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: Next.js Migration
status: verifying
stopped_at: Completed 27-02-PLAN.md
last_updated: "2026-04-11T17:21:27.600Z"
last_activity: 2026-04-11
progress:
  total_phases: 8
  completed_phases: 4
  total_plans: 8
  completed_plans: 8
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-11)

**Core value:** Residents can manage their apartment lifecycle — bills, maintenance, bookings, and community info — from a single mobile-first web app without visiting the management office.
**Current focus:** Phase 27 — resident-secondary

## Current Position

Phase: 27 (resident-secondary) — EXECUTING
Plan: 2 of 2
Status: Phase complete — ready for verification
Last activity: 2026-04-11

Progress: [░░░░░░░░░░] 0% (v3.0 milestone)

## Performance Metrics

**Velocity:**

- Total plans completed: 0 (v3.0 milestone)
- Average duration: —
- Total execution time: —

**By Phase:**

(No phases started)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v3.0]: Migrating from Express + separate React SPAs to unified Next.js 15 App Router
- [v3.0]: Replacing custom JWT with Supabase Auth (email/password, no social providers)
- [v3.0]: Keeping Drizzle ORM + existing PostgreSQL schema — no DB restructure
- [v3.0]: Incremental migration approach — foundation first, then feature-by-feature with parity validation
- [v3.0]: Phase 28 (Admin) depends on Phase 25 (Auth), not Phase 27 — can parallelize with resident features
- [Phase 24-foundation]: Lazy DB initialization via Proxy to avoid build-time errors when DATABASE_URL not set
- [Phase 24-foundation]: force-dynamic export on DB-querying pages to prevent static generation during build
- [Phase 24]: shadcn/ui new-york style with neutral base color and Tailwind CSS 4 @theme inline for CSS variable theming
- [Phase 24]: Seed script decoupled to scripts/ workspace with inline bcryptjs (10 rounds)
- [Phase 25-authentication]: Inline Supabase client in middleware for route protection instead of updateSession helper
- [Phase 25-authentication]: Registration syncs to both Supabase Auth and app DB with bcryptjs for dual-source consistency
- [Phase 25]: Admin approval updates both app DB and Supabase Auth user_metadata for dual-source consistency
- [Phase 25]: Seed script conditionally seeds Supabase Auth users when env vars present, skips gracefully otherwise
- [Phase 26-resident-core]: Base64 data URL for ticket photo storage (consistent with v2.1 pattern, Supabase Storage upgrade deferred)
- [Phase 26-resident-core]: Query helpers in src/lib/queries/ for reusable data fetching across pages
- [Phase 27-01]: Member rate used for all residents (no member/non-member distinction yet)
- [Phase 27-02]: Client component extraction for interactive mark-as-read buttons in server component notification pages

### Pending Todos

None yet.

### Blockers/Concerns

- AUTH-06 (user data migration to Supabase Auth) requires careful handling — existing bcrypt passwords must be preserved or users re-prompted; strategy TBD at Phase 25 planning

## Session Continuity

Last session: 2026-04-11T17:21:27.598Z
Stopped at: Completed 27-02-PLAN.md
Resume file: None
