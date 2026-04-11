# Phase 21: WebSocket Chat - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Ticket chat messages arrive instantly without polling, with automatic fallback if the connection drops. Replace the 4s polling in ticket detail chat with WebSocket real-time messaging. Both resident and admin apps get upgraded.

</domain>

<decisions>
## Implementation Decisions

### WebSocket Architecture
- Use `ws` library (lightweight, Express-compatible, no framework overhead)
- Attach WebSocketServer to same HTTP server via `new WebSocketServer({ server })` in index.ts
- Client detects WS failure, auto-switches to existing 4s polling — shared message rendering component
- JWT token passed as query param on WS upgrade, verified server-side before accepting connection

### Claude's Discretion
- WS message format (JSON with type/payload structure)
- Room/channel management for per-ticket connections
- Reconnection backoff strategy
- How to scope WS connections to specific ticket IDs

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- artifacts/api-server/src/routes/ticket-messages.ts — Existing REST endpoints for GET/POST messages
- artifacts/scla/src/pages/star-assist-detail.tsx — Resident chat UI with 4s polling
- artifacts/admin/src/pages/ticket-detail.tsx — Admin chat UI with polling
- artifacts/api-server/src/lib/auth-middleware.ts — JWT verification logic to reuse

### Established Patterns
- Polling uses useQuery with refetchInterval: 4000
- Messages rendered in a shared chat-like UI (bubbles, timestamps)
- POST /api/tickets/:id/messages creates messages via REST

### Integration Points
- WebSocket server attaches to existing HTTP server in index.ts
- Frontend chat hooks need dual-mode (WS primary, polling fallback)
- Admin app needs same WS upgrade for staff-side chat

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond the decisions captured above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
