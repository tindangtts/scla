---
phase: 13-communication-notifications
plan: "02"
subsystem: push-notifications
tags: [web-push, vapid, push-service, notifications, backend]
dependency_graph:
  requires: [13-01]
  provides: [push-service, push-routes, ticket-push-trigger]
  affects: [artifacts/api-server]
tech_stack:
  added: [web-push@3.6.7, "@types/web-push@3.6.4"]
  patterns: [VAPID key management, push subscription upsert, non-throwing push delivery, expired subscription cleanup]
key_files:
  created:
    - artifacts/api-server/src/lib/push-service.ts
    - artifacts/api-server/src/routes/push.ts
  modified:
    - artifacts/api-server/package.json
    - artifacts/api-server/src/routes/index.ts
    - artifacts/api-server/src/routes/admin.ts
    - artifacts/api-server/src/routes/invoices.ts
decisions:
  - "Push delivery is non-throwing: sendPushToUser catches all errors internally and logs them, preventing push failures from breaking ticket/invoice updates"
  - "Expired subscriptions (HTTP 410) are auto-removed from DB inside sendPushToUser"
  - "Bill-due push deferred: invoices.ts has no due-date trigger endpoint; requires a scheduled job in a future plan"
  - "VAPID config guard: if VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY are missing, push is silently skipped with a warn log"
metrics:
  duration_minutes: 1
  completed_date: "2026-04-10"
  tasks_completed: 3
  files_changed: 6
---

# Phase 13 Plan 02: Web Push Backend Summary

**One-liner:** VAPID-based Web Push backend with subscription API, push-service.ts delivery library, and ticket status change trigger wired into admin ticket update handler.

## What Was Built

### push-service.ts

Core push delivery library (`artifacts/api-server/src/lib/push-service.ts`):

- `sendPushToUser(userId, { title, body, url? })`: fetches all subscriptions for the user, sends push to each via web-push, auto-removes 410 expired subscriptions from DB, logs failures but never throws — callers are unaffected by push delivery failures
- `generateVapidKeys()`: utility to generate a VAPID key pair for first-time setup
- VAPID configured from `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and optional `VAPID_SUBJECT` env vars at module load time

### push.ts router

Three endpoints registered at `/api/push`:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /vapid-public-key | none | Returns VAPID public key for client-side subscription |
| POST | /subscribe | requireAuth | Idempotent upsert of PushSubscription for authenticated user |
| POST | /unsubscribe | requireAuth | Removes push subscription by endpoint for authenticated user |

### Ticket status push trigger

In `PATCH /admin/tickets/:id` (admin.ts):
- After db.update, if `status` field changed, fires `sendPushToUser(existing.userId, ...)`
- Wrapped in try/catch so push failure never breaks the admin API response
- Notification: title "Ticket Update", body "Your ticket '{title}' is now {status label}.", url `/star-assist/{id}`

## Deviations from Plan

None — plan executed exactly as written. The parallel agent's addition of `sendTicketStatusEmail` import in admin.ts (from plan 13-03) was already present and did not conflict.

## Known Stubs

- **Bill-due push notifications**: `invoices.ts` has no due-date event endpoint — push trigger deferred to a future plan requiring a scheduled job (cron/queue). A TODO comment marks the location.

## Self-Check: PASSED

- artifacts/api-server/src/lib/push-service.ts: EXISTS
- artifacts/api-server/src/routes/push.ts: EXISTS
- Commits 4245b2d, 9e72b6b, 8fcc8a4: all present in git log
