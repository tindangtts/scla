---
phase: 13-communication-notifications
plan: "03"
subsystem: email-service
tags: [resend, transactional-email, html-templates, notifications, admin]
dependency_graph:
  requires: [13-01-PLAN]
  provides: [email-service-ts, sendEmail, sendTicketStatusEmail, sendBillOverdueEmail]
  affects: [13-04-PLAN, 13-05-PLAN]
tech_stack:
  added: [resend@^4.0.0]
  patterns: [non-throwing-service, emailNotifications-opt-out, scla-html-template]
key_files:
  created:
    - artifacts/api-server/src/lib/email-service.ts
  modified:
    - artifacts/api-server/package.json
    - artifacts/api-server/src/routes/admin.ts
decisions:
  - "Resend SDK initialized lazily at module load — null if RESEND_API_KEY not set, mirroring push-service pattern"
  - "Email only triggered for completed/closed ticket status — push fires for any status change (per D-07)"
  - "sclaEmailTemplate uses teal gradient (#0d9488 to #0f766e) matching SCLA brand color"
  - "FROM_ADDRESS falls back to EMAIL_FROM env var, defaults to SCLA <notifications@starcity.com.mm>"
metrics:
  duration_minutes: 8
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_modified: 3
---

# Phase 13 Plan 03: Transactional Email via Resend with SCLA HTML Templates Summary

**One-liner:** Resend-powered email service with SCLA teal/gold HTML templates — sendTicketStatusEmail and sendBillOverdueEmail helpers with emailNotifications opt-out, wired into admin ticket update path.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install resend and create email-service.ts | 4a269bd | artifacts/api-server/package.json, artifacts/api-server/src/lib/email-service.ts |
| 2 | Wire sendTicketStatusEmail into admin ticket update handler | (included in 13-02 commit 8fcc8a4) | artifacts/api-server/src/routes/admin.ts |

## What Was Built

### email-service.ts
- `sendEmail(to, subject, html)` — core send function using Resend SDK; no-ops with warn log if RESEND_API_KEY not configured
- `sclaEmailTemplate(title, bodyHtml)` — SCLA-branded HTML wrapper: teal gradient header (#0d9488 to #0f766e), white content area, slate footer
- `sendTicketStatusEmail(userId, ticketNumber, ticketTitle, newStatus)` — checks emailNotifications before sending; formats status label; sends ticket update HTML
- `sendBillOverdueEmail(userId, invoiceNumber, amountDue, dueDate)` — checks emailNotifications before sending; red alert styling for overdue invoices

### package.json
- Added `"resend": "^4.0.0"` to dependencies

### admin.ts (PATCH /admin/tickets/:id)
- Imports `sendTicketStatusEmail` from email-service.ts
- Calls `sendTicketStatusEmail` when ticket status changes to `completed` or `closed`
- Wrapped in try/catch so email failure never blocks admin ticket update response

## Decisions Made

1. **Lazy Resend initialization** — `resend` object set to `null` if `RESEND_API_KEY` is absent; `sendEmail` logs a warn and returns immediately. This mirrors the push-service non-throwing pattern.
2. **Email only for completed/closed** — push notifications fire on any status change (plan 02), but emails only trigger for terminal states (completed/closed) per D-07 to avoid notification fatigue.
3. **emailNotifications opt-out respected** — both helpers fetch the user record and check `user.emailNotifications` before sending; if false or user not found, silently returns.
4. **Errors logged, not propagated** — both `sendEmail` and the call-site wrappers use try/catch with pino logger; upstream callers are protected from email provider errors.

## Deviations from Plan

### Plan 02 Pre-empted Task 2

**Found during:** Task 2
**Issue:** Plan 02 (push notifications) ran first and included the sendTicketStatusEmail import and call-site in its admin.ts changes, as the plan was designed to show the combined block.
**Fix:** Task 2 changes were already present in admin.ts after plan 02 committed. No duplicate edits needed.
**Files modified:** None (Task 2 was already in place)
**Commit:** 8fcc8a4 (feat(13-02): wire push triggers into ticket update and invoice routes)

## Known Stubs

None — email-service.ts is fully wired. sendBillOverdueEmail is callable but has no scheduler trigger yet (that is plan 13-04's responsibility).

## Self-Check: PASSED

- artifacts/api-server/src/lib/email-service.ts: FOUND
- resend in package.json: FOUND (line 25)
- sendEmail export: FOUND (line 15)
- sendTicketStatusEmail export: FOUND (line 76)
- sendBillOverdueEmail export: FOUND (line 117)
- sendTicketStatusEmail import in admin.ts: FOUND (line 13)
- sendTicketStatusEmail call in admin.ts: FOUND (line 460)
- Commit 4a269bd: FOUND
