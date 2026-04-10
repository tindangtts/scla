# Roadmap: Star City Living App (SCLA)

## Milestones

- ✅ **v1.0 Foundation** - Phases 1-10 (existing brownfield baseline, shipped 2026-04-10)
- 🚧 **v2.0 Production-Ready** - Phases 11-15 (in progress)

## Phases

<details>
<summary>✅ v1.0 Foundation (Phases 1-10) - SHIPPED 2026-04-10</summary>

All 52 v1 requirements implemented and verified in existing codebase. Covers authentication, bill payment, maintenance ticketing, facility bookings, discover/announcements, wallet, info centre, notifications, home dashboard, and admin portal.

See REQUIREMENTS.md for full requirement list.

</details>

### v2.0 Production-Ready (In Progress)

**Milestone Goal:** Elevate SCLA from a functional prototype to a production-grade resident platform with real payment processing, hardened security, proactive resident communication, and quality-of-life UX improvements.

## Phase Details

### Phase 11: Security Hardening
**Goal**: The app is hardened against common attacks and resident credentials are stored securely
**Depends on**: Phase 10 (v1.0 baseline)
**Requirements**: SEC-01, SEC-02, SEC-03
**Success Criteria** (what must be TRUE):
  1. Resident passwords are stored using bcrypt/argon2 (SHA256 no longer used for any account)
  2. Repeated failed login attempts are blocked with a 429 response and a meaningful error message
  3. API requests without a valid CSRF token are rejected when required
  4. Existing resident sessions continue to work after the password hash migration
**Plans**: 3 plans

Plans:
- [x] 11-01-PLAN.md — bcrypt password migration + JWT secret hardening (SEC-01)
- [x] 11-02-PLAN.md — rate limiting on auth endpoints (SEC-02)
- [x] 11-03-PLAN.md — helmet security headers + CORS hardening (SEC-03)

### Phase 12: Real Payment Integration
**Goal**: Residents can complete bill payments through live WavePay and KBZPay gateways and receive downloadable receipts
**Depends on**: Phase 11
**Requirements**: PAY-01, PAY-02, PAY-03
**Success Criteria** (what must be TRUE):
  1. Resident can select WavePay at checkout and be redirected to the real WavePay payment page
  2. Resident can select KBZPay at checkout and be redirected to the real KBZPay payment page
  3. After a successful payment, the invoice status updates to paid without manual admin action
  4. Resident can download a PDF receipt for any paid invoice
**Plans**: TBD
**UI hint**: yes

### Phase 13: Communication & Notifications
**Goal**: Residents receive timely proactive alerts and can communicate directly with maintenance staff
**Depends on**: Phase 11
**Requirements**: COMM-01, COMM-02, COMM-03
**Success Criteria** (what must be TRUE):
  1. Resident receives a push notification on their device when a ticket is updated or a bill is due
  2. Resident receives an email when a critical event occurs (bill overdue, ticket status change)
  3. Resident can send a chat message to maintenance staff from within an open ticket
  4. Maintenance staff can reply to a resident's chat message from the admin portal
**Plans**: TBD
**UI hint**: yes

### Phase 14: UX Enhancements
**Goal**: Residents can use the app in Myanmar language, with a dark theme, offline access, real image uploads, and recurring facility bookings
**Depends on**: Phase 12
**Requirements**: ENH-01, ENH-02, ENH-03, ENH-04, ENH-05
**Success Criteria** (what must be TRUE):
  1. Resident can switch the entire app interface to Myanmar language and back to English
  2. Resident can toggle dark mode and the preference is remembered across sessions
  3. Resident can view their tickets and bookings when the device has no internet connection
  4. Resident can attach a photo directly from their camera or gallery when creating a maintenance ticket
  5. Resident can set a facility booking to repeat weekly and cancel all future occurrences at once
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-10. Foundation | v1.0 | -/- | Complete | 2026-04-10 |
| 11. Security Hardening | v2.0 | 3/3 | Complete    | 2026-04-10 |
| 12. Real Payment Integration | v2.0 | 0/? | Not started | - |
| 13. Communication & Notifications | v2.0 | 0/? | Not started | - |
| 14. UX Enhancements | v2.0 | 0/? | Not started | - |
| 15. API Hardening & Code Quality | v2.0 | 0/? | Not started | - |

### Phase 15: API Hardening & Code Quality
**Goal**: Fix critical auth gaps, race conditions, missing error handling, and type safety issues identified in the codebase audit
**Depends on**: Phase 11
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06, QUAL-07, QUAL-08
**Success Criteria** (what must be TRUE):
  1. GET /auth/upgrade-requests, POST approve, and POST reject all require admin authentication
  2. Booking and ticket number generation uses atomic DB sequences (no race conditions)
  3. Multi-step upgrade operations are wrapped in database transactions
  4. A global Express error handler catches unhandled errors and returns consistent JSON responses
  5. All route handlers use the shared auth middleware instead of inline JWT verification
  6. Invoice amount calculations use integer arithmetic (cents) instead of float
  7. All route handlers have proper TypeScript types (no `any` on req/res)
  8. Admin staff creation validates password length >= 8 characters
**Plans**: TBD
