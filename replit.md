# Star City Living App (SCLA)

## Overview

Full-stack resident community mobile-style web app for StarCity Estate township in Yangon, Myanmar. Serves 9,000+ residents across City Loft, Estella, and ARA developments.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (artifact: `scla`, previewPath `/`)
- **API framework**: Express 5 (artifact: `api-server`, `/api` prefix)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- **Auth**: Custom JWT (HS256, `lib/jwt.ts`)

## Features

- **Bill Payment**: View invoices, pay via WavePay or KBZPay (mock flow)
- **Star Assist**: Create and track support tickets (electricals, plumbing, etc.)
- **SCSC Bookings**: Book sports centre facilities with time slot selection
- **Discover**: Announcements, newsletters, and partner promotions
- **Wallet/Deposits**: View balances and transaction history (residents only)
- **Info Centre**: Browse articles by category
- **Profile**: Account management, resident upgrade request
- **Notifications**: In-app notification centre

## User Types

- **Guest**: Register → browse announcements, create tickets, submit upgrade request
- **Resident**: Full access — bill payment, wallet, unit details, bookings

## Demo Accounts

- Guest: `demo@starcity.com` / `password123`
- Resident: `resident@starcity.com` / `password123`

## Color Theme

- Primary: Deep Teal (`hsl(185, 62%, 32%)`)
- Accent: Warm Gold (`hsl(40, 80%, 52%)`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Admin Portal

Full estate management portal at `/admin/` (artifact: `admin`, previewPath `/admin`).

**Admin Modules**: Dashboard, Users, Upgrade Requests, Content (Announcements + Promotions), Tickets, Facilities + Bookings, FAQs, Staff Management

**Admin Auth**: Separate JWT (`ctx: "admin"` header), stored in `localStorage` as `scla_admin_token`, staff users in `staff_users` table.

**Admin API**: All routes at `/api/admin/...`, NOT in OpenAPI spec — uses raw `fetch` calls in the admin frontend.

**Demo Admin Accounts**:
- Admin: `admin@starcity.com` / `admin123`
- Content Manager: `content@starcity.com` / `content123`
- Ticket Handler: `support@starcity.com` / `support123`

**Roles**: `admin`, `content_manager`, `ticket_handler`, `booking_manager`, `user_verifier`

## Database Schema

Tables: `users`, `upgrade_requests`, `announcements`, `promotions`, `invoices`, `tickets`, `facilities`, `bookings`, `info_categories`, `info_articles`, `notifications`, `staff_users`, `faqs`

Seed data loaded automatically on dev startup (checks before seeding). Staff users are seeded separately via direct SQL (DB already seeded before staff tables added).

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
