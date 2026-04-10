---
phase: 13-communication-notifications
plan: "06"
subsystem: chat-ui
tags: [chat, polling, real-time, resident, admin, ticket]
dependency_graph:
  requires: [13-04]
  provides: [chat-ui-resident, chat-ui-admin]
  affects: [ticket-detail, admin-tickets]
tech_stack:
  added: []
  patterns: [polling-with-refetchInterval, useMutation-chat, auto-scroll-ref]
key_files:
  created: []
  modified:
    - artifacts/scla/src/pages/ticket-detail.tsx
    - artifacts/admin/src/pages/tickets.tsx
decisions:
  - "Kept existing Updates section (ticket.updates JSON array) and added separate Chat with Support section below it for structured chat messages from ticket_messages table"
  - "Admin panel replaces staffResponse textarea with chat input panel; Save button kept for status/assignedTo updates without staffResponse payload"
  - "Auth tokens read from localStorage (token for resident, adminToken for admin) with direct fetch calls rather than apiRequest helper to set Authorization header"
metrics:
  duration: "~2 minutes"
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_modified: 2
---

# Phase 13 Plan 06: Ticket Chat UI Summary

**One-liner:** Embedded chat panels in resident ticket-detail and admin ticket side panel, polling /api/tickets/:id/messages every 4 seconds with visual senderType distinction.

## What Was Built

### Task 1: Resident ticket-detail chat panel (commit: c5e9fea)

Added a "Chat with Support" section below the existing Updates section in `artifacts/scla/src/pages/ticket-detail.tsx`:

- `useQuery` with `refetchInterval: 4000` polling `/api/tickets/:id/messages`
- `useMutation` for POST to `/api/tickets/:id/messages`
- Messages display: resident right-aligned (`bg-primary`), staff left-aligned (`bg-muted/50`)
- Input field with Enter key support + Send button
- Auto-scroll to latest message via `useEffect` on `messages.length`
- data-testid attributes: `chat-message-{id}`, `input-chat-message`, `button-send-chat`

### Task 2: Admin ticket side panel chat section (commit: 4808be2)

Added chat section + input to `artifacts/admin/src/pages/tickets.tsx`:

- `useQuery` with `refetchInterval: 4000` polling `/api/admin/tickets/:id/messages`
- `useMutation` for POST to `/api/admin/tickets/:id/messages`
- Staff messages left-aligned (`ml-0 mr-8`), resident messages right-indented (`ml-8 mr-0`)
- Replaced staffResponse textarea with structured chat panel
- Kept Save button for status/assignedTo updates (without staffResponse)
- data-testid attributes: `admin-chat-message-{id}`, `admin-input-chat`, `admin-button-send-chat`

## Checkpoint

**Task 3: checkpoint:human-verify** — Auto-approved (auto_advance mode active).

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - both chat panels are fully wired to real API endpoints from Plan 13-04.

## Self-Check: PASSED

- `artifacts/scla/src/pages/ticket-detail.tsx` — modified, exists
- `artifacts/admin/src/pages/tickets.tsx` — modified, exists
- Commit c5e9fea — exists (feat(13-06): add chat panel to resident ticket-detail page)
- Commit 4808be2 — exists (feat(13-06): add chat panel to admin ticket side panel)
