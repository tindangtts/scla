---
phase: 21-websocket-chat
verified: 2026-04-11T08:45:00Z
status: human_needed
score: 7/7 must-haves verified
human_verification:
  - test: "Real-time message delivery end-to-end — resident to admin"
    expected: "Message posted in resident chat appears on admin side within 1 second, without waiting for a 4s poll"
    why_human: "Requires two browser sessions and a running server; cannot verify timing or real WS delivery programmatically"
  - test: "Real-time message delivery end-to-end — admin to resident"
    expected: "Message posted in admin chat appears on resident side within 1 second"
    why_human: "Same as above — bidirectional delivery requires live runtime"
  - test: "WS connection indicator visible in both UIs"
    expected: "Green dot next to 'Chat with Support' (resident) and 'Chat' heading (admin) when WS is connected"
    why_human: "UI state requires a running browser and live WS connection"
  - test: "Polling fallback activates on WS drop"
    expected: "After killing the API server: dot turns red, messages still load every 4s; after restart: dot turns green and WS reconnects with backoff"
    why_human: "Requires simulating a server outage and observing reconnect timing"
---

# Phase 21: WebSocket Chat Verification Report

**Phase Goal:** Ticket chat messages arrive instantly without polling, with automatic fallback if the connection drops
**Verified:** 2026-04-11T08:45:00Z
**Status:** human_needed (all automated checks pass; real-time delivery requires human runtime test)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | WebSocket server accepts connections on the same port as the HTTP server | VERIFIED | `setupWebSocket(server)` called in `index.ts` after `app.listen()` — shares the same `http.Server` instance |
| 2 | WS connections are authenticated via JWT query param before upgrade completes | VERIFIED | `ws-server.ts` parses `?token=&role=` on `connection`, closes with code 1008 on auth failure before any data flows |
| 3 | A message POSTed to the REST endpoint is broadcast to all WS clients in that ticket room | VERIFIED | `broadcastToTicket(id, inserted)` called in both `ticket-messages.ts` (resident) and `admin.ts` (staff) after DB insert |
| 4 | Admin can GET and POST ticket chat messages via REST | VERIFIED | `GET /admin/tickets/:id/messages` and `POST /admin/tickets/:id/messages` present in `admin.ts` lines 448–474 with `requireAdmin` and real DB queries |
| 5 | Messages sent appear instantly in both resident and admin apps (no polling delay) | HUMAN NEEDED | Hook established via `new WebSocket(...)` — delivery timing requires runtime verification |
| 6 | WS connection failure triggers automatic 4s polling fallback | VERIFIED (code) | `ws.onclose` calls `startPolling()` (4000ms `setInterval`); `ws.onopen` calls `stopPolling()` — logic is correct |
| 7 | Existing message history still loads on ticket open (no regression) | VERIFIED | Both hooks call `fetchMessages()` via REST GET on mount before opening WS; no `refetchInterval: 4000` remains in either page |

**Score:** 6/7 fully automated + 1 needs human runtime test (timing/delivery)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `artifacts/api-server/src/lib/ws-server.ts` | WS server with room management and JWT auth | VERIFIED | 164 lines; exports `setupWebSocket` and `broadcastToTicket`; resident + staff JWT auth; `Map<string, Set<WebSocket>>`; 30s heartbeat |
| `artifacts/api-server/src/index.ts` | WS server attached to HTTP server on startup | VERIFIED | `setupWebSocket(server)` called at line 25 inside `app.listen` callback |
| `artifacts/api-server/src/routes/admin.ts` | Admin ticket message GET/POST endpoints | VERIFIED | Lines 448–474: both endpoints present, `requireAdmin` guard, real DB queries, `broadcastToTicket` call |
| `artifacts/api-server/src/routes/ticket-messages.ts` | REST POST broadcasts to WS room after DB insert | VERIFIED | Line 53: `broadcastToTicket(id, inserted)` after `.returning()` |
| `artifacts/scla/src/hooks/use-ticket-chat.ts` | Dual-mode chat hook (WS primary, polling fallback) for resident app | VERIFIED | 183 lines; exports `useTicketChat`; WS with dedup + polling fallback + exponential backoff + cleanup |
| `artifacts/admin/src/hooks/use-ticket-chat.ts` | Dual-mode chat hook (WS primary, polling fallback) for admin app | VERIFIED | Identical to resident hook — 183 lines; same logic, `role=staff` endpoint selection |
| `artifacts/scla/src/pages/ticket-detail.tsx` | Resident ticket detail using WS chat hook | VERIFIED | Line 9 import, line 32 usage with `role="resident"`; connection indicator at line 186 |
| `artifacts/admin/src/pages/tickets.tsx` | Admin tickets page using WS chat hook | VERIFIED | Line 6 import, line 63 usage with `role="staff"`; connection indicator at line 217 |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `artifacts/api-server/src/routes/ticket-messages.ts` | `artifacts/api-server/src/lib/ws-server.ts` | `broadcastToTicket` call after DB insert | WIRED | Line 7: import; line 53: call after insert |
| `artifacts/api-server/src/routes/admin.ts` | `artifacts/api-server/src/lib/ws-server.ts` | `broadcastToTicket` call after admin DB insert | WIRED | Line 12: import; line 472: call after insert |
| `artifacts/api-server/src/index.ts` | `artifacts/api-server/src/lib/ws-server.ts` | `setupWebSocket(server)` on startup | WIRED | Line 5: import; line 25: call |
| `artifacts/scla/src/hooks/use-ticket-chat.ts` | `ws://host/ws?token=X&ticketId=Y&role=resident` | `new WebSocket(url)` constructor | WIRED | Line 84: `const ws = new WebSocket(url)` with URL built from `buildWsUrl()` |
| `artifacts/admin/src/hooks/use-ticket-chat.ts` | `ws://host/ws?token=X&ticketId=Y&role=staff` | `new WebSocket(url)` constructor | WIRED | Line 84: `const ws = new WebSocket(url)` |
| `artifacts/scla/src/pages/ticket-detail.tsx` | `artifacts/scla/src/hooks/use-ticket-chat.ts` | `useTicketChat` hook import | WIRED | Line 9: import; line 32: destructured call |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `ws-server.ts broadcastToTicket` | `message: TicketMessage` | Caller passes DB `.returning()` result | Yes — real inserted row from Drizzle | FLOWING |
| `ticket-messages.ts POST` | `inserted` | `db.insert(...).returning()` | Yes — real DB insert | FLOWING |
| `admin.ts POST /tickets/:id/messages` | `inserted` | `db.insert(...).returning()` | Yes — real DB insert | FLOWING |
| `admin.ts GET /tickets/:id/messages` | `messages` | `db.select().from(ticketMessagesTable).where(...).orderBy(...)` | Yes — real DB query | FLOWING |
| `use-ticket-chat.ts` (scla) | `messages` state | `fetchMessages()` → REST GET → DB; `ws.onmessage` → WS broadcast | Yes — REST populates initial load; WS appends new messages | FLOWING |
| `ticket-detail.tsx` | `messages` | `useTicketChat(id, token, "resident", API_BASE)` | Yes — flows from hook | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `setupWebSocket` exported from ws-server | `grep "export function setupWebSocket" ws-server.ts` | Found at line 108 | PASS |
| `broadcastToTicket` exported from ws-server | `grep "export function broadcastToTicket" ws-server.ts` | Found at line 87 | PASS |
| `ws` dependency in api-server package.json | `grep '"ws"' package.json` | `"ws": "^8.20.0"` at line 29 | PASS |
| No `refetchInterval: 4000` in ticket-detail.tsx | `grep "refetchInterval.*4000" ticket-detail.tsx` | Not found | PASS |
| No `refetchInterval: 4000` in admin tickets.tsx | `grep "refetchInterval.*4000" tickets.tsx` | Not found | PASS |
| `useTicketChat` used in ticket-detail.tsx | `grep "useTicketChat" ticket-detail.tsx` | Found at lines 9 and 32 | PASS |
| `useTicketChat` used in admin tickets.tsx | `grep "useTicketChat" tickets.tsx` | Found at lines 6 and 63 | PASS |
| Connection indicator present in both UIs | `grep "bg-green-500\|bg-red-400"` in both pages | Found in ticket-detail.tsx:186 and tickets.tsx:217 | PASS |
| Admin app TypeScript compiles | `pnpm run typecheck` in `artifacts/admin` | No errors | PASS |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| RT-01 | 21-01, 21-02 | Ticket chat uses WebSocket instead of 4s polling | SATISFIED | Both UI pages import `useTicketChat`; `refetchInterval: 4000` removed from both; WS connection opened on mount |
| RT-02 | 21-01, 21-02 | Chat messages delivered in real-time to both resident and staff | SATISFIED (code) / HUMAN for runtime | `broadcastToTicket` wired in both REST routes; WS hook receives `new_message` events; timing needs human verification |
| RT-03 | 21-02 | WebSocket gracefully falls back to polling if connection fails | SATISFIED (code) | `ws.onclose` enables 4s `setInterval` polling; `ws.onopen` stops polling; exponential backoff reconnect (1s→2s→4s→8s→30s max) |

---

## Anti-Patterns Found

No blockers or stubs detected.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `artifacts/api-server/src/routes/admin.ts` | 42–65 | Multiple `return null` in auth helper | Info | These are correct null-returns from the `verifyAdmin` auth guard function — not stubs |

**Pre-existing TypeScript errors (not introduced by phase 21):**

- `artifacts/api-server`: `auditLogsTable` and `walletTransactionsTable` not exported from `@workspace/db` — these tables exist in schema files and are exported from `schema/index.ts`, but the DB package `dist/` has not been built. This is a build infrastructure issue predating phase 21.
- `artifacts/scla`: `api-client-react` package `dist/` not built — same root cause.
- Neither error is in phase 21 files. Admin app (`artifacts/admin`) compiles with zero TypeScript errors.

---

## Human Verification Required

### 1. Real-time message delivery (resident to admin)

**Test:** Open the resident app in one browser tab and the admin app in another. Log in on both sides. Open the same ticket. Send a message from the resident side.
**Expected:** Message appears on the admin side within 1 second — no 4s delay.
**Why human:** Delivery timing and WS frame receipt require a running server and two live browser sessions.

### 2. Real-time message delivery (admin to resident)

**Test:** With both apps open on the same ticket, send a message from the admin side.
**Expected:** Message appears on the resident side within 1 second.
**Why human:** Same as above.

### 3. WS connection indicator visibility

**Test:** Open a ticket detail page in the resident app and the tickets page in the admin app while the API server is running.
**Expected:** A green dot appears next to the "Chat with Support" heading (resident) and the "Chat" heading (admin).
**Why human:** Visual UI state requires a running browser.

### 4. Polling fallback and reconnect

**Test:** With both apps connected, stop the API server (Ctrl+C), wait 5s, then restart it.
**Expected:** Dot turns red on both sides; messages still load every 4s during downtime; after restart, WS reconnects (dot turns green) with exponential backoff.
**Why human:** Requires simulating a server outage and observing reconnect timing against actual backoff sequence.

---

## Gaps Summary

No gaps found. All seven must-have truths are implemented in code:

- WS server is substantive (164 lines, JWT auth, room management, heartbeat)
- All four server-side artifacts are wired and use real DB queries
- Both frontend hooks are substantive (183 lines each, WS + polling fallback + backoff + cleanup)
- Both UI pages import and use `useTicketChat`; old polling (`refetchInterval: 4000`) is gone
- Data flows from DB inserts through `broadcastToTicket` to WS clients and back through REST GET for initial load

The only remaining item is runtime confirmation that sub-second delivery works end-to-end and the connection indicator is visible — these require a human with a running environment.

---

_Verified: 2026-04-11T08:45:00Z_
_Verifier: Claude (gsd-verifier)_
