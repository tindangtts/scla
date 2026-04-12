# Phase 29: Real-time & Communication - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous mode)

<domain>
## Phase Boundary

Ticket chat works in real-time via WebSocket (with polling fallback), residents and admins receive push and email notifications, and the in-app notification feed shows unread counts — all operating within the Next.js architecture.

</domain>

<decisions>
## Implementation Decisions

### WebSocket Chat (COMM-01, COMM-02)
- Custom WebSocket server running alongside Next.js (Next.js doesn't natively support WS)
- Option A: Separate WS server process on different port (like v2.1 approach)
- Option B: Next.js custom server with WS upgrade handling
- Use Option A for simplicity — standalone ws server at e.g. port 3002
- Chat UI as Client Component on ticket detail pages (both resident and admin)
- useTicketChat hook with WS connection, message sending, reconnection logic
- Polling fallback: if WS fails, fall back to periodic fetch of messages
- Connection indicator dot (green=live, red=polling) — existing v2.1 pattern

### Push Notifications (COMM-03)
- Service worker for push notifications (sw.js in public/)
- VAPID key-based Web Push subscription
- Subscribe/unsubscribe via Server Action
- push_subscriptions table stores endpoints
- Trigger push from server-side on events (bill overdue, ticket update)

### Email Notifications (COMM-04)
- Resend SDK for transactional email
- Email templates for: bill overdue, ticket status update
- Triggered alongside push notifications

### In-App Notifications (COMM-05)
- Notification bell in header showing unread count
- notifications table already queried in Phase 27
- Mark as read on click/view
- Create notification records on relevant events (Server Actions)

### Claude's Discretion
- WS server implementation details
- Push notification permission UX
- Email template design
- Notification creation triggers (which actions create notifications)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `artifacts/web/src/app/(resident)/star-assist/[id]/page.tsx` — ticket detail (add chat here)
- `artifacts/web/src/app/(admin)/tickets/[id]/page.tsx` — admin ticket detail (add chat here)
- `artifacts/web/src/lib/queries/notifications.ts` — notification queries from Phase 27
- `artifacts/web/src/app/(resident)/notifications/page.tsx` — notification list from Phase 27
- `@workspace/db/schema` — ticket_messages, push_subscriptions, notifications tables

### Integration Points
- Ticket detail pages need chat component
- Header/layout needs notification bell with unread count
- Server Actions for tickets, bookings, bills need notification triggers
- Package.json needs ws dependency and custom server script

</code_context>

<specifics>
## Specific Ideas

- v2.1 had ws library for WebSocket — continue using ws (not Socket.IO)
- v2.1 pattern: WS is receive-only for clients, REST POST is authoritative write path
- Env vars needed: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, RESEND_API_KEY

</specifics>

<deferred>
## Deferred Ideas

- Supabase Realtime for chat — future enhancement (ENH-04)
- Rich push notification content (images, actions)

</deferred>
