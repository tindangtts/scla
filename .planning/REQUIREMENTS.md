# Requirements: Star City Living App (SCLA)

**Defined:** 2026-04-10
**Core Value:** Residents can manage their apartment lifecycle — bills, maintenance, bookings, and community info — from a single mobile-first web app

## v1 Requirements

Requirements mapped from existing codebase. All features below are already implemented.

### Authentication & Users

- [x] **AUTH-01**: Guest user can register with name, email, phone, and password
- [x] **AUTH-02**: User can log in with email/password and receive JWT token
- [x] **AUTH-03**: User session persists via localStorage token (24h expiry)
- [x] **AUTH-04**: User can log out from any page
- [x] **AUTH-05**: User can view and access their profile with user type badge
- [x] **AUTH-06**: Guest user can request upgrade to resident by providing unit number, resident ID, and development name
- [x] **AUTH-07**: Upgrade request shows status (pending/approved/rejected) to the user

### Bill Payment

- [x] **BILL-01**: Resident can view all invoices with status filtering (unpaid, partially paid, paid)
- [x] **BILL-02**: Resident can view invoice detail with line item breakdown (qty x unit price)
- [x] **BILL-03**: Resident can see outstanding balance summary and unpaid invoice count
- [x] **BILL-04**: Resident can initiate payment via mock WavePay/KBZPay redirect
- [x] **BILL-05**: Invoices display month, category (service charge, utility, water), and due date

### Star Assist (Maintenance)

- [x] **TICK-01**: Authenticated user can create a maintenance ticket with title, category, service type, description, and optional attachment
- [x] **TICK-02**: Ticket auto-generates unique ticket number (SA-XXXX)
- [x] **TICK-03**: User can view their tickets filtered by status (open, in progress, completed)
- [x] **TICK-04**: User can view ticket detail with update history (staff response thread)
- [x] **TICK-05**: User can see ticket summary stats (open, in progress, completed counts)
- [x] **TICK-06**: Tickets support 8 categories: Electricals, Plumbing, Housekeeping, General Enquiry, AC, Pest Control, Civil Works, Other

### Facility Bookings (SCSC)

- [x] **BOOK-01**: User can browse all sports centre facilities with rates, hours, and capacity
- [x] **BOOK-02**: User can view available time slots for a facility on a specific date
- [x] **BOOK-03**: Authenticated user can book a facility for a specific time slot
- [x] **BOOK-04**: User can view their bookings filtered by status (upcoming, completed, cancelled)
- [x] **BOOK-05**: User can cancel an upcoming booking
- [x] **BOOK-06**: Booking shows pricing based on membership status (member/non-member rates)

### Discover (Announcements & Promotions)

- [x] **DISC-01**: User can view community announcements feed with pinned items
- [x] **DISC-02**: User can view partner promotions with validity period
- [x] **DISC-03**: User can filter by type (announcements vs newsletters)
- [x] **DISC-04**: User can view full announcement/promotion detail with images
- [x] **DISC-05**: Announcements support audience targeting (all, residents only, guests only)

### Wallet & Deposits

- [x] **WALL-01**: Resident can view main wallet balance and transaction history
- [x] **WALL-02**: Resident can view security deposit balance and transactions
- [x] **WALL-03**: Transactions show type (credit/debit), description, amount, and date

### Info Centre

- [x] **INFO-01**: User can browse info categories with icons and article counts
- [x] **INFO-02**: User can read full articles within a category
- [x] **INFO-03**: Articles support markdown content with images

### Notifications

- [x] **NOTF-01**: User can view notifications with unread badge count
- [x] **NOTF-02**: Notifications link to related items (invoice, ticket, etc.)
- [x] **NOTF-03**: User can mark notifications as read
- [x] **NOTF-04**: Notification types: Ticket Update, Payment Confirmed, Announcement, Booking Reminder, General

### Home Dashboard

- [x] **HOME-01**: Guest home shows upgrade prompt, latest announcement, latest promotion, and quick links
- [x] **HOME-02**: Resident home shows outstanding balance, unpaid count, open tickets, wallet balance, and community content
- [x] **HOME-03**: Home page provides quick action buttons to key features

### Admin Portal

- [x] **ADMN-01**: Admin staff can log in with separate admin JWT authentication
- [x] **ADMN-02**: Admin dashboard shows KPI stats overview
- [x] **ADMN-03**: Admin can search, filter, and view user details with related tickets/bookings
- [x] **ADMN-04**: Admin can manage upgrade requests (approve/reject with notes)
- [x] **ADMN-05**: Content manager can CRUD announcements, promotions, and FAQs
- [x] **ADMN-06**: Ticket handler can view and update tickets with staff responses
- [x] **ADMN-07**: Booking manager can view and cancel bookings
- [x] **ADMN-08**: Admin can CRUD facilities (name, rates, hours, capacity)
- [x] **ADMN-09**: Admin can manage staff users (create, update, activate/deactivate)
- [x] **ADMN-10**: Role-based access control: admin, content_manager, ticket_handler, booking_manager, user_verifier

## v2 Requirements

<details>
<summary>v2.0 Production-Ready (All Complete)</summary>

### Security Improvements

- [x] **SEC-01**: Migrate from SHA256 to bcrypt/argon2 password hashing — Phase 11
- [x] **SEC-02**: Add rate limiting to authentication endpoints — Phase 11
- [x] **SEC-03**: Add CSRF protection — Phase 11

### Communication

- [x] **COMM-01**: Push notifications via web push or Firebase — Phase 13
- [x] **COMM-02**: Email notifications for critical events (bill due, ticket update) — Phase 13
- [x] **COMM-03**: In-app chat between resident and maintenance staff — Phase 13

### Enhanced Features

- [x] **ENH-01**: Multi-language support (English, Myanmar) — Phase 14
- [x] **ENH-02**: Dark mode theme toggle — Phase 14
- [x] **ENH-03**: Offline support with service worker — Phase 14
- [x] **ENH-04**: Image upload for ticket attachments (currently URL only) — Phase 14
- [x] **ENH-05**: Recurring facility bookings — Phase 14

### API Hardening & Code Quality

- [x] **QUAL-01**: Add admin auth to upgrade-requests endpoints — Phase 15
- [x] **QUAL-02**: Fix race conditions in booking/ticket number generation — Phase 15
- [x] **QUAL-03**: Wrap multi-step upgrade operations in database transactions — Phase 15
- [x] **QUAL-04**: Add global Express error handler — Phase 15
- [x] **QUAL-05**: Refactor all routes to use shared auth middleware — Phase 16
- [x] **QUAL-06**: Fix float arithmetic in invoice calculations — Phase 15
- [x] **QUAL-07**: Add proper TypeScript types to all route handlers — Phase 15
- [x] **QUAL-08**: Add password validation on admin staff creation — Phase 15

### Scheduler & Migration

- [x] **SCHED-01**: Bill-overdue email/push scheduler — Phase 17
- [x] **SCHED-02**: DB migration auto-apply at startup — Phase 17

</details>

### Payment Integration (DEFERRED — missing gateway documents)

- **PAY-01**: Real WavePay payment integration with callback handling
- **PAY-02**: Real KBZPay payment integration with callback handling
- **PAY-03**: Payment receipt generation and download

## v2.1 Requirements

Milestone v2.1: Quality & Infrastructure Gaps

### Testing

- [x] **TEST-01**: API integration tests cover auth endpoints (register, login, me, upgrade)
- [x] **TEST-02**: API integration tests cover bill endpoints (list, detail, summary, pay)
- [x] **TEST-03**: API integration tests cover ticket endpoints (create, list, detail, messages)
- [x] **TEST-04**: API integration tests cover booking endpoints (create, list, cancel, slots)
- [x] **TEST-05**: Unit tests cover auth middleware (JWT verification, role checks)
- [x] **TEST-06**: Unit tests cover scheduler logic (bill-overdue detection, notification triggers)
- [x] **TEST-07**: Unit tests cover password hashing (bcrypt, SHA256 migration path)
- [x] **TEST-08**: E2E tests cover resident login and home dashboard flow
- [ ] **TEST-09**: E2E tests cover ticket creation and chat flow
- [ ] **TEST-10**: E2E tests cover facility booking and cancellation flow

### CI/CD & DevOps

- [x] **CICD-01**: GitHub Actions CI runs lint, type-check, and tests on push/PR
- [x] **CICD-02**: CI fails on type errors or test failures, blocks merge
- [x] **CICD-03**: Automated deploy to Replit triggered on merge to main
- [x] **CICD-04**: Scheduled PostgreSQL backup automation (daily)
- [x] **CICD-05**: Documented backup restore procedure with verification steps

### Audit & Logging

- [x] **AUDIT-01**: Admin actions logged to audit_logs table (who, what, when, target)
- [x] **AUDIT-02**: Upgrade approvals/rejections create audit trail
- [x] **AUDIT-03**: Booking cancellations by admin create audit trail
- [x] **AUDIT-04**: Staff account changes (create, deactivate) create audit trail

### Real-time Communication

- [x] **RT-01**: Ticket chat uses WebSocket instead of 4s polling
- [x] **RT-02**: Chat messages delivered in real-time to both resident and staff
- [x] **RT-03**: WebSocket gracefully falls back to polling if connection fails

### Developer Experience

- [x] **DX-01**: Seed script creates demo residents, guests, and staff accounts
- [x] **DX-02**: Seed script populates invoices, tickets, bookings, and announcements
- [x] **DX-03**: Seed script is idempotent (safe to re-run)

### Wallet & Transactions

- [x] **WALLET-01**: Resident can view wallet transaction history with filters
- [x] **WALLET-02**: Bill payment deducts from wallet balance
- [x] **WALLET-03**: Admin can credit/debit wallet with reason (manual adjustment)
- [x] **WALLET-04**: Security deposit deductions logged with reason

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first approach, PWA possible later |
| Video surveillance integration | Separate system, security concerns |
| OAuth/social login | Custom JWT sufficient for estate residents |
| Multi-estate support | Single estate deployment, not multi-tenant |
| Real WavePay/KBZPay payment | Deferred — missing gateway documents |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 through AUTH-07 | Existing | Complete |
| BILL-01 through BILL-05 | Existing | Complete |
| TICK-01 through TICK-06 | Existing | Complete |
| BOOK-01 through BOOK-06 | Existing | Complete |
| DISC-01 through DISC-05 | Existing | Complete |
| WALL-01 through WALL-03 | Existing | Complete |
| INFO-01 through INFO-03 | Existing | Complete |
| NOTF-01 through NOTF-04 | Existing | Complete |
| HOME-01 through HOME-03 | Existing | Complete |
| ADMN-01 through ADMN-10 | Existing | Complete |
| SEC-01 through SEC-03 | Phase 11 | Complete |
| COMM-01 through COMM-03 | Phase 13 | Complete |
| ENH-01 through ENH-05 | Phase 14 | Complete |
| QUAL-01 through QUAL-08 | Phase 15-16 | Complete |
| SCHED-01, SCHED-02 | Phase 17 | Complete |
| PAY-01 through PAY-03 | — | Deferred |
| DX-01, DX-02, DX-03 | Phase 18 | Pending |
| TEST-05, TEST-06, TEST-07 | Phase 18 | Pending |
| TEST-01, TEST-02, TEST-03, TEST-04 | Phase 19 | Pending |
| AUDIT-01, AUDIT-02, AUDIT-03, AUDIT-04 | Phase 20 | Pending |
| WALLET-01, WALLET-02, WALLET-03, WALLET-04 | Phase 20 | Pending |
| RT-01, RT-02, RT-03 | Phase 21 | Pending |
| CICD-01, CICD-02, CICD-03, CICD-04, CICD-05 | Phase 22 | Pending |
| TEST-08, TEST-09, TEST-10 | Phase 23 | Pending |

**Coverage:**
- v1 requirements: 52 total — Complete ✓
- v2.0 requirements: 22 total — Complete ✓ (PAY-01-03 deferred)
- v2.1 requirements: 29 total — Mapped ✓ (Phases 18-23, all pending)
- Unmapped: 0

---
*Requirements defined: 2026-04-10*
*Last updated: 2026-04-11 after v2.1 roadmap — all 29 requirements mapped*
