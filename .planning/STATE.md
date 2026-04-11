---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: Next.js Migration
status: executing
stopped_at: Completed 31-02-PLAN.md
last_updated: "2026-04-11T18:46:49.877Z"
last_activity: 2026-04-11
progress:
  total_phases: 8
  completed_phases: 7
  total_plans: 20
  completed_plans: 19
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-11)

**Core value:** Residents can manage their apartment lifecycle — bills, maintenance, bookings, and community info — from a single mobile-first web app without visiting the management office.
**Current focus:** Phase 31 — testing-ci

## Current Position

Phase: 31 (testing-ci) — EXECUTING
Plan: 2 of 2
Status: Ready to execute
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
- [Phase 28-admin-portal]: Admin query helpers follow src/lib/queries/admin-*.ts pattern, role assignment syncs both app DB and Supabase Auth
- [Phase 28]: Admin ticket queries join usersTable for submitter info without user scope
- [Phase 28]: All content mutations create audit log entries with actor tracking via requireAdmin()
- [Phase 28]: Staff creation hashes password with bcryptjs and creates Supabase Auth user with staff metadata
- [Phase 28]: Wallet adjustments insert both wallet_transaction and audit_log in same server action for traceability
- [Phase 29-02]: Graceful degradation: push and email skip silently when VAPID/RESEND keys not configured
- [Phase 29-02]: Unified notification triggers: single function creates in-app record + push + email with fire-and-forget pattern
- [Phase 29]: Standalone WS server on port 3002 separate from Next.js; REST API for persistence, WS for broadcast only
- [Phase 29]: 30s polling for notification bell unread count (simpler than WebSocket subscription for badge)
- [Phase 29]: Fire-and-forget pattern with .catch for all notification triggers to avoid blocking primary actions
- [Phase 29]: Cron endpoint default mode processes only yesterday's newly overdue invoices to prevent re-notification
- [Phase 29]: Cross-process HTTP relay (localhost:3003) for WS broadcast instead of direct function import
- [Phase 30]: Network-first caching for navigation with offline.html fallback, cache-first for static assets, API requests skip cache
- [Phase 30]: Cookie-based locale detection (NEXT_LOCALE cookie) instead of URL path-based routing to avoid breaking existing routes
- [Phase 30]: Server Components use getTranslations, Client Components use useTranslations for proper SSR/CSR i18n split
- [Phase 31-02]: E2E tests use native form selectors instead of data-testid for Next.js Server Actions forms
- [Phase 31-02]: E2E tests excluded from CI workflow (require running Next.js server + Supabase DB)

### Pending Todos

None yet.

### Blockers/Concerns

- AUTH-06 (user data migration to Supabase Auth) requires careful handling — existing bcrypt passwords must be preserved or users re-prompted; strategy TBD at Phase 25 planning

## Session Continuity

Last session: 2026-04-11T18:46:49.875Z
Stopped at: Completed 31-02-PLAN.md
Resume file: None
