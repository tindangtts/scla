# Milestones

## v3.0 Next.js Migration (Shipped: 2026-04-12)

**Phases completed:** 9 phases, 21 plans, 42 tasks

**Key accomplishments:**

- Next.js 15 App Router with Supabase SSR, Drizzle ORM via @workspace/db, Tailwind CSS 4, and dual route groups (resident mobile-first + admin sidebar)
- shadcn/ui component library (Button, Card, Input, Badge) with CSS variable theming, seed script ported to scripts workspace, legacy apps removed
- Supabase Auth login/register/admin-login with Server Actions, middleware route protection, and layout auth guards using getUser() validation
- Guest-to-resident upgrade form with admin approval workflow and idempotent Supabase Auth user seeding for all demo accounts
- Resident dashboard with guest/resident split, bills list with status filtering, invoice payment from wallet, wallet balance view, and profile management
- Maintenance ticket system with list/detail/creation pages, 8-category selection, photo upload (base64), and status filtering
- SCSC facility browsing with hourly slot picker, single/recurring booking creation, and cancel/bulk-cancel via Server Actions
- Discover page with announcements/newsletters/promotions, Info Centre with categorized articles and FAQs, notification list with mark-as-read and email preferences, and More menu navigation
- Admin dashboard with 6 KPI stat cards, user list with search/filter, user detail with role assignment, and complete 9-item sidebar navigation
- Admin pages for ticket management with status/assignment, facility/booking oversight, and full content CRUD (announcements, promotions, FAQs) with audit logging
- Staff CRUD with Supabase Auth sync, filterable audit log viewer, and admin wallet credit/debit with dual audit trail
- WebSocket real-time chat on ticket detail pages with ws library, REST API for persistence, and automatic polling fallback
- Web Push notifications via VAPID service worker and transactional email via Resend with unified notification triggers
- NotificationBell component with red unread badge in resident header, plus notification triggers wired into ticket status changes and message sending
- Cross-process HTTP broadcast endpoint wiring broadcastToTicket() from Next.js message inserts to WS server
- POST /api/cron/bill-overdue-check endpoint that queries overdue invoices and calls notifyBillOverdue() for each, closing the COMM-04 notification gap
- next-intl i18n with English/Myanmar translations, next-themes dark mode with system detection, and responsive bottom nav hidden on desktop
- PWA manifest with offline caching service worker, 18 route-level loading skeletons, and error boundaries for resident and admin sections
- Vitest test suite with 36 tests covering auth/notification/push helpers and all 4 API route handlers using mocked Supabase and Drizzle
- Playwright E2E tests rewritten for Next.js (login, tickets, bookings) with GitHub Actions CI running format, typecheck, and unit tests
- Renamed admin route group to /admin segment, fixed revalidatePath, added client-side bottom nav, dark mode cards, and formatted 153 files

---

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
