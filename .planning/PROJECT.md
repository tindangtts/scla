# Star City Living App (SCLA)

## What This Is

A production-grade resident community management web application for StarCity Estate in Yangon, Myanmar, serving 9,000+ residents across three developments (City Loft, Estella, ARA). Provides residents with bill management, maintenance ticketing with in-app chat, facility bookings (including recurring), push/email notifications, community announcements, and a comprehensive admin portal — all with Myanmar language support, dark mode, and offline access.

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

### Active

#### Current Milestone: v2.1 Quality & Infrastructure Gaps

**Goal:** Close engineering quality gaps — automated testing, CI/CD, audit logging, real-time chat, and developer experience improvements.

**Target features:**
- Automated test suite (API integration + critical UI flows)
- CI/CD pipeline (lint, type-check, tests on push)
- Audit logging for admin actions
- Data seeding scripts for dev/demo
- WebSocket chat for ticket messaging
- Backup/recovery automation
- Wallet transaction workflows

### Out of Scope

- Native mobile app — web-first approach, PWA works well
- Real-time chat (WebSocket) — polling at 4s is sufficient for MVP
- Video surveillance integration — separate system
- OAuth/social login — custom JWT sufficient for estate residents
- Multi-estate support — single estate deployment
- Real WavePay/KBZPay payment — deferred (missing gateway documents)

## Context

- **Shipped:** v2.0 Production-Ready on 2026-04-10
- **Codebase:** ~36,000 LOC TypeScript across frontend, admin, and backend
- **Tech stack**: React 19 + TypeScript + Vite, Express 5 + TypeScript, PostgreSQL + Drizzle ORM, Replit
- **Monorepo**: PNPM workspaces (artifacts/scla, artifacts/admin, artifacts/api-server, lib/db)
- **UI**: Tailwind CSS 4 + Radix UI, mobile-first, dark mode enabled
- **i18n**: react-i18next with English + Myanmar (107 translation keys)
- **Auth**: bcrypt + custom JWT (HS256), shared requireAuth/requireAdmin middleware
- **Notifications**: Web Push (VAPID) + Resend email + in-app notifications
- **User preference**: Supabase ecosystem for future migrations

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
| Polling (4s) over WebSocket for chat | Simpler, reliable, upgrade path to Supabase Realtime | ✓ Good |
| Base64 image storage | MVP simplicity, upgrade to Supabase Storage later | — Pending |
| Mock payment integration | WavePay/KBZPay deferred, missing gateway docs | — Pending |

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
*Last updated: 2026-04-11 after v2.1 milestone start*
