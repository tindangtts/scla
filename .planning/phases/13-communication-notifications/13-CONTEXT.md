# Phase 13: Communication & Notifications - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Add proactive notifications (push + email) and resident-staff chat within maintenance tickets. Residents get alerted about important events without checking the app, and can communicate directly with maintenance staff from within open tickets.

</domain>

<decisions>
## Implementation Decisions

### Push Notifications (COMM-01)
- **D-01:** Use Web Push API with a service worker for browser push notifications
- **D-02:** Supabase Realtime for event delivery to the frontend (subscribe to notification changes)
- **D-03:** Trigger events: ticket status change (open→in_progress, in_progress→completed), bill due reminder (7 days before due date)
- **D-04:** Store push subscription in a new `push_subscriptions` table linked to userId
- **D-05:** Backend sends push via web-push npm library when events fire

### Email Notifications (COMM-02)
- **D-06:** Use Resend (or Supabase Edge Functions + SMTP) for transactional email delivery
- **D-07:** Trigger events: bill overdue (past due date), ticket status change to completed/closed
- **D-08:** Simple HTML email template with SCLA branding (teal/gold color scheme)
- **D-09:** Email preference opt-out per user (new column or preferences table)

### In-App Chat (COMM-03)
- **D-10:** Chat is embedded directly in the ticket detail page — not a standalone chat feature
- **D-11:** New `ticket_messages` table: id, ticketId, senderId, senderType (resident/staff), content, createdAt
- **D-12:** Real-time message delivery via polling (simple, reliable) — can upgrade to Supabase Realtime later
- **D-13:** Admin portal gets a matching chat panel in the ticket detail view
- **D-14:** Messages are append-only (no edit/delete for audit trail integrity)

### Claude's Discretion
- Service worker registration approach and caching strategy
- Email template HTML/CSS specifics
- Polling interval for chat (suggest 3-5 seconds)
- Whether to use Resend directly or wrap in Supabase Edge Functions

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Notification System
- `artifacts/api-server/src/routes/home.ts` — Home feed with notification count (GET /notifications)
- `lib/db/src/schema/notifications.ts` — Existing notifications table (in-app notifications)

### Ticket System (Chat Integration Point)
- `artifacts/api-server/src/routes/tickets.ts` — Ticket CRUD with existing `updates` JSON array
- `artifacts/scla/src/pages/star-assist-detail.tsx` — Ticket detail page (chat embeds here)
- `artifacts/admin/src/pages/tickets.tsx` — Admin ticket view (chat panel goes here)

### Auth & Middleware
- `artifacts/api-server/src/lib/auth-middleware.ts` — Shared auth middleware (Phase 15: use requireAuth)
- `artifacts/api-server/src/lib/jwt.ts` — JWT handling

### Database
- `lib/db/src/schema/` — All existing Drizzle schemas (new tables go here)
- `lib/db/src/index.ts` — Database connection and exports

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `notifications` table already exists — push/email notifications complement the existing in-app system
- `auth-middleware.ts` with `requireAuth` — use for all new endpoints (Phase 15 pattern)
- Ticket `updates` JSON array — existing staff response thread, chat messages are a separate structured table
- Pino logger — use for notification delivery logging

### Established Patterns
- Express Router per domain
- Drizzle ORM for all DB operations
- `{ error, message }` JSON error format
- `AuthenticatedRequest` type for typed route handlers (Phase 15)

### Integration Points
- `routes/index.ts` — register new notification and chat routes
- `app.ts` — service worker static file serving
- Ticket detail pages (both resident and admin) — embed chat UI
- Home page — push notification permission prompt

</code_context>

<specifics>
## Specific Ideas

- User prefers Supabase ecosystem — align with Supabase patterns where possible
- Push notifications should respect quiet hours (future consideration, not v1)
- Chat messages should NOT replace the existing `updates` JSON array on tickets — they're separate systems

</specifics>

<deferred>
## Deferred Ideas

- Supabase Realtime for chat (start with polling, upgrade later)
- Quiet hours for push notifications
- Rich push notification actions (reply from notification)
- Email digest/summary mode

</deferred>

---

*Phase: 13-communication-notifications*
*Context gathered: 2026-04-10*
