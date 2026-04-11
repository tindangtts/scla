---
gsd_state_version: 1.0
milestone: v2.1
milestone_name: Quality & Infrastructure Gaps
status: verifying
stopped_at: Completed 23-02-PLAN.md
last_updated: "2026-04-11T08:38:37.757Z"
last_activity: 2026-04-11
progress:
  total_phases: 6
  completed_phases: 6
  total_plans: 13
  completed_plans: 13
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-11)

**Core value:** Residents can manage their apartment lifecycle — bills, maintenance, bookings, and community info — from a single mobile-first web app without visiting the management office.
**Current focus:** Phase 23 — e2e-tests

## Current Position

Phase: 23
Plan: Not started
Status: Phase complete — ready for verification
Last activity: 2026-04-11

```
v2.1 Progress: [░░░░░░░░░░░░░░░░░░░░░░░░] 0% (0/6 phases)
```

## Performance Metrics

**Velocity:**

- Total plans completed: 0 (v2.1 milestone)
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 18 — Developer Foundation | 0 | — | — |
| 19 — API Integration Tests | 0 | — | — |
| 20 — Audit Logging & Wallet Transactions | 0 | — | — |
| 21 — WebSocket Chat | 0 | — | — |
| 22 — CI/CD Pipeline | 0 | — | — |
| 23 — E2E Tests | 0 | — | — |

*Updated after each plan completion*
| Phase 18 P02 | 6 minutes | 2 tasks | 8 files |
| Phase 18 P01 | 15 | 1 tasks | 1 files |
| Phase 19 P01 | 12 | 3 tasks | 5 files |
| Phase 19 P02 | 15 | 2 tasks | 2 files |
| Phase 20-audit-logging-wallet-transactions P01 | 10 | 2 tasks | 5 files |
| Phase 20-audit-logging-wallet-transactions P02 | 18 | 2 tasks | 3 files |
| Phase 20-audit-logging-wallet-transactions P03 | 12 | 3 tasks | 4 files |
| Phase 21-websocket-chat P01 | 12 | 2 tasks | 6 files |
| Phase 21-websocket-chat P02 | 8 | 2 tasks | 4 files |
| Phase 22-ci-cd-pipeline P01 | 5 | 2 tasks | 4 files |
| Phase 22-ci-cd-pipeline P02 | 2 | 2 tasks | 2 files |
| Phase 23-e2e-tests P01 | 2 | 2 tasks | 8 files |
| Phase 23-e2e-tests P02 | 5 | 2 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v2.0]: All v2.0 features shipped — security hardening, notifications, i18n, dark mode, offline, recurring bookings, scheduler, migrations
- [v2.1]: Real payment integration (WavePay/KBZPay) remains deferred — missing gateway documents
- [v2.1]: DX + unit tests merged into Phase 18 (coarse granularity — both are developer infrastructure with no conflict)
- [v2.1]: AUDIT + WALLET merged into Phase 20 (both are data-layer features with no interdependency)
- [Phase 18]: Use inline vi.fn() in vi.mock factories to avoid hoisting ReferenceError
- [Phase 18]: Export checkBillOverdue from scheduler.ts to enable direct unit testing
- [Phase 18]: onConflictDoNothing with email target only for tables with DB-level unique constraints; count-first for all others
- [Phase 18]: Deterministic SEED_IDS UUIDs eliminate .returning() dependency across seed inserts
- [Phase 19]: Use inline vi.fn() in vi.mock factories (not outer variables) to avoid hoisting ReferenceError
- [Phase 19]: Thenable mock chain (Promise.resolve with extra methods) handles mixed Drizzle .where()/.limit() and .where()/.orderBy() query shapes
- [Phase 19]: Token-based auth in integration tests (not mocking requireAuth) for more realistic coverage
- [Phase 19]: Facility route mocks use thenable from() (Promise + .where()) since GET /api/facilities awaits db.select().from() directly without .where()
- [Phase 19]: Per-test inline select mock for ticket message 403 ownership tests (not global setupMocks)
- [Phase 20]: auditLog() wraps db.insert in try/catch — audit failures are non-blocking by design
- [Phase 20]: getStaffEmail() helper pattern in admin.ts for one-time per-handler staff email lookup
- [Phase 20-audit-logging-wallet-transactions]: Wallet balance computed on-demand via SQL SUM — no cached balance column, always accurate
- [Phase 20-audit-logging-wallet-transactions]: Admin wallet adjust supports category=deposit for security deposit management (WALLET-04)
- [Phase 20]: Pending filter state pattern — inputs accumulate changes, Search button commits to queryKey to avoid query-on-keystroke
- [Phase 20]: Client-side type filtering for wallet — avoids refetch on each chip click
- [Phase 21]: WS is receive-only for clients — REST POST is the authoritative write path
- [Phase 21]: verifyAdminToken duplicated in ws-server.ts (not exported from auth-middleware) — acceptable per plan guidance
- [Phase 21-websocket-chat]: useTicketChat hook duplicated across scla and admin apps (not shared via workspace package) — pragmatic for ~160 lines, avoids workspace config overhead
- [Phase 21-websocket-chat]: WS connection indicator dot (green/red) added to both chat UIs to show live vs polling fallback state
- [Phase 22]: deploy job uses continue-on-error: true so missing REPLIT_DEPLOY_HOOK_URL secret does not break CI
- [Phase 22]: Branch protection for CICD-02 documented in workflow comments as a manual GitHub UI step
- [Phase 22]: 30-day GitHub artifact retention eliminates need for external backup storage (S3/GCS)
- [Phase 22]: pg_dump integrity check (file size + CREATE TABLE grep) catches silent pg_dump failures before artifact upload
- [Phase 23-e2e-tests]: workers: 1 with fullyParallel: false — E2E tests share seeded DB state, sequential execution avoids race conditions
- [Phase 23-e2e-tests]: Auth helper pattern (loginAsResident/loginAsGuest) in e2e/helpers/auth.ts — reusable by Plan 02 and beyond
- [Phase 23-e2e-tests]: Bookings tabs are 'facilities' and 'mybookings' — cancel button only on recurring upcoming bookings, test uses toggle-repeat-weekly

### Roadmap Evolution

- 2026-04-11: Roadmap created for v2.1. 29 requirements mapped to 6 phases (18-23).

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-04-11T08:35:20.571Z
Stopped at: Completed 23-02-PLAN.md
Resume file: None
