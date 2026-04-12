---
phase: 13-communication-notifications
plan: "07"
subsystem: api-server/routes
tags: [gap-closure, ticket-messages, express, routing]
dependency_graph:
  requires:
    - lib/db/src/schema/ticket_messages.ts
    - artifacts/api-server/src/lib/auth-middleware.ts
    - artifacts/api-server/src/routes/tickets.ts
  provides:
    - "GET /api/tickets/:id/messages (resident)"
    - "POST /api/tickets/:id/messages (resident)"
    - "GET /api/admin/tickets/:id/messages (admin)"
    - "POST /api/admin/tickets/:id/messages (admin)"
  affects:
    - artifacts/api-server/src/routes/index.ts
    - artifacts/api-server/src/routes/admin.ts
tech_stack:
  added: []
  patterns:
    - Express Router with requireAuth middleware on resident routes
    - requireAdmin guard on admin routes
    - req.params.id as string cast pattern for TypeScript strict mode
key_files:
  created:
    - artifacts/api-server/src/routes/ticket-messages.ts
  modified:
    - artifacts/api-server/src/routes/index.ts
    - artifacts/api-server/src/routes/admin.ts
decisions:
  - "req.params.id cast as string (not req.params.id directly) to satisfy drizzle-orm eq() TypeScript overloads — matches existing pattern in tickets.ts"
  - "lib/db dist rebuilt locally to generate missing ticket_messages.d.ts type declarations; dist is gitignored so not committed"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_modified: 3
requirements:
  - COMM-03
---

# Phase 13 Plan 07: Ticket Messages Route Restoration Summary

**One-liner:** Restored resident and admin Express route handlers for in-app ticket chat (ticket_messages table) clobbered during parallel plan execution.

## What Was Done

This was a gap-closure plan. Plans 02 and 04 had parallel execution conflicts that left two sets of route handlers absent from the working tree despite being in git history.

**Task 1 — Create ticket-messages.ts resident router**

Created `artifacts/api-server/src/routes/ticket-messages.ts` with:
- `GET /:id/messages` — requireAuth + ownership check (403 if not owner) + returns messages ordered by createdAt asc
- `POST /:id/messages` — requireAuth + ownership check + validates content + inserts with senderType="resident" + returns 201
- Default export as `ticketMessagesRouter`

**Task 2 — Re-wire index.ts and restore admin.ts endpoints**

- `index.ts`: Added import and `router.use("/tickets", ticketMessagesRouter)` alongside existing ticketsRouter
- `admin.ts`: Added `ticketMessagesTable` to the `@workspace/db` destructure import
- `admin.ts`: Appended `POST /tickets/:id/messages` (requireAdmin, senderType="staff", 201) and `GET /tickets/:id/messages` (requireAdmin, asc order) before `export default router`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed req.params.id TypeScript type error in ticket-messages.ts**
- **Found during:** Task 2 (TypeScript compile check)
- **Issue:** `req.params.id` has type `string | string[]` in Express typed handlers; drizzle-orm `eq()` rejects `string[]` — causes TS2769 errors
- **Fix:** Added `const id = req.params.id as string;` cast per existing pattern in tickets.ts (line 90)
- **Files modified:** `artifacts/api-server/src/routes/ticket-messages.ts`
- **Commit:** e5a5368

**2. [Rule 3 - Blocking] Rebuilt lib/db dist type declarations**
- **Found during:** Task 2 (TypeScript compile check)
- **Issue:** `lib/db/dist/schema/` was missing `ticket_messages.d.ts` and `push_subscriptions.d.ts` — TypeScript project references resolve `@workspace/db` through dist, causing "no exported member" errors for both tables
- **Fix:** Ran `npx tsc` in `lib/db/` to regenerate declarations; dist is gitignored so not committed
- **Note:** Pre-existing errors for `resend`, `web-push` modules and `api-zod` dist in other files are unrelated and untouched

## Pre-existing Errors (Out of Scope)

The following errors existed before this plan and were not introduced by our changes:
- `email-service.ts`: Cannot find module 'resend'
- `push-service.ts`: Cannot find module 'web-push'
- `health.ts`: api-zod dist not built

## Known Stubs

None — all endpoints fully wired to database queries.

## Self-Check

Files created/modified:
- [x] `artifacts/api-server/src/routes/ticket-messages.ts` — exists
- [x] `artifacts/api-server/src/routes/index.ts` — ticketMessagesRouter import + registration present
- [x] `artifacts/api-server/src/routes/admin.ts` — ticketMessagesTable import + POST + GET handlers present

Commits:
- 74dc312: feat(13-07): create ticket-messages.ts resident router
- e5a5368: feat(13-07): re-wire index.ts and restore admin.ts ticket message endpoints

## Self-Check: PASSED
