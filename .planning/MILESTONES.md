# Milestones

## v2.1 Quality & Infrastructure Gaps (Shipped: 2026-04-11)

**Phases completed:** 6 phases, 13 plans, 15 tasks

**Key accomplishments:**

- Idempotent seed script
- password.test.ts
- supertest integration test suite covering auth (17 tests) and invoice (14 tests) endpoints with vi.mock db isolation — all 54 tests passing
- 20 ticket tests + 21 booking/facility tests covering full CRUD, auth, ownership, SA-XXXX/BK-XXXX number patterns, and slot generation across 95 total passing tests
- One-liner:
- Real DB-backed wallet balance (SUM pattern), atomic invoice payment via db.transaction(), and admin wallet adjust endpoint with audit trail
- Admin audit log list page with action/date filters, Audit Logs sidebar nav, and resident wallet page with Wallet/Security Deposit tab toggle and credit/debit type filters
- One-liner:
- One-liner:
- GitHub Actions CI pipeline with prettier lint, typecheck, and vitest tests on every PR/push, plus Replit deploy hook on merge to main
- Daily PostgreSQL backup via GitHub Actions cron with pg_dump, artifact upload (30-day retention), and restore runbook covering exact psql commands and verification checklist
- Playwright E2E infrastructure with dual webServer config (API:5198, frontend:5199), reusable resident auth helper, and 3 test cases covering the resident login-to-dashboard flow (TEST-08)
- Ticket creation/chat and recurring facility booking/cancellation E2E tests using Playwright data-testid selectors against the live resident app

---

## v2.0 Production-Ready (Shipped: 2026-04-10)

**Phases completed:** 6 phases, 25 plans, 10 tasks

**Key accomplishments:**

- One-liner:
- One-liner:
- One-liner:
- One-liner:
- One-liner:
- One-liner:
- Web Push browser client: sw.js service worker with push/notificationclick handlers, usePushNotifications hook managing VAPID subscription lifecycle, and resident home page Enable Notifications banner
- One-liner:
- One-liner:
- One-liner:
- One-liner:
- Task 1 — Image upload with preview in new-ticket form (commit: 44b3080)
- One-liner:
- One-liner:
- One-liner:
- One-liner:
- One-liner:
- One-liner:
- One-liner:
- One-liner:
- One-liner:
- One-liner:

---
