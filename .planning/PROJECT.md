# Star City Living App (SCLA)

## What This Is

A production-grade resident community management web application for StarCity Estate in Yangon, Myanmar, serving 9,000+ residents across three developments (City Loft, Estella, ARA). Built on Next.js 15 App Router with Supabase Auth, providing residents with bill management (with wallet-based payment), maintenance ticketing with real-time WebSocket chat, facility bookings (including recurring), push/email notifications, community announcements, audit-logged admin portal, and comprehensive test coverage — all with Myanmar language support, dark mode, offline PWA access, and CI/CD automation.

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

(To be defined for next milestone)

<details>
<summary>v3.0 Next.js Migration (49 requirements)</summary>

- ✓ Next.js 15 App Router foundation with Supabase SSR and Drizzle ORM — v3.0 (Phase 24)
- ✓ Supabase Auth replacing custom JWT with middleware route protection — v3.0 (Phase 25)
- ✓ Guest-to-resident upgrade workflow with admin approval — v3.0 (Phase 25)
- ✓ Resident dashboard, bills, wallet, tickets, profile migrated to Server Components — v3.0 (Phase 26)
- ✓ Facility bookings (including recurring), discover, info centre, notifications migrated — v3.0 (Phase 27)
- ✓ Admin portal: dashboard, users, tickets, content, staff, audit logs, wallets — v3.0 (Phase 28)
- ✓ WebSocket real-time chat with HTTP broadcast bridge and polling fallback — v3.0 (Phase 29)
- ✓ Web Push notifications and transactional email via Resend — v3.0 (Phase 29)
- ✓ In-app notification bell with unread count — v3.0 (Phase 29)
- ✓ Bill-overdue cron endpoint triggering notifications — v3.0 (Phase 29 gap closure)
- ✓ i18n (English/Myanmar) via next-intl with cookie-based locale — v3.0 (Phase 30)
- ✓ Dark mode via next-themes with system detection — v3.0 (Phase 30)
- ✓ PWA with offline caching and 18 loading skeletons — v3.0 (Phase 30)
- ✓ 36 unit/integration tests (Vitest) and 8 Playwright E2E tests — v3.0 (Phase 31)
- ✓ GitHub Actions CI pipeline (format, typecheck, tests) — v3.0 (Phase 31)
- ✓ Admin routing fix and code-wide Prettier formatting — v3.0 (Phase 32)

</details>

### Out of Scope

- Native mobile app — web-first approach, PWA works well
- Video surveillance integration — separate system
- ~~OAuth/social login~~ — Now using Supabase Auth (email/password only, no social providers yet)
- Multi-estate support — single estate deployment
- Real WavePay/KBZPay payment — deferred (missing gateway documents)

## Context

- **Shipped:** v3.0 Next.js Migration on 2026-04-12
- **Codebase:** Unified Next.js 15 app at `artifacts/web/` with Drizzle schema at `lib/db/`
- **Stack**: Next.js 15 App Router + Supabase Auth + Supabase PostgreSQL + Drizzle ORM + TypeScript
- **UI**: Tailwind CSS 4 + shadcn/ui (Radix primitives), mobile-first with bottom nav, dark mode
- **i18n**: next-intl with English + Myanmar, cookie-based locale switching
- **Auth**: Supabase Auth (email/password) with cookie sessions and middleware route protection
- **Route groups**: `/admin/*` for staff, `(resident)` group at root for residents
- **Notifications**: Web Push (VAPID) + Resend email + in-app notification bell
- **Real-time**: WebSocket (ws library) for ticket chat with HTTP broadcast bridge (port 3003) and polling fallback
- **Test coverage:** 36 Vitest unit/integration tests + 8 Playwright E2E tests
- **CI/CD**: GitHub Actions (format, typecheck, tests) on every push/PR
- **Branch**: `migrate-nextjs` — merged v3.0 work

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
| Next.js over continuing Vite+Express | Unified SSR, Server Components, Supabase ecosystem alignment | ✓ Good |
| Supabase Auth over custom JWT | Managed auth, cookie sessions, user metadata for roles | ✓ Good |
| @supabase/ssr for Next.js | Official pattern for server/client/middleware helpers | ✓ Good |
| Drizzle ORM retained through migration | Type-safe, schema already production-tested | ✓ Good |
| shadcn/ui over full component library | Composable, owned components, no vendor lock-in | ✓ Good |
| next-intl with cookie-based locale | No URL restructuring, SSR-compatible, instant switch via router.refresh() | ✓ Good |
| Standalone WS server over Next.js custom server | Next.js doesn't natively support WS upgrade; simpler separate process | ✓ Good |
| HTTP broadcast bridge (port 3003) over Redis pub/sub | Single-instance deployment, no extra infra | ✓ Good |
| Route segment `admin/` over `(admin)` group | Route groups don't add URL prefix — caused routing issues in Phase 28, fixed in Phase 32 | ✓ Good |

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
*Last updated: 2026-04-12 after v3.0 milestone completion*
