---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Production-Ready
status: executing
stopped_at: Completed 14-04-PLAN.md (photo attachment for maintenance tickets)
last_updated: "2026-04-10T16:54:04.950Z"
last_activity: 2026-04-10
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 21
  completed_plans: 17
  percent: 14
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-10)

**Core value:** Residents can manage their apartment lifecycle — bills, maintenance, bookings, and community info — from a single mobile-first web app without visiting the management office.
**Current focus:** Phase 14 — ux-enhancements

## Current Position

Phase: 14 (ux-enhancements) — EXECUTING
Plan: 4 of 7
Status: Ready to execute
Last activity: 2026-04-10

Progress: [██░░░░░░░░] ~14% (v1.0 complete, v2.0 not started)

## Performance Metrics

**Velocity:**

- Total plans completed: 0 (v2.0 milestone)
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 11 P01 | 20 | 3 tasks | 6 files |
| Phase 11 P02 | 2 | 2 tasks | 5 files |
| Phase 11 P03 | 5 | 1 tasks | 1 files |
| Phase 15 P02 | 5 | 2 tasks | 2 files |
| Phase 15 P01 | 10 | 2 tasks | 1 files |
| Phase 15 P03 | 10 | 2 tasks | 5 files |
| Phase 15 P04 | 3 | 3 tasks | 6 files |
| Phase 13 P01 | 5 | 2 tasks | 4 files |
| Phase 13 P02 | 1 | 3 tasks | 6 files |
| Phase 13 P03 | 8 | 2 tasks | 3 files |
| Phase 13 P04 | 2 | 2 tasks | 3 files |
| Phase 13 P05 | 2 | 2 tasks | 3 files |
| Phase 13 P06 | 2 | 2 tasks | 2 files |
| Phase 13 P07 | 5 | 2 tasks | 3 files |
| Phase 14 P03 | 8 | 2 tasks | 3 files |
| Phase 14 P04 | 5 | 2 tasks | 2 files |
| Phase 14 P05 | 5 | 2 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.0]: Mock payment integration (WavePay/KBZPay redirect stubs) — real integration deferred to Phase 12
- [v1.0]: SHA256 password hashing with static salt — known limitation, addressed in Phase 11
- [Roadmap]: Security Hardening (Phase 11) must complete before Payment Integration (Phase 12) — real money flows need secure auth
- [Phase 11]: bcryptjs chosen over node-bcrypt for pure-JS ESM compatibility on Replit (no native bindings)
- [Phase 11]: Re-hash-on-login strategy enables zero-downtime migration from SHA256 to bcrypt without forced password resets
- [Phase 11]: Admin JWT expiry reduced from 24 hours to 8 hours per security hardening requirements
- [Phase 11]: express-rate-limit v8 used for per-IP auth rate limiting (5 req/min); in-memory store acceptable for single-instance Replit
- [Phase 11]: helmet() placed before pinoHttp to ensure security headers apply even if logger throws
- [Phase 11]: CORS tightened from open to allowlist: localhost:5173, localhost:3000, and ALLOWED_ORIGIN env var for Replit deployment
- [Phase 15]: 4-param Express error handler registered as last app.use in app.ts; returns { error: 'internal_server_error', message } for 5xx errors per QUAL-04
- [Phase 15]: Password length check added to POST /admin/staff — minimum 8 chars, consistent with resident registration in auth.ts per QUAL-08
- [Phase 15]: Copied verifyAdmin/requireAdmin verbatim from admin.ts to auth.ts to keep auth logic consistent without extracting shared middleware
- [Phase 15]: db.select for upgrade request placed outside transaction (read-only); only the two UPDATE statements are wrapped in db.transaction for atomicity
- [Phase 15]: Used result.rows[0].num for db.execute() since drizzle node-postgres returns pg QueryResult, not iterable array
- [Phase 15]: AuthenticatedRequest type exported from auth-middleware.ts so route files can access req.user without any casts
- [Phase 15]: home.ts uses optionalAuth middleware — unauthenticated guests receive partial response with null user fields
- [Phase 13]: No FK constraints in push_subscriptions/ticket_messages — matches existing codebase pattern (text IDs without .references())
- [Phase 13]: emailNotifications defaults to true — opt-out model for email notifications
- [Phase 13]: Push delivery is non-throwing: sendPushToUser logs errors internally, push failures never break ticket/invoice update responses
- [Phase 13]: Expired push subscriptions (HTTP 410) are auto-removed from DB inside sendPushToUser
- [Phase 13]: Bill-due push deferred to a future plan requiring a scheduled job; VAPID public key served via GET /api/push/vapid-public-key
- [Phase 13]: Resend SDK initialized lazily at module load — null if RESEND_API_KEY not set, mirroring push-service pattern
- [Phase 13]: Email only triggered for completed/closed ticket status (push fires for any status change per D-07)
- [Phase 13]: Dual router.use at /tickets: Express merges ticketsRouter and ticketMessagesRouter at same path without conflict
- [Phase 13]: GET /admin/tickets/:id/messages added alongside POST for admin frontend chat thread rendering
- [Phase 13]: Kept existing Updates section (ticket.updates JSON array) separate from new Chat section backed by ticket_messages table
- [Phase 13]: Admin chat replaces staffResponse textarea with structured chat input; Save button retained for status/assignedTo only
- [Phase 13]: BufferSource cast used for applicationServerKey Uint8Array in usePushNotifications — TypeScript strict PushSubscriptionOptionsInit requires explicit cast from Uint8Array<ArrayBufferLike> to BufferSource
- [Phase 13]: Enable Notifications banner only shown to residents with supported push, permission not denied, and not yet subscribed — conditional rendering in home.tsx
- [Phase 13]: req.params.id cast as string in ticket-messages.ts to satisfy drizzle-orm eq() TypeScript overloads
- [Phase 14]: Cache-first strategy for API GET routes returns stale data immediately and refreshes in background; CLEAR_API_CACHE message evicts stale cache on reconnect
- [Phase 14]: Separate API_CACHE (scla-api-v1) isolates API responses from app-shell cache (scla-v1) for independent versioning
- [Phase 14]: accept=image/* with capture=environment for mobile camera + gallery on a single hidden input
- [Phase 14]: 5MB limit validated before FileReader conversion to avoid converting oversized files
- [Phase 14]: recurringGroupId is nullable text (no FK) — matches existing codebase pattern; cancel-group cancels bookings on/after today only

### Roadmap Evolution

- Phase 15 added: API Hardening & Code Quality — fix auth gaps, race conditions, missing error handling, type safety issues (8 QUAL requirements from codebase audit)

### Pending Todos

None yet.

### Blockers/Concerns

- SEC-01 (bcrypt migration) requires a migration strategy for existing hashed passwords — new logins can re-hash on first login, but the rollout approach needs planning in Phase 11.

## Session Continuity

Last session: 2026-04-10T16:53:54.469Z
Stopped at: Completed 14-04-PLAN.md (photo attachment for maintenance tickets)
Resume file: None
