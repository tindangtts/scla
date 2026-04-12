---
phase: 21-websocket-chat
plan: "01"
subsystem: api-server
tags: [websocket, real-time, chat, jwt-auth, room-management]
dependency_graph:
  requires: []
  provides: [WS-server, broadcastToTicket, admin-ticket-messages-REST]
  affects: [artifacts/api-server/src/lib/ws-server.ts, artifacts/api-server/src/routes/admin.ts, artifacts/api-server/src/routes/ticket-messages.ts]
tech_stack:
  added: [ws@^8.20.0, "@types/ws@^8.18.1"]
  patterns: [WebSocket room management with Map<ticketId, Set<WebSocket>>, JWT auth on WS upgrade, 30s heartbeat ping/pong]
key_files:
  created:
    - artifacts/api-server/src/lib/ws-server.ts
  modified:
    - artifacts/api-server/src/index.ts
    - artifacts/api-server/src/routes/admin.ts
    - artifacts/api-server/src/routes/ticket-messages.ts
    - artifacts/api-server/package.json
    - pnpm-lock.yaml
decisions:
  - WS is receive-only for clients — REST POST is the authoritative write path; this simplifies auth and avoids dual message paths
  - verifyAdminToken duplicated in ws-server.ts (not shared from auth-middleware.ts) — verifyAdmin is not exported from auth-middleware and plan notes this duplication is acceptable
  - WS upgrade closes with code 1008 on auth failure — Policy Violation code is the correct HTTP upgrade rejection
metrics:
  duration_minutes: 12
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_modified: 6
---

# Phase 21 Plan 01: WebSocket Server and Admin Ticket Chat REST Endpoints Summary

**One-liner:** WebSocket server with per-ticket room management and JWT auth (resident + staff) attached to HTTP server, with REST broadcast integration and admin GET/POST ticket message endpoints.

## What Was Built

1. **`artifacts/api-server/src/lib/ws-server.ts`** — New WebSocket server module:
   - `setupWebSocket(server: http.Server)` — attaches `WebSocketServer` to the existing HTTP server
   - `broadcastToTicket(ticketId, message)` — sends `{ type: "new_message", payload }` to all open sockets in a ticket room
   - JWT auth on upgrade: resident tokens verified via `jwt.verify()`, staff tokens via inline HMAC-SHA256 check (ctx: "admin")
   - Room management: `Map<string, Set<WebSocket>>` keyed by ticketId, cleaned up on `close`/`error`
   - 30-second heartbeat: ping all clients, terminate those that don't pong back

2. **`artifacts/api-server/src/index.ts`** — `setupWebSocket(server)` called after `app.listen()` returns the `http.Server`

3. **`artifacts/api-server/src/routes/admin.ts`** — Two new endpoints:
   - `GET /admin/tickets/:id/messages` — returns all messages ordered by `createdAt`, requires admin token
   - `POST /admin/tickets/:id/messages` — inserts message with `senderType: "staff"`, broadcasts to WS room

4. **`artifacts/api-server/src/routes/ticket-messages.ts`** — `broadcastToTicket(id, inserted)` called after resident message insert

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 9936be9 | feat(21-01): install ws and create WebSocket server with JWT auth and room management |
| 2 | ebfd3b6 | feat(21-01): add admin ticket message REST endpoints and wire broadcast into both REST routes |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None — all endpoints are fully wired to the database and WebSocket room.

## Self-Check: PASSED

- `artifacts/api-server/src/lib/ws-server.ts` exists: FOUND
- `setupWebSocket` in `artifacts/api-server/src/index.ts`: FOUND
- `broadcastToTicket` in `artifacts/api-server/src/routes/admin.ts`: FOUND
- `broadcastToTicket` in `artifacts/api-server/src/routes/ticket-messages.ts`: FOUND
- `"ws"` in `artifacts/api-server/package.json`: FOUND
- Commits 9936be9 and ebfd3b6: FOUND
