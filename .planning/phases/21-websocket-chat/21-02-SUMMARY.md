---
phase: 21-websocket-chat
plan: "02"
subsystem: frontend
tags: [websocket, real-time, chat, polling-fallback, react-hook, resident-app, admin-app]
dependency_graph:
  requires: [WS-server, broadcastToTicket, admin-ticket-messages-REST]
  provides: [useTicketChat-hook, resident-WS-chat-UI, admin-WS-chat-UI]
  affects:
    - artifacts/scla/src/hooks/use-ticket-chat.ts
    - artifacts/admin/src/hooks/use-ticket-chat.ts
    - artifacts/scla/src/pages/ticket-detail.tsx
    - artifacts/admin/src/pages/tickets.tsx
tech_stack:
  added: []
  patterns:
    - Dual-mode chat hook (WS primary, setInterval polling fallback at 4s)
    - Exponential backoff reconnect (1s, 2s, 4s, 8s, max 30s)
    - WS receive-only; REST POST is write path
    - Message deduplication by id on WS append
    - isSending local state replaces useMutation.isPending
key_files:
  created:
    - artifacts/scla/src/hooks/use-ticket-chat.ts
    - artifacts/admin/src/hooks/use-ticket-chat.ts
  modified:
    - artifacts/scla/src/pages/ticket-detail.tsx
    - artifacts/admin/src/pages/tickets.tsx
decisions:
  - Hook duplicated across apps (not shared via workspace package) — pragmatic for ~160 lines total; avoids workspace config overhead
  - sendMessage remains REST POST — WS broadcast delivers echo to all clients including sender, no optimistic UI needed
  - Connection indicator dot (green/red) added near Chat heading in both UIs for user visibility of WS state
metrics:
  duration_minutes: 8
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_modified: 4
---

# Phase 21 Plan 02: WebSocket Frontend Chat Hook and UI Integration Summary

**One-liner:** Dual-mode useTicketChat React hook (WebSocket primary, 4s polling fallback with exponential backoff reconnect) integrated into both resident ticket-detail and admin tickets pages, replacing the previous polling-only approach.

## What Was Built

1. **`artifacts/scla/src/hooks/use-ticket-chat.ts`** — New resident-side React hook:
   - `useTicketChat(ticketId, token, role, apiBase)` — returns `{ messages, isConnected, sendMessage }`
   - On mount: fetches initial message history via REST GET, then opens WebSocket
   - WS URL derived from apiBase (handles both absolute and relative bases)
   - `new_message` events appended to state with deduplication by `id`
   - On WS close/error: enables 4s `setInterval` polling fallback
   - Reconnect with exponential backoff: 1s → 2s → 4s → 8s → max 30s; resets on successful open
   - On unmount: nullifies `ws.onclose` before close (prevents reconnect loop), clears all timers

2. **`artifacts/admin/src/hooks/use-ticket-chat.ts`** — Identical hook for admin app (same logic, different `role` param drives endpoint selection)

3. **`artifacts/scla/src/pages/ticket-detail.tsx`** — Resident ticket detail updated:
   - Removed local `TicketMessage` interface (now in hook)
   - Removed `useQuery` polling block and `useMutation` send block
   - Added `useTicketChat(id, token, "resident", API_BASE)` call
   - Added `handleSend` async wrapper with `isSending` state
   - Added WS connection indicator dot next to "Chat with Support" heading
   - Auto-scroll `useEffect` dependency unchanged (`messages.length`)
   - All `data-testid` attributes preserved

4. **`artifacts/admin/src/pages/tickets.tsx`** — Admin tickets page updated:
   - Removed local `ChatMessage` interface
   - Removed `useQuery` polling and `useMutation` send blocks
   - Added `useTicketChat(selected?.id, adminToken, "staff", API_BASE)` call
   - Added `handleSendChat` async wrapper with `isSending` state
   - Added WS connection indicator dot next to Chat heading
   - All `data-testid` attributes preserved

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 82d21ad | feat(21-02): create useTicketChat hook with WS + polling fallback for both apps |
| 2 | 7e41204 | feat(21-02): wire useTicketChat into resident and admin chat UIs |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None — hook is fully wired to live WS and REST endpoints. Message history loads from real API on mount.

## Self-Check: PASSED

- `artifacts/scla/src/hooks/use-ticket-chat.ts` exists: FOUND
- `artifacts/admin/src/hooks/use-ticket-chat.ts` exists: FOUND
- `useTicketChat` in `artifacts/scla/src/pages/ticket-detail.tsx`: FOUND
- `useTicketChat` in `artifacts/admin/src/pages/tickets.tsx`: FOUND
- `new WebSocket` in scla hook: FOUND
- No `refetchInterval: 4000` in ticket-detail.tsx: CONFIRMED
- No `refetchInterval: 4000` in tickets.tsx: CONFIRMED
- Commits 82d21ad and 7e41204: FOUND
