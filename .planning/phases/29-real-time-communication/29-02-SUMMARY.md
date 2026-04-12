---
phase: 29-real-time-communication
plan: 02
subsystem: notifications
tags: [web-push, resend, service-worker, vapid, email, push-notifications]

requires:
  - phase: 29-real-time-communication-01
    provides: WebSocket infrastructure and chat system
  - phase: 24-foundation
    provides: Next.js App Router, Drizzle ORM, Supabase Auth

provides:
  - Service worker for browser push notification display
  - Push subscription API (POST/DELETE) with auth
  - Server-side push sender (sendPushToUser)
  - Resend email helper (sendBillOverdueEmail, sendTicketUpdateEmail)
  - Unified notification triggers (notifyBillOverdue, notifyTicketUpdate, notifyNewMessage)
  - PushPrompt client component for resident push opt-in

affects: [billing, tickets, admin-portal]

tech-stack:
  added: [web-push, resend, "@types/web-push"]
  patterns: [fire-and-forget notifications, graceful degradation on missing API keys, unified notification trigger pattern]

key-files:
  created:
    - artifacts/web/public/sw.js
    - artifacts/web/src/lib/push.ts
    - artifacts/web/src/lib/email.ts
    - artifacts/web/src/lib/notifications.ts
    - artifacts/web/src/app/api/push/subscribe/route.ts
    - artifacts/web/src/components/push-prompt.tsx
  modified:
    - artifacts/web/src/app/(resident)/layout.tsx
    - artifacts/web/package.json

key-decisions:
  - "Graceful degradation: push and email silently skip when VAPID/RESEND keys not configured"
  - "Fire-and-forget pattern: each notification channel (in-app, push, email) has independent try/catch"
  - "No email for chat messages (notifyNewMessage) to avoid noise"

patterns-established:
  - "Unified notification trigger: single function creates in-app record + push + email"
  - "Graceful API key degradation: check env var, log warning, return silently if missing"

requirements-completed: [COMM-03, COMM-04]

duration: 5min
completed: 2026-04-11
---

# Phase 29 Plan 02: Push Notifications and Email Summary

**Web Push notifications via VAPID service worker and transactional email via Resend with unified notification triggers**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-11T17:53:11Z
- **Completed:** 2026-04-11T17:58:21Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Service worker handles push display and notification click-to-open
- Push subscription API stores/deletes subscriptions with Supabase Auth
- PushPrompt component shows opt-in banner with 3s delay, respects localStorage dismiss
- Resend email sends styled bill overdue and ticket update emails with graceful fallback
- Unified triggers (notifyBillOverdue, notifyTicketUpdate, notifyNewMessage) fire in-app + push + email

## Task Commits

Each task was committed atomically:

1. **Task 1: Push notification infrastructure** - `40b7461` (feat)
2. **Task 2: Resend email helper and notification triggers** - `9a8a421` (feat)

## Files Created/Modified
- `artifacts/web/public/sw.js` - Service worker for push notification display and click handling
- `artifacts/web/src/lib/push.ts` - Server-side push sender with expired subscription cleanup
- `artifacts/web/src/lib/email.ts` - Resend email helper with graceful fallback
- `artifacts/web/src/lib/notifications.ts` - Unified notification triggers (bill overdue, ticket update, new message)
- `artifacts/web/src/app/api/push/subscribe/route.ts` - Push subscription POST/DELETE API with auth
- `artifacts/web/src/components/push-prompt.tsx` - Client component for push permission opt-in
- `artifacts/web/src/app/(resident)/layout.tsx` - Added PushPrompt to resident layout
- `artifacts/web/package.json` - Added web-push and resend dependencies

## Decisions Made
- Graceful degradation when VAPID or RESEND keys not configured (log warning, skip silently)
- Fire-and-forget pattern for all notification channels with individual try/catch
- No email notifications for chat messages (notifyNewMessage) to reduce noise
- urlBase64ToUint8Array helper inlined in push-prompt component (no external dependency)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed ws-server.ts operator precedence**
- **Found during:** Task 1 (build verification)
- **Issue:** Pre-existing `?? and || cannot be mixed without parentheses` error in ws-server.ts blocking build
- **Fix:** Added parentheses: `port ?? (Number(process.env.WS_PORT) || 3002)`
- **Files modified:** artifacts/web/src/lib/ws-server.ts
- **Verification:** Typecheck passes
- **Committed in:** 40b7461 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed Uint8Array type incompatibility**
- **Found during:** Task 1 (build verification)
- **Issue:** TypeScript 5.9 stricter ArrayBuffer typing caused Uint8Array to be incompatible with BufferSource
- **Fix:** Used `.buffer as ArrayBuffer` cast on applicationServerKey
- **Files modified:** artifacts/web/src/components/push-prompt.tsx
- **Verification:** Typecheck passes
- **Committed in:** 40b7461 (Task 1 commit)

**3. [Rule 1 - Bug] Fixed useEffect inconsistent return types**
- **Found during:** Task 1 (build verification)
- **Issue:** useEffect callback had some paths returning undefined and one returning cleanup function
- **Fix:** Used explicit `(): void | (() => void) =>` return type annotation (applied by linter)
- **Files modified:** artifacts/web/src/components/push-prompt.tsx
- **Verification:** Typecheck passes
- **Committed in:** 40b7461 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (2 bug fixes, 1 blocking)
**Impact on plan:** All auto-fixes necessary for build correctness. No scope creep.

## Issues Encountered
- Pre-existing Next.js build static generation error on /login page (TypeError: a[d] is not a function) -- not caused by this plan's changes; typecheck passes cleanly

## User Setup Required

External services require manual configuration:
- **NEXT_PUBLIC_VAPID_PUBLIC_KEY** and **VAPID_PRIVATE_KEY**: Generate with `npx web-push generate-vapid-keys`
- **RESEND_API_KEY**: Create at Resend Dashboard -> API Keys

## Next Phase Readiness
- Notification triggers ready to be called from billing and ticket server actions
- Push infrastructure complete for resident notification delivery
- Email templates ready for bill overdue and ticket update scenarios

---
*Phase: 29-real-time-communication*
*Completed: 2026-04-11*
