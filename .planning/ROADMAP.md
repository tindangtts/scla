# Roadmap: Star City Living App (SCLA)

## Milestones

- ✅ **v1.0 Foundation** — Phases 1-10 (shipped 2026-04-10)
- ✅ **v2.0 Production-Ready** — Phases 11-17 (shipped 2026-04-10)
- 🔄 **v2.1 Quality & Infrastructure Gaps** — Phases 18-23 (in progress)

## Phases

<details>
<summary>✅ v1.0 Foundation (Phases 1-10) — SHIPPED 2026-04-10</summary>

All 52 v1 requirements implemented. Covers authentication, bill payment, maintenance ticketing, facility bookings, discover/announcements, wallet, info centre, notifications, home dashboard, and admin portal.

See `.planning/milestones/v1.0-REQUIREMENTS.md` for full list.

</details>

<details>
<summary>✅ v2.0 Production-Ready (Phases 11-17) — SHIPPED 2026-04-10</summary>

6 active phases, 25 plans, 19 requirements completed. Phase 12 (Payment) deferred.

- [x] Phase 11: Security Hardening (3/3 plans) — bcrypt, rate limiting, helmet, CORS, JWT
- [x] Phase 13: Communication & Notifications (7/7 plans) — push, email, in-app chat
- [x] Phase 14: UX Enhancements (7/7 plans) — i18n, dark mode, offline, image upload, recurring bookings
- [x] Phase 15: API Hardening & Code Quality (4/4 plans) — auth gaps, transactions, types, error handling
- [x] Phase 16: i18n & Auth Middleware Cleanup (2/2 plans) — gap closure
- [x] Phase 17: Scheduler & Migration Bootstrap (2/2 plans) — gap closure
- [ ] Phase 12: Real Payment Integration — ⏭ DEFERRED (missing gateway documents)

See `.planning/milestones/v2.0-ROADMAP.md` for full details.

</details>

### v2.1 Quality & Infrastructure Gaps

- [x] **Phase 18: Developer Foundation** — Idempotent seed data and unit test coverage for auth, scheduler, and password logic (completed 2026-04-11)
- [x] **Phase 19: API Integration Tests** — Full route-level test coverage across auth, bills, tickets, and bookings (completed 2026-04-11)
- [x] **Phase 20: Audit Logging & Wallet Transactions** — Admin action audit trail and wallet debit/credit workflows (completed 2026-04-11)
- [ ] **Phase 21: WebSocket Chat** — Replace 4s polling with real-time WebSocket messaging on ticket chat
- [ ] **Phase 22: CI/CD Pipeline** — Automated lint, type-check, test, and deploy on push; daily DB backup
- [ ] **Phase 23: E2E Tests** — Browser-level test coverage for resident login, ticket creation, and facility booking

## Phase Details

### Phase 18: Developer Foundation
**Goal**: Developers can run the app against realistic data and trust unit-tested building blocks
**Depends on**: Phase 17 (migrations must exist before seeding runs against schema)
**Requirements**: DX-01, DX-02, DX-03, TEST-05, TEST-06, TEST-07
**Success Criteria** (what must be TRUE):
  1. Running the seed script once or multiple times produces the same set of demo accounts, invoices, tickets, bookings, and announcements without errors or duplicates
  2. A developer can reset the database to a known state by re-running the seed script with a single command
  3. Unit tests for JWT verification and role-check middleware pass and fail correctly on bad tokens and insufficient roles
  4. Unit tests for the bill-overdue scheduler confirm it selects the right invoices and triggers notifications at the correct threshold
  5. Unit tests for password hashing confirm bcrypt round-trip and SHA256 migration path both resolve correctly
**Plans**: 2 plans
Plans:
- [x] 18-01-PLAN.md — Idempotent seed script with all entity types including bookings
- [x] 18-02-PLAN.md — Vitest setup + unit tests for password, auth middleware, and scheduler

### Phase 19: API Integration Tests
**Goal**: Every critical API route has an automated test that catches regressions before merge
**Depends on**: Phase 18 (seed data provides known fixture state for assertions)
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. Auth integration tests (register, login, /me, upgrade-request) run against a test database and assert correct status codes, response shapes, and error cases
  2. Bill integration tests (list, detail, summary, pay) assert that a seeded resident sees the correct invoices and that the pay endpoint updates status
  3. Ticket integration tests (create, list, detail, messages) assert that ticket creation returns a unique SA-XXXX number and that message threads append correctly
  4. Booking integration tests (slots, create, list, cancel) assert that a slot becomes unavailable after booking and that cancellation frees it
**Plans**: 2 plans
Plans:
- [x] 19-01-PLAN.md — Supertest setup + auth and invoice integration tests
- [x] 19-02-PLAN.md — Ticket and booking integration tests

### Phase 20: Audit Logging & Wallet Transactions
**Goal**: Admin actions are traceable and wallet balances reflect real payment activity
**Depends on**: Phase 18 (seed data provides users and wallets to operate on)
**Requirements**: AUDIT-01, AUDIT-02, AUDIT-03, AUDIT-04, WALLET-01, WALLET-02, WALLET-03, WALLET-04
**Success Criteria** (what must be TRUE):
  1. Every admin action (upgrade approve/reject, booking cancel, staff create/deactivate) writes a row to audit_logs with actor, action, target, and timestamp
  2. Admin can view an audit log list in the admin portal showing who did what and when
  3. Resident can view their wallet transaction history filtered by type (credit/debit) and see a running balance
  4. Paying a bill deducts the invoice amount from the resident's wallet balance and records a debit transaction with the invoice reference
  5. Admin can manually credit or debit a wallet with a required reason, and the adjustment appears in the resident's transaction history
  6. Security deposit deductions appear in the deposit transaction list with a reason attached
**Plans**: 3 plans
Plans:
- [x] 20-01-PLAN.md — Schema definitions + audit middleware + admin audit logging
- [x] 20-02-PLAN.md — Wallet API routes + invoice pay rewrite + admin wallet adjust
- [x] 20-03-PLAN.md — Admin audit log page + resident wallet page UI updates
**UI hint**: yes

### Phase 21: WebSocket Chat
**Goal**: Ticket chat messages arrive instantly without polling, with automatic fallback if the connection drops
**Depends on**: Phase 18 (seed data provides tickets and users for connection testing)
**Requirements**: RT-01, RT-02, RT-03
**Success Criteria** (what must be TRUE):
  1. A message sent by a resident on the ticket detail page appears for the admin (and vice versa) without any page refresh or visible delay
  2. If the WebSocket connection is lost (network drop, server restart), the chat UI falls back to polling and continues to function
  3. No existing polling-based chat functionality regresses — existing message history still loads on ticket open
**Plans**: 2 plans
Plans:
- [x] 21-01-PLAN.md — WS server with JWT auth, room management, admin message REST endpoints, broadcast wiring
- [ ] 21-02-PLAN.md — Frontend useTicketChat hook with WS + polling fallback, UI integration for both apps
**UI hint**: yes

### Phase 22: CI/CD Pipeline
**Goal**: Every push to main is automatically validated and deployed; database is backed up daily
**Depends on**: Phase 19 (integration tests must exist for CI to run meaningfully)
**Requirements**: CICD-01, CICD-02, CICD-03, CICD-04, CICD-05
**Success Criteria** (what must be TRUE):
  1. Opening a pull request triggers a GitHub Actions workflow that runs lint, type-check, and all tests, with results visible on the PR
  2. A PR with type errors or failing tests cannot be merged — the CI check blocks it
  3. Merging to main triggers an automated deploy to Replit without manual steps
  4. A daily scheduled job creates a PostgreSQL backup and stores it in a retrievable location
  5. A runbook documents how to restore from a backup and includes a verification step confirming data integrity after restore
**Plans**: TBD

### Phase 23: E2E Tests
**Goal**: Critical resident workflows are verified end-to-end in a real browser, catching UI and integration regressions
**Depends on**: Phase 20, Phase 21 (all features must be built before browser tests can cover them)
**Requirements**: TEST-08, TEST-09, TEST-10
**Success Criteria** (what must be TRUE):
  1. An E2E test logs in as a seeded resident, lands on the home dashboard, and asserts key content (balance, open tickets) is visible
  2. An E2E test creates a new maintenance ticket, opens the ticket detail, sends a chat message, and asserts it appears in the thread
  3. An E2E test books a facility slot, asserts the booking appears in the bookings list, then cancels it and asserts the status updates to cancelled
**Plans**: TBD

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1-10 | v1.0 | — | Complete | 2026-04-10 |
| 11 | v2.0 | 3/3 | Complete | 2026-04-10 |
| 12 | v2.0 | — | Deferred | — |
| 13 | v2.0 | 7/7 | Complete | 2026-04-10 |
| 14 | v2.0 | 7/7 | Complete | 2026-04-10 |
| 15 | v2.0 | 4/4 | Complete | 2026-04-10 |
| 16 | v2.0 | 2/2 | Complete | 2026-04-10 |
| 17 | v2.0 | 2/2 | Complete | 2026-04-10 |
| 18 | v2.1 | 2/2 | Complete    | 2026-04-11 |
| 19 | v2.1 | 2/2 | Complete    | 2026-04-11 |
| 20 | v2.1 | 3/3 | Complete    | 2026-04-11 |
| 21 | v2.1 | 1/2 | In Progress|  |
| 22 | v2.1 | 0/TBD | Not started | — |
| 23 | v2.1 | 0/TBD | Not started | — |
