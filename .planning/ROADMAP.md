# Roadmap: Star City Living App (SCLA)

## Milestones

- ✅ **v1.0 Foundation** — Phases 1-10 (shipped 2026-04-10)
- ✅ **v2.0 Production-Ready** — Phases 11-17 (shipped 2026-04-10)
- ✅ **v2.1 Quality & Infrastructure Gaps** — Phases 18-23 (shipped 2026-04-11)
- ✅ **v3.0 Next.js Migration** — Phases 24-32 (shipped 2026-04-12)
- 🚧 **v3.1 Deploy-Ready Polish** — Phases 33-35 (in progress, started 2026-04-12)

## Phases

<details>
<summary>✅ v1.0 Foundation (Phases 1-10) — SHIPPED 2026-04-10</summary>

All 52 v1 requirements implemented. Covers authentication, bill payment, maintenance ticketing, facility bookings, discover/announcements, wallet, info centre, notifications, home dashboard, and admin portal.

See `.planning/milestones/v1.0-REQUIREMENTS.md` for full list.

</details>

<details>
<summary>✅ v2.0 Production-Ready (Phases 11-17) — SHIPPED 2026-04-10</summary>

6 active phases, 25 plans, 19 requirements completed. Phase 12 (Payment) deferred.

See `.planning/milestones/v2.0-ROADMAP.md` for full details.

</details>

<details>
<summary>✅ v2.1 Quality & Infrastructure Gaps (Phases 18-23) — SHIPPED 2026-04-11</summary>

6 phases, 13 plans, 29 requirements. Testing, CI/CD, audit logging, WebSocket chat, wallet transactions.

See `.planning/milestones/v2.1-ROADMAP.md` for full details.

</details>

<details>
<summary>✅ v3.0 Next.js Migration (Phases 24-32) — SHIPPED 2026-04-12</summary>

9 phases, 21 plans, 42 tasks, 49 requirements. Full stack migration from Express + Vite SPAs to unified Next.js 15 App Router with Supabase Auth.

- [x] Phase 24: Foundation (2/2 plans) — Next.js scaffold, Supabase, Drizzle, workspace restructure
- [x] Phase 25: Authentication (2/2 plans) — Supabase Auth, middleware, upgrade workflow
- [x] Phase 26: Resident Core (2/2 plans) — Dashboard, bills, wallet, tickets, profile
- [x] Phase 27: Resident Secondary (2/2 plans) — Bookings, discover, info centre, notifications
- [x] Phase 28: Admin Portal (3/3 plans) — Dashboard, users, tickets, content, staff, audit, wallets
- [x] Phase 29: Real-time & Communication (5/5 plans) — WS chat, push, email, notification bell
- [x] Phase 30: i18n & UX Polish (2/2 plans) — EN/MY i18n, dark mode, PWA, loading states
- [x] Phase 31: Testing & CI (2/2 plans) — Unit/integration/E2E tests, GitHub Actions
- [x] Phase 32: Integration Fixes & Polish (1/1 plan) — Admin routing, bottom nav, formatting

See `.planning/milestones/v3.0-ROADMAP.md` for full details.

</details>

### v3.1 Deploy-Ready Polish (Phases 33-35)

**Milestone goal:** Close gaps from v3.0 UI review, complete Myanmar i18n, fix typecheck blockers, and ship to Vercel production with verified end-to-end flows.

**Granularity:** coarse (3 phases for 19 requirements)

- [x] **Phase 33: UI Polish** — Restore brand warmth on auth pages, strengthen bottom nav, verify status badge rendering and admin/resident visual distinction (completed 2026-04-12)
- [x] **Phase 34: i18n Backfill + Typecheck Cleanup** — Complete Myanmar translations for v3.0 UI strings and resolve pre-existing typecheck errors blocking CI (completed 2026-04-12)
- [ ] **Phase 35: Vercel Deployment** — Configure Vercel project, migrate secrets, set up cron, deploy preview + production, and document WebSocket deferral

## Phase Details

### Phase 33: UI Polish
**Goal**: Residents see a warm, polished UI on login and home pages, with clear active-tab feedback and consistent status badge styling across themes.
**Depends on**: Nothing (builds on v3.0 theme foundation already committed in Phase 32)
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. Resident visiting the login page sees the SC logo mark and decorative gradient/blur accents (brand warmth restored)
  2. Resident who has not subscribed to push notifications sees the push-notification banner on the home page; banner disappears after subscription
  3. Resident tapping bottom nav tabs sees a clearly visible active-tab indicator (line/dot/color flash) with tap targets at least 44px
  4. Resident views bills, tickets, and bookings in both light and dark mode and sees correctly tinted status badges (unpaid, paid, open, upcoming, etc.)
  5. Admin visiting the admin login page sees a visually distinct darker theme, clearly differentiating it from resident login
**Plans**: 1 plan (coarse — closes all five UI gaps in a single plan per deep-work rules)
  - [x] 33-01-PLAN.md — Close all five UI gaps (SC mark on login, push banner wire, bottom-nav indicator, badge dark-mode tuning, admin login verification)
**UI hint**: yes

### Phase 34: i18n Backfill + Typecheck Cleanup
**Goal**: Myanmar speakers see full translations across every route, and CI typecheck runs clean on every PR/push.
**Depends on**: Phase 33 (UI work may introduce final strings needing translation)
**Requirements**: I18N-01, I18N-02, I18N-03, TYPE-01, TYPE-02
**Success Criteria** (what must be TRUE):
  1. Every user-facing string introduced during v3.0 UI migration has a Myanmar translation present in `messages/my.json`
  2. Translation key counts match exactly between `messages/en.json` and `messages/my.json` — no orphaned keys in either direction
  3. Full EN↔MY locale toggle pass confirms every route (resident + admin) renders in both locales with no English fallback text leaking into Myanmar mode
  4. `pnpm --filter @workspace/web typecheck` exits with code 0 — no remaining typecheck errors in api route `__tests__` or elsewhere
  5. CI typecheck step passes on every push/PR, unblocking the pipeline for deploy
**Plans**: 1 plan (coarse — i18n audit + typecheck cleanup are independent, file-disjoint concerns bundled under deep_work_rules)
  - [x] 34-01-PLAN.md — Verify EN/MY translation parity (I18N-01/02/03) and fix 13 pre-existing typecheck errors across 6 api route test files (TYPE-01/02)

### Phase 35: Vercel Deployment
**Goal**: Production users reach the SCLA app at a stable HTTPS URL with daily cron running, all secrets securely stored, and chat working via polling fallback.
**Depends on**: Phase 34 (typecheck must pass for CI-green deploy; i18n must be complete for production-ready UI)
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05, DEPLOY-06, WS-01, WS-02
**Success Criteria** (what must be TRUE):
  1. Vercel project is configured with monorepo root `artifacts/web`, install command `pnpm install --frozen-lockfile`, and correct Next.js build command — verifiable in Vercel dashboard
  2. All required env vars (Supabase URL/anon/service role, DATABASE_URL, VAPID public/private, RESEND_API_KEY, CRON_SECRET) are set in Vercel project settings and surface to the running app
  3. Vercel Cron is scheduled to POST `/api/cron/bill-overdue-check` daily with the `x-cron-secret` header; invocation logs confirm the cron fires and responds 200
  4. Preview deployment builds successfully; smoke test (resident login, resident dashboard, admin login, admin dashboard) passes against Supabase
  5. Production deployment on `main` branch is reachable over HTTPS at a `*.vercel.app` (or custom) domain, and ticket chat works via polling fallback with WebSocket deferral documented in-repo
  6. Replit-specific config (`.replit`, `replit.md`) is removed or archived — no residual Replit deploy signals in the repo
**Plans**: 2 plans
  - [x] 35-01-PLAN.md — Deploy prep: vercel.json, cron handler GET/Bearer support, .env.example, DEPLOYMENT.md, remove Replit (autonomous)
  - [ ] 35-02-PLAN.md — Deploy execution: vercel CLI link, env vars, preview + prod deploy, cron verification (requires user)

## v3.1 Coverage

**v3.1 requirements:** 19 total
**Mapped to phases:** 19 / 19 ✓
**Unmapped:** 0

| Requirement | Phase |
|-------------|-------|
| UI-01 | 33 |
| UI-02 | 33 |
| UI-03 | 33 |
| UI-04 | 33 |
| UI-05 | 33 |
| I18N-01 | 34 |
| I18N-02 | 34 |
| I18N-03 | 34 |
| TYPE-01 | 34 |
| TYPE-02 | 34 |
| DEPLOY-01 | 35 |
| DEPLOY-02 | 35 |
| DEPLOY-03 | 35 |
| DEPLOY-04 | 35 |
| DEPLOY-05 | 35 |
| DEPLOY-06 | 35 |
| WS-01 | 35 |
| WS-02 | 35 |

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1-10 | v1.0 | — | Complete | 2026-04-10 |
| 11-17 | v2.0 | 25 | Complete | 2026-04-10 |
| 18-23 | v2.1 | 13 | Complete | 2026-04-11 |
| 24-32 | v3.0 | 21 | Complete | 2026-04-12 |
| 33 | v3.1 | 1/1 | Complete    | 2026-04-12 |
| 34 | v3.1 | 1/1 | Complete    | 2026-04-12 |
| 35 | v3.1 | 1/2 | In Progress|  |
