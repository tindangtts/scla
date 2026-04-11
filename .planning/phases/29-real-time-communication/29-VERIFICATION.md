---
phase: 29-real-time-communication
verified: 2026-04-11T19:00:00Z
status: passed
score: 5/5 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 3/5
  gaps_closed:
    - "Messages in ticket detail chat appear for both parties without page refresh (WebSocket)"
    - "Resident receives transactional email via Resend for bill overdue events"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Open two browsers (resident + admin) on same ticket, send message from one side"
    expected: "Message appears on the other side within 1 second without page refresh"
    why_human: "Requires running WS server + Next.js server simultaneously and observing real-time behavior"
  - test: "Enable push notifications as resident, have admin change ticket status"
    expected: "Browser push notification appears with ticket update title"
    why_human: "Requires VAPID keys configured, browser permission granted, visual verification"
  - test: "Configure RESEND_API_KEY, trigger bill overdue check via POST /api/cron/bill-overdue-check?force=true"
    expected: "Styled HTML email arrives at resident email address for overdue bill"
    why_human: "Requires external Resend service configuration and email inbox verification"
  - test: "As resident, observe bell badge count, navigate to /notifications, click Mark all as read"
    expected: "Badge count drops to 0 on next poll cycle"
    why_human: "Requires visual verification of badge state and user interaction flow"
---

# Phase 29: Real-Time Communication Verification Report

**Phase Goal:** Ticket chat works in real-time via WebSocket (with polling fallback), residents and admins receive push and email notifications, and the in-app notification feed shows unread counts
**Verified:** 2026-04-11T19:00:00Z
**Status:** passed
**Re-verification:** Yes -- after gap closure (plans 29-04 and 29-05)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Messages in ticket detail chat appear for both parties without page refresh (WebSocket) | VERIFIED | ws-server.ts has HTTP broadcast endpoint (port 3003) calling broadcastToTicket() at line 104; messages/route.ts fires HTTP POST to broadcast at line 144; resident actions.ts fires HTTP POST at line 55; useTicketChat hook receives WS messages and renders them |
| 2 | When WebSocket is unavailable, chat falls back to polling | VERIFIED | useTicketChat.ts: after MAX_RECONNECT_RETRIES (5), calls startPolling() with 5-second interval fetching GET /api/tickets/[id]/messages |
| 3 | Resident receives browser push notification for bill overdue and ticket updates | VERIFIED | push.ts uses web-push; notifyTicketUpdate called from admin actions; notifyNewMessage called from messages route; notifyBillOverdue now called from cron route |
| 4 | Resident receives transactional email via Resend for bill overdue events | VERIFIED | sendBillOverdueEmail in email.ts is complete; notifyBillOverdue() now called from /api/cron/bill-overdue-check/route.ts which queries overdue invoices and iterates per user |
| 5 | In-app notification bell shows unread count badge that clears on viewing | VERIFIED | NotificationBell polls /api/notifications/unread-count every 30s, shows red badge (9+ cap); /notifications page has MarkAsRead and MarkAllAsRead buttons wired to server actions updating isRead in DB |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `artifacts/web/src/lib/ws-server.ts` | WS server with room management + broadcast HTTP endpoint | VERIFIED | 127 lines, broadcastToTicket called from HTTP handler at line 104, HTTP server on port 3003 bound to 127.0.0.1 |
| `artifacts/web/src/hooks/use-ticket-chat.ts` | React hook with WS + polling fallback | VERIFIED | 170 lines, WS connection with reconnect, polling fallback, sendMessage via REST |
| `artifacts/web/src/app/api/tickets/[id]/messages/route.ts` | REST GET/POST for ticket messages | VERIFIED | 179 lines, authenticated, DB query, WS broadcast after insert at line 140-151 |
| `artifacts/web/src/app/(resident)/star-assist/[id]/actions.ts` | Server Action for sending messages | VERIFIED | Includes fire-and-forget WS broadcast after DB insert at lines 53-62 |
| `artifacts/web/src/app/(resident)/star-assist/[id]/ticket-chat.tsx` | Resident chat UI | VERIFIED | Uses useTicketChat hook, message list, input form |
| `artifacts/web/src/app/(admin)/tickets/[id]/ticket-chat.tsx` | Admin chat UI | VERIFIED | Same pattern as resident, flips isOwn to senderType=staff |
| `artifacts/web/public/sw.js` | Service worker for push display | VERIFIED | Handles push and notificationclick events |
| `artifacts/web/src/lib/push.ts` | Server-side push sender | VERIFIED | 65 lines, VAPID setup, sendPushToUser |
| `artifacts/web/src/lib/email.ts` | Resend email helper | VERIFIED | 65 lines, sendBillOverdueEmail and sendTicketUpdateEmail |
| `artifacts/web/src/lib/notifications.ts` | Unified notification triggers | VERIFIED | 137 lines, all 3 functions now have call sites |
| `artifacts/web/src/components/notification-bell.tsx` | Bell with unread badge | VERIFIED | 55 lines, polls unread-count, red badge with 9+ cap |
| `artifacts/web/src/app/api/notifications/unread-count/route.ts` | Unread count API | VERIFIED | Authenticated, queries getUnreadCount from DB |
| `artifacts/web/src/app/(resident)/notifications/page.tsx` | Notifications list page | VERIFIED | Lists notifications, MarkAsRead/MarkAllAsRead buttons |
| `artifacts/web/src/app/api/cron/bill-overdue-check/route.ts` | Cron endpoint for bill overdue notifications | VERIFIED | 60 lines, queries overdue invoices, calls notifyBillOverdue per user, CRON_SECRET auth |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| ticket-chat.tsx (resident) | use-ticket-chat.ts | useTicketChat hook | WIRED | Import and invocation confirmed |
| ticket-chat.tsx (admin) | use-ticket-chat.ts | useTicketChat hook | WIRED | Import and invocation confirmed |
| use-ticket-chat.ts | ws-server.ts | WebSocket connection | WIRED | new WebSocket(wsUrl), joins room on open |
| use-ticket-chat.ts | /api/tickets/[id]/messages | fetch polling + POST | WIRED | pollMessages fetches GET, sendMessage POSTs |
| messages/route.ts POST | ws-server.ts broadcast | HTTP POST to /broadcast | WIRED | fetch to WS_BROADCAST_URL at line 144; received by HTTP handler at line 82 of ws-server.ts calling broadcastToTicket at line 104 |
| resident actions.ts | ws-server.ts broadcast | HTTP POST to /broadcast | WIRED | fetch to WS_BROADCAST_URL at line 55 of actions.ts |
| messages/route.ts | notifications.ts | notifyNewMessage | WIRED | Import at line 11, called at line 168 |
| admin actions.ts | notifications.ts | notifyTicketUpdate | WIRED | Previously verified, unchanged |
| cron/bill-overdue-check | notifications.ts | notifyBillOverdue | WIRED | Import at line 5, called at line 44 |
| resident layout | notification-bell.tsx | import + render | WIRED | Previously verified, unchanged |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| ticket-chat.tsx | messages | useTicketChat -> fetch /api/tickets/[id]/messages + WS push | Yes, DB query via Drizzle + WS broadcast | FLOWING |
| notification-bell.tsx | count | fetch /api/notifications/unread-count -> getUnreadCount | Yes, DB count query | FLOWING |
| notifications/page.tsx | notifications | getUserNotifications(userId) | Yes, DB select with limit 50 | FLOWING |
| bill-overdue-check/route.ts | overdueInvoices | DB query on invoicesTable | Yes, Drizzle select with conditions | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED (requires running WS server + Next.js server for API/WS checks)

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| COMM-01 | 29-01, 29-04 | WebSocket real-time chat on ticket detail page | SATISFIED | WS server + HTTP broadcast endpoint + hook + UI all wired end-to-end |
| COMM-02 | 29-01 | Polling fallback when WebSocket connection fails | SATISFIED | useTicketChat falls back to 5s polling after 5 reconnect attempts |
| COMM-03 | 29-02 | Web Push notifications with service worker | SATISFIED | sw.js, push.ts, push-prompt.tsx, subscribe API all wired |
| COMM-04 | 29-02, 29-05 | Transactional email via Resend (bill overdue, ticket updates) | SATISFIED | sendBillOverdueEmail wired via cron route; sendTicketUpdateEmail wired via notifyTicketUpdate |
| COMM-05 | 29-03 | In-app notification system with unread badges | SATISFIED | NotificationBell in layout, unread-count API, notifications page with mark-as-read |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| ws-server.ts | 119 | HTTP server bound to 127.0.0.1 only | Info | Correct security practice for internal endpoint |
| messages/route.ts | 148 | .catch(() => {}) on broadcast fetch | Info | Intentional fire-and-forget; failure silenced by design |
| bill-overdue-check/route.ts | 10 | CRON_SECRET optional in dev | Info | Expected dev convenience; production should set env var |

No blocker or warning anti-patterns found.

### Human Verification Required

### 1. WebSocket Real-Time Message Delivery

**Test:** Open two browsers -- one as resident, one as admin -- on the same ticket. Send a message from one side.
**Expected:** Message appears on the other side within 1 second without page refresh.
**Why human:** Requires running WS server + Next.js server simultaneously and observing real-time behavior across two browser sessions.

### 2. Push Notification Display

**Test:** Enable push notifications as resident. Have admin change a ticket status.
**Expected:** Browser push notification appears with "Ticket Updated" title.
**Why human:** Requires VAPID keys configured, browser permission granted, and visual verification of notification popup.

### 3. Resend Email Delivery for Bill Overdue

**Test:** Configure RESEND_API_KEY, ensure at least one overdue invoice exists, call POST /api/cron/bill-overdue-check?force=true.
**Expected:** Styled HTML email arrives at resident's email address for overdue bill.
**Why human:** Requires external Resend service and email inbox verification.

### 4. Notification Bell Badge Clear

**Test:** As resident, observe bell badge count. Click bell to navigate to /notifications. Click "Mark all as read".
**Expected:** Badge count drops to 0 on next 30s poll or page refresh.
**Why human:** Requires visual verification of badge state and user interaction flow.

### Gaps Summary

No gaps remaining. Both previous gaps have been closed:

**Gap 1 (WS broadcast) -- CLOSED by plan 29-04:** Added an HTTP broadcast endpoint (port 3003, bound to 127.0.0.1) to the WS server using Node.js built-in http.createServer. The endpoint receives POST /broadcast with {ticketId, message} and calls broadcastToTicket(). Both the messages API route (line 144) and the resident Server Action (line 55) now fire HTTP POST to this endpoint after inserting a message to the database. The cross-process HTTP relay pattern correctly bridges the separate Next.js and WS server processes.

**Gap 2 (bill overdue email) -- CLOSED by plan 29-05:** Created /api/cron/bill-overdue-check/route.ts (60 lines) which queries invoicesTable for unpaid invoices past their due date and calls notifyBillOverdue() for each affected user. The endpoint includes CRON_SECRET header auth (optional in dev) and a force=true parameter for processing all overdue invoices vs. only yesterday's newly overdue ones.

**Regression check:** All 12 previously passing artifacts confirmed present with same or greater line counts. No regressions detected.

---

_Verified: 2026-04-11T19:00:00Z_
_Verifier: Claude (gsd-verifier)_
