# Roadmap: Star City Living App (SCLA)

## Milestones

- ✅ **v1.0 Foundation** — Phases 1-10 (shipped 2026-04-10)
- ✅ **v2.0 Production-Ready** — Phases 11-17 (shipped 2026-04-10)
- ✅ **v2.1 Quality & Infrastructure Gaps** — Phases 18-23 (shipped 2026-04-11)
- 🚧 **v3.0 Next.js Migration** — Phases 24-31 (in progress)

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

### 🚧 v3.0 Next.js Migration (In Progress)

**Milestone Goal:** Migrate the entire SCLA stack from separate React SPAs + Express backend into a unified Next.js 15 App Router application with Supabase Auth, preserving all v2.1 functionality.

- [x] **Phase 24: Foundation** — Next.js project scaffolding, Supabase client, Drizzle integration, workspace restructure (completed 2026-04-11)
- [ ] **Phase 25: Authentication** — Supabase Auth replacing custom JWT, middleware, registration/login/session
- [ ] **Phase 26: Resident Core** — Home, bills, wallet, maintenance tickets, profile
- [ ] **Phase 27: Resident Secondary** — Facilities/bookings, Discover, Info Centre, notifications
- [ ] **Phase 28: Admin Portal** — Dashboard, user management, content management, audit logs, wallet operations
- [ ] **Phase 29: Real-time & Communication** — WebSocket chat, push notifications, email, in-app notifications
- [ ] **Phase 30: i18n & UX Polish** — Myanmar/English i18n, dark mode, PWA, mobile layout, loading states
- [ ] **Phase 31: Testing & CI** — Unit tests, integration tests, E2E tests, CI/CD pipeline

## Phase Details

### Phase 24: Foundation
**Goal**: A working Next.js 15 monolith exists that developers can run locally, connects to Supabase PostgreSQL via Drizzle, and replaces the three-app PNPM workspace structure
**Depends on**: Phase 23 (previous milestone complete)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, TEST-05
**Success Criteria** (what must be TRUE):
  1. `pnpm dev` starts a single Next.js app (not three separate processes) that renders a homepage
  2. Supabase PostgreSQL connection is verified — Drizzle queries return data from the existing schema
  3. Shared UI components (Radix/shadcn) render correctly in both resident and admin route groups
  4. The seed script populates demo accounts and can be run against the Next.js dev environment
  5. The old artifacts/scla, artifacts/admin, artifacts/api-server directories are removed from the workspace
**Plans**: 2 plans
Plans:
- [x] 24-01-PLAN.md — Next.js 15 scaffold with Supabase client, Drizzle ORM, route groups
- [x] 24-02-PLAN.md — shadcn/ui components, seed script port, old artifacts removal
**UI hint**: yes

### Phase 25: Authentication
**Goal**: Users can register, log in, and stay logged in via Supabase Auth, with middleware enforcing resident vs admin route protection, replacing all custom JWT flows
**Depends on**: Phase 24
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07
**Success Criteria** (what must be TRUE):
  1. User can register with email and password and land on the resident dashboard
  2. User can log in and stay logged in across browser refreshes (Supabase cookie session)
  3. Unauthenticated requests to resident routes redirect to the login page
  4. Non-admin accounts hitting admin routes are redirected to the admin login page
  5. A guest user can submit an upgrade request and the admin approval workflow completes end-to-end
**Plans**: 2 plans
Plans:
- [ ] 25-01-PLAN.md — Auth pages (login, register, admin login), Server Actions, middleware route protection
- [ ] 25-02-PLAN.md — Guest upgrade workflow, admin approval, seed script Supabase Auth migration

### Phase 26: Resident Core
**Goal**: Authenticated residents can manage their apartment finances and maintenance — viewing bills, paying invoices, managing wallet, creating and tracking maintenance tickets, and editing their profile — all via Server Components
**Depends on**: Phase 25
**Requirements**: RES-01, RES-02, RES-03, RES-04, RES-10, RES-11, RES-12
**Success Criteria** (what must be TRUE):
  1. Resident sees the correct home dashboard (guest vs resident content differs visually)
  2. Resident can view bills with line items and filter by status (paid/unpaid/overdue)
  3. Resident can pay an invoice and see wallet balance decrease accordingly
  4. Resident can create a maintenance ticket in any of the 8 categories and attach a photo
  5. Resident can view wallet transaction history and edit their profile details
**Plans**: 2 plans
Plans:
- [ ] 25-01-PLAN.md — Auth pages (login, register, admin login), Server Actions, middleware route protection
- [ ] 25-02-PLAN.md — Guest upgrade workflow, admin approval, seed script Supabase Auth migration
**UI hint**: yes

### Phase 27: Resident Secondary
**Goal**: Residents can book facilities, browse community content, and manage notification preferences — completing the full resident feature surface in the Next.js app
**Depends on**: Phase 26
**Requirements**: RES-05, RES-06, RES-07, RES-08, RES-09
**Success Criteria** (what must be TRUE):
  1. Resident can browse SCSC facilities and book an hourly slot (including recurring weekly)
  2. Resident can cancel a booking and bulk-cancel recurring bookings
  3. Resident can view the Discover page showing announcements, newsletters, and promotions
  4. Resident can browse Info Centre articles by category
  5. Resident can view notification list and manage notification preferences
**Plans**: 2 plans
Plans:
- [ ] 25-01-PLAN.md — Auth pages (login, register, admin login), Server Actions, middleware route protection
- [ ] 25-02-PLAN.md — Guest upgrade workflow, admin approval, seed script Supabase Auth migration
**UI hint**: yes

### Phase 28: Admin Portal
**Goal**: Admin staff can perform all management operations — user management, content moderation, ticket handling, wallet adjustments, and audit log review — through the unified Next.js admin route group
**Depends on**: Phase 25
**Requirements**: ADM-01, ADM-02, ADM-03, ADM-04, ADM-05, ADM-06, ADM-07, ADM-08, ADM-09, ADM-10
**Success Criteria** (what must be TRUE):
  1. Admin sees a KPI dashboard with resident, ticket, and booking counts on login
  2. Admin can list users, view user detail, and assign roles
  3. Admin can approve or reject a resident upgrade request
  4. Admin can update maintenance ticket status and manage facility bookings
  5. Admin can credit or debit a resident wallet and see the action appear in audit logs with actor/date
**Plans**: 2 plans
Plans:
- [ ] 25-01-PLAN.md — Auth pages (login, register, admin login), Server Actions, middleware route protection
- [ ] 25-02-PLAN.md — Guest upgrade workflow, admin approval, seed script Supabase Auth migration
**UI hint**: yes

### Phase 29: Real-time & Communication
**Goal**: Ticket chat works in real-time via WebSocket (with polling fallback), residents and admins receive push and email notifications, and the in-app notification feed shows unread counts — all operating within the Next.js architecture
**Depends on**: Phase 26
**Requirements**: COMM-01, COMM-02, COMM-03, COMM-04, COMM-05
**Success Criteria** (what must be TRUE):
  1. Messages in ticket detail chat appear for both resident and admin without page refresh (WebSocket)
  2. When WebSocket is unavailable, chat falls back to polling and messages still appear
  3. Resident receives a browser push notification for bill overdue and ticket status updates
  4. Resident receives a transactional email via Resend for bill overdue events
  5. In-app notification bell shows an unread count badge that clears on viewing
**Plans**: 2 plans
Plans:
- [ ] 25-01-PLAN.md — Auth pages (login, register, admin login), Server Actions, middleware route protection
- [ ] 25-02-PLAN.md — Guest upgrade workflow, admin approval, seed script Supabase Auth migration

### Phase 30: i18n & UX Polish
**Goal**: The app renders correctly in both English and Myanmar, dark mode works with system detection and manual toggle, the mobile layout uses bottom navigation, the PWA installs and caches content offline, and all async pages show loading states
**Depends on**: Phase 27
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05
**Success Criteria** (what must be TRUE):
  1. Switching language between English and Myanmar changes all UI text without page reload
  2. Enabling dark mode (manual or via system preference) applies the correct theme across all pages
  3. Resident app displays a bottom navigation bar on mobile viewports
  4. The app can be installed as a PWA and core pages load while offline
  5. Every Server Component page shows a skeleton or spinner during data fetch, and error boundaries catch failures gracefully
**Plans**: 2 plans
Plans:
- [ ] 25-01-PLAN.md — Auth pages (login, register, admin login), Server Actions, middleware route protection
- [ ] 25-02-PLAN.md — Guest upgrade workflow, admin approval, seed script Supabase Auth migration
**UI hint**: yes

### Phase 31: Testing & CI
**Goal**: The Next.js app has equivalent test coverage to v2.1 — unit tests, API route integration tests, and Playwright E2E tests — all running in a GitHub Actions CI pipeline on every push
**Depends on**: Phase 30
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. Unit tests covering auth middleware, password hashing, and scheduler run with Vitest and pass
  2. API route integration tests covering auth, bills, tickets, and bookings pass against a test database
  3. Playwright E2E tests for login, ticket creation, and facility booking pass against the Next.js dev server
  4. GitHub Actions CI runs lint, typecheck, unit tests, and integration tests on every push/PR to main
**Plans**: 2 plans
Plans:
- [ ] 25-01-PLAN.md — Auth pages (login, register, admin login), Server Actions, middleware route protection
- [ ] 25-02-PLAN.md — Guest upgrade workflow, admin approval, seed script Supabase Auth migration

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
| 24. Foundation | v3.0 | 2/2 | Complete    | 2026-04-11 |
| 25. Authentication | v3.0 | 0/2 | Not started | - |
| 26. Resident Core | v3.0 | 0/TBD | Not started | - |
| 27. Resident Secondary | v3.0 | 0/TBD | Not started | - |
| 28. Admin Portal | v3.0 | 0/TBD | Not started | - |
| 29. Real-time & Communication | v3.0 | 0/TBD | Not started | - |
| 30. i18n & UX Polish | v3.0 | 0/TBD | Not started | - |
| 31. Testing & CI | v3.0 | 0/TBD | Not started | - |
