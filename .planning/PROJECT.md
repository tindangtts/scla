# Star City Living App (SCLA)

## What This Is

A production-grade resident community management web application for StarCity Estate in Yangon, Myanmar, serving 9,000+ residents across three developments (City Loft, Estella, ARA). Provides residents with bill management (with wallet-based payment), maintenance ticketing with real-time WebSocket chat, facility bookings (including recurring), push/email notifications, community announcements, audit-logged admin portal, and comprehensive test coverage — all with Myanmar language support, dark mode, offline access, and CI/CD automation.

## Core Value

Residents can manage their apartment lifecycle — bills, maintenance, bookings, and community info — from a single mobile-first web app without visiting the management office.

## Requirements

### Validated

<details>
<summary>v1.0 Foundation (14 requirements)</summary>

- ✓ Guest and resident user registration/login with JWT authentication — v1.0
- ✓ Guest-to-resident upgrade request workflow with admin approval — v1.0
- ✓ Bill viewing with invoice line items, status filtering, and mock payment — v1.0
- ✓ Star Assist maintenance ticket creation with 8 categories — v1.0
- ✓ SCSC facility browsing with hourly slot booking and cancellation — v1.0
- ✓ Discover page with announcements, newsletters, and promotions — v1.0
- ✓ Wallet and security deposit balance viewing — v1.0
- ✓ Info Centre with categorized knowledge base articles — v1.0
- ✓ Notification system with unread badges — v1.0
- ✓ Home dashboard with dynamic content by user type — v1.0
- ✓ Admin portal with role-based access control — v1.0
- ✓ Admin CRUD for all content types — v1.0
- ✓ Admin dashboard with KPI stats — v1.0
- ✓ Database seeding with demo accounts — v1.0

</details>

<details>
<summary>v2.0 Production-Ready (20 requirements)</summary>

- ✓ bcrypt password hashing with transparent SHA256 migration — v2.0 (Phase 11)
- ✓ Rate limiting on auth endpoints (5 req/min/IP) — v2.0 (Phase 11)
- ✓ Helmet security headers + CORS tightened — v2.0 (Phase 11)
- ✓ JWT secret management hardened — v2.0 (Phase 11)
- ✓ Web Push notifications with service worker — v2.0 (Phase 13)
- ✓ Transactional email via Resend — v2.0 (Phase 13)
- ✓ In-app chat embedded in ticket detail — v2.0 (Phase 13)
- ✓ Multi-language support (English + Myanmar) — v2.0 (Phase 14)
- ✓ Dark mode with system detection — v2.0 (Phase 14)
- ✓ Offline support with cache-first — v2.0 (Phase 14)
- ✓ Photo attachment on tickets — v2.0 (Phase 14)
- ✓ Recurring weekly bookings with bulk cancel — v2.0 (Phase 14)
- ✓ Admin auth on upgrade endpoints + DB transactions — v2.0 (Phase 15)
- ✓ Atomic PostgreSQL sequences for booking/ticket numbers — v2.0 (Phase 15)
- ✓ Global Express error handler — v2.0 (Phase 15)
- ✓ Shared auth middleware (requireAuth + requireAdmin) — v2.0 (Phase 16)
- ✓ Integer arithmetic for invoice calculations — v2.0 (Phase 15)
- ✓ TypeScript types on all route handlers — v2.0 (Phase 15)
- ✓ Bill-overdue email/push scheduler — v2.0 (Phase 17)
- ✓ DB migration auto-apply at startup — v2.0 (Phase 17)

</details>

- ✓ Idempotent seed script with all entity types — v2.1 (Phase 18)
- ✓ Unit tests for auth middleware, scheduler, password hashing (23 tests) — v2.1 (Phase 18)
- ✓ API integration tests for auth, bills, tickets, bookings (72 tests) — v2.1 (Phase 19)
- ✓ Audit logging for admin actions (upgrade, booking cancel, staff, wallet) — v2.1 (Phase 20)
- ✓ Wallet transaction workflows with computed balance — v2.1 (Phase 20)
- ✓ Invoice payment deducts from wallet balance — v2.1 (Phase 20)
- ✓ Admin wallet credit/debit adjustment — v2.1 (Phase 20)
- ✓ WebSocket real-time chat replacing 4s polling — v2.1 (Phase 21)
- ✓ Polling fallback on WebSocket failure — v2.1 (Phase 21)
- ✓ GitHub Actions CI/CD (lint, typecheck, test, deploy) — v2.1 (Phase 22)
- ✓ Daily PostgreSQL backup with restore runbook — v2.1 (Phase 22)
- ✓ Playwright E2E tests for login, tickets, bookings — v2.1 (Phase 23)

### Active

<!-- v3.0 Next.js Migration -->

- [ ] Migrate resident app (artifacts/scla) to Next.js App Router with Server Components
- [ ] Migrate admin portal (artifacts/admin) to Next.js with role-based routing
- [ ] Replace Express API (artifacts/api-server) with Next.js API routes / Server Actions
- [ ] Replace custom JWT auth with Supabase Auth (email/password)
- [ ] Supabase Auth middleware for route protection (resident vs admin roles)
- [ ] Preserve all existing functionality: bills, tickets, bookings, wallet, notifications, chat
- [ ] Migrate i18n (English + Myanmar) to next-intl or equivalent
- [ ] Migrate dark mode and PWA/offline support to Next.js
- [ ] Migrate WebSocket real-time chat to Next.js architecture
- [ ] Migrate E2E and integration tests to Next.js test infrastructure

## Current Milestone: v3.0 Next.js Migration

**Goal:** Migrate the entire SCLA stack from separate React SPAs + Express backend into a unified Next.js application with Supabase Auth, preserving all v2.1 functionality.

**Target features:**
- Unified Next.js App Router replacing 3 separate apps
- Server Components + Server Actions replacing Express REST + client fetching
- Supabase Auth replacing custom JWT
- Middleware-based route protection (resident vs admin)
- Preserved functionality: bills, tickets, bookings, wallet, chat, notifications, admin
- Incremental migration with feature parity validation

### Out of Scope

- Native mobile app — web-first approach, PWA works well
- Video surveillance integration — separate system
- ~~OAuth/social login~~ — Now using Supabase Auth (email/password only, no social providers yet)
- Multi-estate support — single estate deployment
- Real WavePay/KBZPay payment — deferred (missing gateway documents)

## Context

- **Shipped:** v2.1 Quality & Infrastructure Gaps on 2026-04-11
- **Codebase:** ~38,000 LOC TypeScript across frontend, admin, backend, and tests
- **Test coverage:** 95+ unit/integration tests (Vitest), 3 E2E test suites (Playwright)
- **Pre-migration stack**: React 19 + Vite (2 SPAs) + Express 5 + Drizzle ORM + PostgreSQL
- **Migration target**: Next.js 15 + App Router + Supabase Auth + Drizzle ORM + PostgreSQL (Supabase)
- **Monorepo**: PNPM workspaces — migrating from multi-app to unified Next.js
- **UI**: Tailwind CSS 4 + Radix UI, mobile-first, dark mode enabled
- **i18n**: react-i18next → next-intl (English + Myanmar, 107 translation keys)
- **Auth**: custom JWT → Supabase Auth (email/password)
- **Notifications**: Web Push (VAPID) + Resend email + in-app notifications
- **Real-time**: WebSocket (ws) for ticket chat, polling fallback
- **CI/CD**: GitHub Actions (lint + typecheck + test + deploy), daily DB backup
- **Branch**: `migrate-nextjs` — active migration branch

## Constraints

- **Platform**: Deployed on Replit
- **Mobile-first**: Bottom nav, touch-friendly
- **Monorepo**: PNPM workspace structure
- **Env vars required**: SESSION_SECRET, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, RESEND_API_KEY

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Custom JWT over OAuth | Simpler for v1, full control | ✓ Good |
| Drizzle ORM over Prisma | Type-safe, lightweight, Replit compatible | ✓ Good |
| Wouter over React Router | Lightweight for mobile SPA | ✓ Good |
| Express 5 | Stable ecosystem | ✓ Good |
| PNPM monorepo | Shared types across frontend/backend/admin | ✓ Good |
| bcryptjs over node-bcrypt | Pure JS, no native bindings on Replit | ✓ Good |
| Resend for email | Simple API, good developer experience | ✓ Good |
| ws over Socket.IO for WebSocket | Lightweight, no framework overhead | ✓ Good |
| Vitest for testing | Aligns with Vite ecosystem | ✓ Good |
| Computed wallet balance (SUM) | No stored balance field, always consistent | ✓ Good |
| Prettier for lint (no ESLint) | Sufficient for formatting, lightweight | ✓ Good |
| Base64 image storage | MVP simplicity, upgrade to Supabase Storage later | — Pending |
| Mock payment integration | WavePay/KBZPay deferred, missing gateway docs | — Pending |
| Next.js over continuing Vite+Express | Unified SSR, Server Components, Supabase ecosystem alignment | — Pending |
| Supabase Auth over custom JWT | Managed auth, row-level security, session management | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-11 after v3.0 milestone start*
