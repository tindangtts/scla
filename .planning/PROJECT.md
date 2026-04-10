# Star City Living App (SCLA)

## What This Is

A full-stack resident community management web application for StarCity Estate in Yangon, Myanmar, serving 9,000+ residents across three developments (City Loft, Estella, ARA). Provides residents with bill payments, maintenance ticketing, facility bookings, community announcements, and an admin portal for estate management staff.

## Core Value

Residents can manage their apartment lifecycle — bills, maintenance, bookings, and community info — from a single mobile-first web app without visiting the management office.

## Requirements

### Validated

- ✓ Guest and resident user registration/login with JWT authentication — existing
- ✓ Guest-to-resident upgrade request workflow with admin approval — existing
- ✓ Bill viewing with invoice line items, status filtering, and mock payment (WavePay/KBZPay) — existing
- ✓ Star Assist maintenance ticket creation with 8 categories and staff response thread — existing
- ✓ SCSC facility browsing with hourly slot booking and cancellation — existing
- ✓ Discover page with announcements, newsletters, and partner promotions — existing
- ✓ Wallet and security deposit balance viewing with transaction history — existing
- ✓ Info Centre with categorized knowledge base articles — existing
- ✓ Notification system with unread badges and related item linking — existing
- ✓ Home dashboard with dynamic content by user type (guest vs resident) — existing
- ✓ Admin portal with role-based access (admin, content manager, ticket handler, booking manager, user verifier) — existing
- ✓ Admin CRUD for users, announcements, promotions, FAQs, facilities, tickets, bookings, and staff — existing
- ✓ Admin dashboard with KPI stats — existing
- ✓ Database seeding with demo accounts and sample data — existing
- ✓ bcrypt password hashing with transparent SHA256 migration on login — Phase 11
- ✓ Rate limiting on auth endpoints (5 req/min/IP, 429 response) — Phase 11
- ✓ Helmet security headers + CORS tightened to specific origins — Phase 11
- ✓ JWT secret management hardened (no fallback, admin 8h expiry) — Phase 11

### Active

(To be defined for next phase)

### Out of Scope

(To be defined based on next milestone goals)

## Context

- **Tech stack**: React 19 + TypeScript + Vite (frontend), Express 5 + TypeScript (backend), PostgreSQL + Drizzle ORM (database), deployed on Replit
- **Monorepo**: PNPM workspaces with artifacts (scla, admin, api-server, mockup-sandbox) and libs (db, api-client-react, api-zod, api-spec)
- **UI framework**: Tailwind CSS 4 + Radix UI + Framer Motion, mobile-first design with bottom navigation
- **Design system**: Primary Deep Teal (`hsl(185, 62%, 32%)`), Accent Warm Gold (`hsl(40, 80%, 52%)`)
- **Auth**: Custom JWT (HS256) with separate user/admin tokens, SHA256 password hashing with salt
- **API generation**: OpenAPI 3.1 spec with Orval-generated React hooks
- **Three estates**: City Loft, Estella, ARA
- **Demo accounts**: resident@starcity.com / demo@starcity.com / admin@starcity.com

## Constraints

- **Platform**: Deployed on Replit — must stay compatible with Replit hosting
- **Mobile-first**: UI optimized for mobile screens, bottom nav pattern
- **Monorepo**: All changes must respect PNPM workspace structure
- **Password security**: Currently using SHA256 with static salt (known limitation)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Custom JWT over OAuth | Simpler for v1, full control over auth flow | ✓ Good |
| Drizzle ORM over Prisma | Type-safe, lightweight, better Replit compatibility | ✓ Good |
| Wouter over React Router | Lightweight routing for mobile-first SPA | ✓ Good |
| Express 5 over Hono/Fastify | Stable ecosystem, team familiarity | ✓ Good |
| Monorepo with PNPM workspaces | Shared types and schemas across frontend/backend/admin | ✓ Good |
| Mock payment integration | WavePay/KBZPay redirect stubs, real integration deferred | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-10 after Phase 11 completion*
