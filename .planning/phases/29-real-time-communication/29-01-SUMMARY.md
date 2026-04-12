---
phase: 29-real-time-communication
plan: 01
subsystem: real-time
tags: [websocket, ws, chat, polling, react-hooks, next-api-routes]

requires:
  - phase: 26-resident-core
    provides: ticket detail pages and ticket queries
  - phase: 28-admin-portal
    provides: admin ticket detail page with status/assignment management
provides:
  - WebSocket server for real-time ticket chat (port 3002)
  - REST API /api/tickets/[id]/messages for message CRUD
  - useTicketChat React hook with WS + polling fallback
  - Interactive chat UI on both resident and admin ticket detail pages
affects: [29-real-time-communication]

tech-stack:
  added: [ws, "@types/ws"]
  patterns: [websocket-room-management, polling-fallback, client-component-chat]

key-files:
  created:
    - artifacts/web/src/lib/ws-server.ts
    - artifacts/web/src/lib/ws-server.start.ts
    - artifacts/web/src/app/api/tickets/[id]/messages/route.ts
    - artifacts/web/src/hooks/use-ticket-chat.ts
    - artifacts/web/src/app/(resident)/star-assist/[id]/ticket-chat.tsx
    - artifacts/web/src/app/(admin)/tickets/[id]/ticket-chat.tsx
  modified:
    - artifacts/web/src/app/(resident)/star-assist/[id]/page.tsx
    - artifacts/web/src/app/(admin)/tickets/[id]/page.tsx
    - artifacts/web/package.json
    - artifacts/web/src/components/push-prompt.tsx

key-decisions:
  - "Standalone WS server on separate port (3002) rather than integrating with Next.js server"
  - "REST API for message persistence, WS only for real-time broadcast"
  - "5-second polling fallback with 5 reconnection attempts before falling back"

patterns-established:
  - "useTicketChat hook: WS-first with automatic polling fallback pattern"
  - "API route auth: createClient() from supabase/server for cookie-based auth in route handlers"
  - "Chat UI: Client Component with server-fetched initialMessages for SSR hydration"

requirements-completed: [COMM-01, COMM-02]

duration: 5min
completed: 2026-04-11
---

# Phase 29 Plan 01: WebSocket Chat Summary

**WebSocket real-time chat on ticket detail pages with ws library, REST API for persistence, and automatic polling fallback**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-11T17:53:11Z
- **Completed:** 2026-04-11T17:58:25Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Standalone WebSocket server with ticket room management for real-time message delivery
- REST GET/POST API with Supabase auth for message persistence and sender type detection
- Interactive chat UI on both resident and admin ticket detail pages with connection status indicator
- Replaced static messages card and "coming soon" placeholder with live chat component

## Task Commits

Each task was committed atomically:

1. **Task 1: WS server, REST API, and useTicketChat hook** - `2c82898` (feat)
2. **Task 2: Chat UI on resident and admin ticket detail pages** - `0be0cd8` (feat)

## Files Created/Modified
- `artifacts/web/src/lib/ws-server.ts` - WebSocket server with room management and broadcastToTicket
- `artifacts/web/src/lib/ws-server.start.ts` - Entry script to start WS server standalone
- `artifacts/web/src/app/api/tickets/[id]/messages/route.ts` - REST GET/POST with auth and validation
- `artifacts/web/src/hooks/use-ticket-chat.ts` - React hook with WS connection, polling fallback, reconnection
- `artifacts/web/src/app/(resident)/star-assist/[id]/ticket-chat.tsx` - Resident chat Client Component
- `artifacts/web/src/app/(admin)/tickets/[id]/ticket-chat.tsx` - Admin chat Client Component
- `artifacts/web/src/app/(resident)/star-assist/[id]/page.tsx` - Replaced static messages with TicketChat
- `artifacts/web/src/app/(admin)/tickets/[id]/page.tsx` - Added TicketChat with server-fetched messages
- `artifacts/web/package.json` - Added ws dependency
- `artifacts/web/src/components/push-prompt.tsx` - Fixed pre-existing type error

## Decisions Made
- Standalone WS server on separate port (3002) rather than integrating with Next.js server - keeps concerns separated and avoids Next.js middleware complexity
- REST API for message persistence; WS only for real-time broadcast - clean separation of write path from notification path
- 5-second polling interval with 5 reconnection attempts before permanent fallback - balances responsiveness with server load

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed pre-existing push-prompt.tsx type error**
- **Found during:** Task 1 (build verification)
- **Issue:** TypeScript "Not all code paths return a value" error in useEffect callback due to mixed return types (undefined vs cleanup function)
- **Fix:** Added explicit return type annotation `(): void | (() => void)` and simplified returns
- **Files modified:** artifacts/web/src/components/push-prompt.tsx
- **Verification:** Build succeeds
- **Committed in:** 2c82898 (Task 1 commit)

**2. [Rule 3 - Blocking] Cleaned stale .next build cache**
- **Found during:** Task 1 (build verification)
- **Issue:** Stale .next/build-manifest.json caused build failure at page data collection stage
- **Fix:** Removed .next directory and rebuilt
- **Verification:** Clean build succeeds
- **Committed in:** N/A (cache cleanup only)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary to unblock build verification. No scope creep.

## Issues Encountered
None beyond the auto-fixed blocking issues.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- WebSocket server and chat UI are ready for integration testing
- WS server needs to be started separately via `npx tsx artifacts/web/src/lib/ws-server.start.ts`
- Phase 29-02 (notifications) and 29-03 (additional real-time features) can proceed

## Self-Check: PASSED

All 6 created files verified. Both task commits (2c82898, 0be0cd8) found in git log.

---
*Phase: 29-real-time-communication*
*Completed: 2026-04-11*
