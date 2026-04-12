---
phase: 13-communication-notifications
plan: "04"
subsystem: api-routes
tags: [express, typescript, rest-api, chat, tickets, drizzle]
dependency_graph:
  requires: [13-01-SUMMARY]
  provides: [ticket-messages-router, admin-ticket-messages-endpoints]
  affects: [13-05-PLAN, 13-06-PLAN]
tech_stack:
  added: []
  patterns: [express-router, requireAuth-middleware, requireAdmin-inline, drizzle-select-insert, ownership-check]
key_files:
  created:
    - artifacts/api-server/src/routes/ticket-messages.ts
  modified:
    - artifacts/api-server/src/routes/index.ts
    - artifacts/api-server/src/routes/admin.ts
decisions:
  - "ticketMessagesRouter mounted at /tickets alongside ticketsRouter — Express merges multiple router.use calls at same path without conflict"
  - "Ownership check uses and(eq(ticketId), eq(userId)) in single DB query rather than two-step fetch+compare — single round-trip"
  - "GET /admin/tickets/:id/messages added alongside POST — admin frontend needs read access for chat thread rendering in plans 05/06"
metrics:
  duration_minutes: 2
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_modified: 3
---

# Phase 13 Plan 04: Ticket Chat API Endpoints Summary

**One-liner:** Express router with resident GET/POST chat endpoints on tickets (ownership-enforced) and admin POST/GET staff reply endpoints, both writing to ticketMessagesTable with ascending-order retrieval.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create ticket-messages.ts router for resident chat endpoints | 4b53def | artifacts/api-server/src/routes/ticket-messages.ts, artifacts/api-server/src/routes/index.ts |
| 2 | Add admin staff reply endpoint to admin.ts | a709ac7 | artifacts/api-server/src/routes/admin.ts |

## What Was Built

### ticket-messages.ts (new file)
- `GET /:id/messages` — requireAuth, ownership check via `and(eq(ticketsTable.id, ticketId), eq(ticketsTable.userId, user.id))`, returns messages ordered by `asc(createdAt)`, maps `createdAt` to ISO string
- `POST /:id/messages` — requireAuth, ownership check, validates non-empty content, inserts with `senderType: "resident"`, returns 201 with created message
- Both handlers return 404 if ticket not found or not owned

### index.ts (modified)
- Added `import ticketMessagesRouter from "./ticket-messages"`
- Added `router.use("/tickets", ticketMessagesRouter)` after the existing `router.use("/tickets", ticketsRouter)` — Express merges both routers at `/tickets` path

### admin.ts (modified)
- Added `ticketMessagesTable` to the `@workspace/db` import destructure
- Added `POST /tickets/:id/messages` — requireAdmin, validates content, checks ticket existence, inserts with `senderType: "staff"`, returns 201
- Added `GET /tickets/:id/messages` — requireAdmin, returns all messages for the ticket ordered ascending

## Decisions Made

1. **Dual router.use at /tickets** — Express allows multiple routers mounted at the same path; ticketsRouter handles `/`, `/:id`, `/summary` while ticketMessagesRouter handles `/:id/messages`. No route collision.
2. **Single-query ownership check** — Using `and(eq(...id), eq(...userId))` in one DB call avoids the two-step fetch+check pattern and is more efficient.
3. **GET admin messages endpoint added** — Plan specified only POST, but GET is required for admin frontend to render the thread (plans 05/06 depend on it). Added as Rule 2 auto-add (missing critical functionality for admin chat UI).

## Deviations from Plan

### Auto-added Features

**1. [Rule 2 - Missing Critical] Added GET /admin/tickets/:id/messages**
- **Found during:** Task 2
- **Issue:** Plan specified only POST /admin/tickets/:id/messages, but admin frontend in plans 05/06 needs to read the chat thread. Without GET, admin portal has no way to display messages.
- **Fix:** Added GET handler alongside POST in admin.ts, returning messages in ascending order
- **Files modified:** artifacts/api-server/src/routes/admin.ts
- **Commit:** a709ac7

## Known Stubs

None — all endpoints write/read real data from ticketMessagesTable with no placeholder values.

## Self-Check: PASSED

- artifacts/api-server/src/routes/ticket-messages.ts: FOUND
- artifacts/api-server/src/routes/index.ts ticketMessagesRouter: FOUND
- artifacts/api-server/src/routes/admin.ts ticketMessagesTable import: FOUND
- Commit 4b53def: FOUND
- Commit a709ac7: FOUND
