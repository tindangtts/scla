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

Next milestone (v2.0 Production-Ready). Phases 11-15.

### Payment Integration

- **PAY-01**: Real WavePay payment integration with callback handling
- **PAY-02**: Real KBZPay payment integration with callback handling
- **PAY-03**: Payment receipt generation and download

### Security Improvements

- **SEC-01**: Migrate from SHA256 to bcrypt/argon2 password hashing
- **SEC-02**: Add rate limiting to authentication endpoints
- **SEC-03**: Add CSRF protection

### Communication

- **COMM-01**: Push notifications via web push or Firebase
- **COMM-02**: Email notifications for critical events (bill due, ticket update)
- **COMM-03**: In-app chat between resident and maintenance staff

### Enhanced Features

- **ENH-01**: Multi-language support (English, Myanmar)
- **ENH-02**: Dark mode theme toggle
- **ENH-03**: Offline support with service worker
- **ENH-04**: Image upload for ticket attachments (currently URL only)
- **ENH-05**: Recurring facility bookings

### API Hardening & Code Quality

- **QUAL-01**: Add admin auth to upgrade-requests endpoints (GET list, POST approve, POST reject)
- **QUAL-02**: Fix race conditions in booking/ticket number generation with atomic DB sequences
- **QUAL-03**: Wrap multi-step upgrade operations in database transactions
- **QUAL-04**: Add global Express error handler with consistent JSON error responses
- **QUAL-05**: Refactor all routes to use shared auth middleware instead of inline JWT verification
- **QUAL-06**: Fix float arithmetic in invoice calculations (use integer cents)
- **QUAL-07**: Add proper TypeScript types to all route handlers (eliminate `any` types)
- **QUAL-08**: Add password validation on admin staff creation (min 8 chars)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first approach, PWA possible later |
| Real-time chat | High complexity, not core to resident management |
| Video surveillance integration | Separate system, security concerns |
| OAuth/social login | Custom JWT sufficient for estate residents |
| Multi-estate support | Single estate deployment, not multi-tenant |

## Traceability

All v1 requirements are already implemented (brownfield project). v2 requirements map to Phases 11-14.

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
| SEC-01 | Phase 11 | Complete |
| SEC-02 | Phase 11 | Complete |
| SEC-03 | Phase 11 | Complete |
| PAY-01 | Phase 12 | Pending |
| PAY-02 | Phase 12 | Pending |
| PAY-03 | Phase 12 | Pending |
| COMM-01 | Phase 13 | Complete |
| COMM-02 | Phase 13 | Complete |
| COMM-03 | Phase 13 | Complete |
| ENH-01 | Phase 14 | Pending |
| ENH-02 | Phase 14 | Pending |
| ENH-03 | Phase 14 | Pending |
| ENH-04 | Phase 14 | Pending |
| ENH-05 | Phase 14 | Pending |
| QUAL-01 | Phase 15 | Complete |
| QUAL-02 | Phase 15 | Complete |
| QUAL-03 | Phase 15 | Complete |
| QUAL-04 | Phase 15 | Complete |
| QUAL-05 | Phase 15 | Complete |
| QUAL-06 | Phase 15 | Complete |
| QUAL-07 | Phase 15 | Complete |
| QUAL-08 | Phase 15 | Complete |

**Coverage:**
- v1 requirements: 52 total — Mapped to existing: 52 ✓
- v2 requirements: 22 total — Mapped to Phases 11-15: 22 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-10*
*Last updated: 2026-04-10 after v2.0 roadmap creation*
