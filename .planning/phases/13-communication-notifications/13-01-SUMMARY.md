---
phase: 13-communication-notifications
plan: "01"
subsystem: db-schema
tags: [drizzle, postgresql, schema, push-notifications, chat, email-notifications]
dependency_graph:
  requires: []
  provides: [push_subscriptions-table, ticket_messages-table, emailNotifications-column]
  affects: [13-02-PLAN, 13-03-PLAN, 13-04-PLAN]
tech_stack:
  added: []
  patterns: [drizzle-pgTable, createInsertSchema, zod-v4-type-inference]
key_files:
  created:
    - lib/db/src/schema/push_subscriptions.ts
    - lib/db/src/schema/ticket_messages.ts
  modified:
    - lib/db/src/schema/users.ts
    - lib/db/src/schema/index.ts
decisions:
  - "No foreign key constraints — matches existing codebase pattern (text IDs without .references())"
  - "senderTypeEnum values resident/staff align with existing authorType pattern in tickets.ts updates JSON"
  - "emailNotifications defaults to true (opt-out model — residents get emails unless they opt out)"
metrics:
  duration_minutes: 5
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_modified: 4
---

# Phase 13 Plan 01: DB Schemas for Push Subscriptions, Ticket Messages, and Email Opt-Out Summary

**One-liner:** Drizzle schemas for push_subscriptions (web push storage), ticket_messages (resident-staff chat), and emailNotifications opt-out column on users table using existing pgTable/createInsertSchema patterns.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create push_subscriptions and ticket_messages schemas | e14c3f3 | lib/db/src/schema/push_subscriptions.ts, lib/db/src/schema/ticket_messages.ts |
| 2 | Add emailNotifications column to users and update barrel exports | c6a08ec | lib/db/src/schema/users.ts, lib/db/src/schema/index.ts |

## What Was Built

### push_subscriptions.ts
- `pushSubscriptionsTable` — stores web push subscriptions per user (endpoint unique constraint, p256dh/auth keys)
- `insertPushSubscriptionSchema` — Zod validation schema via drizzle-zod
- `InsertPushSubscription`, `PushSubscription` types

### ticket_messages.ts
- `senderTypeEnum` — "resident" | "staff" values
- `ticketMessagesTable` — stores chat messages per ticket with senderId, senderType, content
- `insertTicketMessageSchema` — Zod validation schema via drizzle-zod
- `InsertTicketMessage`, `TicketMessage` types

### users.ts update
- Added `emailNotifications: boolean("email_notifications").notNull().default(true)` after upgradeStatus
- Added `boolean` to the drizzle-orm/pg-core import

### schema/index.ts update
- Added `export * from "./push_subscriptions"` and `export * from "./ticket_messages"`
- Both new tables now accessible via `import { pushSubscriptionsTable, ticketMessagesTable } from "@workspace/db"`

## Decisions Made

1. **No foreign key constraints** — matches the existing codebase pattern (e.g., notifications.ts uses plain `text("user_id").notNull()` without `.references()`).
2. **senderTypeEnum resident/staff** — aligns with the `authorType: "resident" | "staff"` pattern already used in tickets.ts updates JSON field.
3. **emailNotifications defaults to true** — opt-out model; residents receive email notifications unless they explicitly disable them.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — these are pure schema definitions with no UI rendering or data flows that could be stubbed.

## Self-Check: PASSED

- lib/db/src/schema/push_subscriptions.ts: FOUND
- lib/db/src/schema/ticket_messages.ts: FOUND
- users.ts emailNotifications column: FOUND (line 20)
- schema/index.ts new exports: FOUND (lines 13-14)
- Commit e14c3f3: FOUND
- Commit c6a08ec: FOUND
