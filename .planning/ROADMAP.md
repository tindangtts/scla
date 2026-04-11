# Roadmap: Star City Living App (SCLA)

## Milestones

- ✅ **v1.0 Foundation** — Phases 1-10 (shipped 2026-04-10)
- ✅ **v2.0 Production-Ready** — Phases 11-17 (shipped 2026-04-10)
- ✅ **v2.1 Quality & Infrastructure Gaps** — Phases 18-23 (shipped 2026-04-11)

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

<details>
<summary>✅ v2.1 Quality & Infrastructure Gaps (Phases 18-23) — SHIPPED 2026-04-11</summary>

6 phases, 13 plans, 29 requirements. Testing, CI/CD, audit logging, WebSocket chat, wallet transactions.

- [x] Phase 18: Developer Foundation (2/2 plans) — seed data, unit tests (23 tests)
- [x] Phase 19: API Integration Tests (2/2 plans) — auth, bills, tickets, bookings (72 tests)
- [x] Phase 20: Audit Logging & Wallet Transactions (3/3 plans) — audit middleware, wallet balance, admin adjust
- [x] Phase 21: WebSocket Chat (2/2 plans) — ws server, frontend hooks, polling fallback
- [x] Phase 22: CI/CD Pipeline (2/2 plans) — GitHub Actions, daily backup, restore runbook
- [x] Phase 23: E2E Tests (2/2 plans) — Playwright login, ticket, booking flows

See `.planning/milestones/v2.1-ROADMAP.md` for full details.

</details>

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
| 18 | v2.1 | 2/2 | Complete | 2026-04-11 |
| 19 | v2.1 | 2/2 | Complete | 2026-04-11 |
| 20 | v2.1 | 3/3 | Complete | 2026-04-11 |
| 21 | v2.1 | 2/2 | Complete | 2026-04-11 |
| 22 | v2.1 | 2/2 | Complete | 2026-04-11 |
| 23 | v2.1 | 2/2 | Complete | 2026-04-11 |
