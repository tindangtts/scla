# Requirements: Star City Living App (SCLA)

**Defined:** 2026-04-11
**Core Value:** Residents can manage their apartment lifecycle — bills, maintenance, bookings, and community info — from a single mobile-first web app without visiting the management office.

## v3.0 Requirements

Requirements for Next.js migration. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Next.js 15 App Router project initialized with TypeScript, Tailwind CSS 4, and Radix UI
- [x] **FOUND-02**: Supabase client configured with environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- [x] **FOUND-03**: Drizzle ORM integrated with Supabase PostgreSQL (reuse existing schema from lib/db)
- [x] **FOUND-04**: PNPM workspace restructured for Next.js monolith (remove artifacts/scla, artifacts/admin, artifacts/api-server)
- [x] **FOUND-05**: Shared UI component library (shadcn/ui or existing Radix components) available across resident and admin layouts

### Authentication

- [x] **AUTH-01**: User can register with email and password via Supabase Auth
- [x] **AUTH-02**: User can log in and receive Supabase session (replacing custom JWT)
- [x] **AUTH-03**: Supabase Auth middleware protects resident routes (redirect to login if unauthenticated)
- [x] **AUTH-04**: Supabase Auth middleware protects admin routes (redirect to admin login if not admin role)
- [x] **AUTH-05**: Guest user can request upgrade to resident with admin approval workflow
- [x] **AUTH-06**: Existing user data migrated to Supabase Auth (email/password accounts preserved)
- [x] **AUTH-07**: Session persists across browser refresh via Supabase cookie-based sessions

### Resident Features

- [ ] **RES-01**: User can view home dashboard with dynamic content by user type (guest/resident)
- [ ] **RES-02**: User can view bills with invoice line items, status filtering, and payment via wallet
- [x] **RES-03**: User can create and view Star Assist maintenance tickets with 8 categories
- [x] **RES-04**: User can attach photos to maintenance tickets
- [ ] **RES-05**: User can browse SCSC facilities and book hourly slots (including recurring weekly)
- [ ] **RES-06**: User can cancel bookings (including bulk cancel for recurring)
- [ ] **RES-07**: User can view Discover page with announcements, newsletters, and promotions
- [ ] **RES-08**: User can view Info Centre with categorized knowledge base articles
- [ ] **RES-09**: User can view and manage notification preferences
- [ ] **RES-10**: User can view wallet balance and transaction history
- [ ] **RES-11**: User can view and edit profile
- [ ] **RES-12**: User can pay invoices from wallet balance

### Admin Features

- [ ] **ADM-01**: Admin can view dashboard with KPI stats
- [ ] **ADM-02**: Admin can manage users (list, view detail, role assignment)
- [ ] **ADM-03**: Admin can approve/reject resident upgrade requests
- [ ] **ADM-04**: Admin can manage maintenance tickets (status updates, assignment)
- [ ] **ADM-05**: Admin can manage facilities and view bookings
- [ ] **ADM-06**: Admin can manage content (announcements, promotions, newsletters, FAQs)
- [ ] **ADM-07**: Admin can manage staff accounts
- [ ] **ADM-08**: Admin can view audit logs with action/date filters
- [ ] **ADM-09**: Admin can credit/debit resident wallets with audit trail
- [ ] **ADM-10**: Admin layout with sidebar navigation (separate from resident bottom nav)

### Real-time & Communication

- [ ] **COMM-01**: WebSocket real-time chat on ticket detail page (resident and admin)
- [ ] **COMM-02**: Polling fallback when WebSocket connection fails
- [ ] **COMM-03**: Web Push notifications with service worker
- [ ] **COMM-04**: Transactional email via Resend (bill overdue, ticket updates)
- [ ] **COMM-05**: In-app notification system with unread badges

### Internationalization & UX

- [ ] **UX-01**: Multi-language support (English + Myanmar) via next-intl or equivalent
- [ ] **UX-02**: Dark mode with system detection and manual toggle
- [ ] **UX-03**: Mobile-first responsive layout with bottom navigation (resident)
- [ ] **UX-04**: PWA/offline support with cache-first strategy
- [ ] **UX-05**: Loading states and error boundaries for Server Components

### Testing & CI

- [ ] **TEST-01**: Unit tests migrated to Next.js test infrastructure (Vitest or Jest)
- [ ] **TEST-02**: API route integration tests covering auth, bills, tickets, bookings
- [ ] **TEST-03**: E2E tests migrated to Playwright against Next.js dev server
- [ ] **TEST-04**: CI/CD pipeline updated for Next.js build, lint, typecheck, test
- [x] **TEST-05**: Database seed script works with Next.js development workflow

## Future Requirements

Deferred to post-migration.

### Enhancement

- **ENH-01**: Supabase Storage for image uploads (replace base64)
- **ENH-02**: Supabase Row-Level Security (RLS) policies
- **ENH-03**: Real payment integration (WavePay/KBZPay)
- **ENH-04**: Supabase Realtime for chat (replace custom WebSocket)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first approach, PWA sufficient |
| Video surveillance integration | Separate system |
| Social login (OAuth) | Email/password via Supabase Auth sufficient for v3.0 |
| Multi-estate support | Single estate deployment |
| Server-Side Rendering for all pages | Use SSR selectively; client components where interactivity is needed |
| Supabase Edge Functions | Keep logic in Next.js API routes/Server Actions for now |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 24 | Complete |
| FOUND-02 | Phase 24 | Complete |
| FOUND-03 | Phase 24 | Complete |
| FOUND-04 | Phase 24 | Complete |
| FOUND-05 | Phase 24 | Complete |
| AUTH-01 | Phase 25 | Complete |
| AUTH-02 | Phase 25 | Complete |
| AUTH-03 | Phase 25 | Complete |
| AUTH-04 | Phase 25 | Complete |
| AUTH-05 | Phase 25 | Complete |
| AUTH-06 | Phase 25 | Complete |
| AUTH-07 | Phase 25 | Complete |
| RES-01 | Phase 26 | Pending |
| RES-02 | Phase 26 | Pending |
| RES-03 | Phase 26 | Complete |
| RES-04 | Phase 26 | Complete |
| RES-10 | Phase 26 | Pending |
| RES-11 | Phase 26 | Pending |
| RES-12 | Phase 26 | Pending |
| RES-05 | Phase 27 | Pending |
| RES-06 | Phase 27 | Pending |
| RES-07 | Phase 27 | Pending |
| RES-08 | Phase 27 | Pending |
| RES-09 | Phase 27 | Pending |
| ADM-01 | Phase 28 | Pending |
| ADM-02 | Phase 28 | Pending |
| ADM-03 | Phase 28 | Pending |
| ADM-04 | Phase 28 | Pending |
| ADM-05 | Phase 28 | Pending |
| ADM-06 | Phase 28 | Pending |
| ADM-07 | Phase 28 | Pending |
| ADM-08 | Phase 28 | Pending |
| ADM-09 | Phase 28 | Pending |
| ADM-10 | Phase 28 | Pending |
| COMM-01 | Phase 29 | Pending |
| COMM-02 | Phase 29 | Pending |
| COMM-03 | Phase 29 | Pending |
| COMM-04 | Phase 29 | Pending |
| COMM-05 | Phase 29 | Pending |
| UX-01 | Phase 30 | Pending |
| UX-02 | Phase 30 | Pending |
| UX-03 | Phase 30 | Pending |
| UX-04 | Phase 30 | Pending |
| UX-05 | Phase 30 | Pending |
| TEST-01 | Phase 31 | Pending |
| TEST-02 | Phase 31 | Pending |
| TEST-03 | Phase 31 | Pending |
| TEST-04 | Phase 31 | Pending |
| TEST-05 | Phase 24 | Complete |

**Coverage:**
- v3.0 requirements: 49 total (note: original count of 45 was incorrect; actual count is 49)
- Mapped to phases: 49
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-11*
*Last updated: 2026-04-11 after roadmap creation (traceability populated)*
