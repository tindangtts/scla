---
phase: 14-ux-enhancements
plan: "04"
subsystem: frontend/tickets
tags: [file-upload, image, base64, mobile-camera, tickets]
dependency_graph:
  requires: []
  provides: [photo-attachment-on-new-ticket, attachment-display-on-ticket-detail]
  affects: [artifacts/scla/src/pages/new-ticket.tsx, artifacts/scla/src/pages/ticket-detail.tsx]
tech_stack:
  added: []
  patterns: [FileReader.readAsDataURL, hidden-file-input-with-ref, base64-data-url]
key_files:
  created: []
  modified:
    - artifacts/scla/src/pages/new-ticket.tsx
    - artifacts/scla/src/pages/ticket-detail.tsx
decisions:
  - "Used accept=image/* with capture=environment for mobile camera + gallery support on a single hidden input"
  - "5MB limit validated before FileReader conversion to avoid converting oversized files"
  - "attachmentUrl already in CreateTicketBody type — no casting needed"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_modified: 2
requirements: [ENH-04]
---

# Phase 14 Plan 04: Photo Attachment for Maintenance Tickets Summary

Photo attachment capability added to new-ticket form using FileReader.readAsDataURL with 5MB validation and camera/gallery access, with base64 image display in ticket detail view.

## What Was Built

**Task 1 — Image upload with preview in new-ticket form (commit: 44b3080)**

- Added `useRef` + `Camera` + `X` imports to `new-ticket.tsx`
- Extended form state with `attachmentUrl: ""`
- Added `fileInputRef` pointing to a hidden `<input type="file" accept="image/*" capture="environment">`
- `handleFileChange`: validates 5MB limit (toast error on oversize), reads selected file with `FileReader.readAsDataURL`, stores result in form state
- Conditional render: when `form.attachmentUrl` is empty, shows dashed "Attach Photo" button with Camera icon; when set, shows preview `<img>` with an `X` remove button overlaid
- `createMutation.mutate` now passes `attachmentUrl: form.attachmentUrl || null`

**Task 2 — Attachment display in ticket detail view (commit: ee02f16)**

- Added `Paperclip` icon to `ticket-detail.tsx` lucide-react imports
- Added conditional attachment card: rendered only when `ticket.attachmentUrl` is truthy
- Attachment card: Paperclip icon + "Attachment" heading + `<img>` with `data-testid="ticket-attachment-image"`, `object-cover`, `max-h-64`, rounded container
- Placed between the ticket-info card and the Updates conversation section

## Verification Results

All criteria met:
- `accept="image/*"` and `capture="environment"` present on file input
- 5MB guard: `file.size > 5 * 1024 * 1024` with destructive toast
- `FileReader.readAsDataURL` converts image to base64 data URL
- `data-testid="preview-attachment"` present on thumbnail, `data-testid="button-remove-attachment"` on X button
- `data-testid="button-attach-photo"` on the trigger button
- `attachmentUrl` passed to `createMutation.mutate`
- `data-testid="ticket-attachment-image"` in ticket-detail.tsx
- Build: rollup native binding issue is a pre-existing environment problem, not introduced by this plan; TypeScript check confirms no new errors in modified files

## Deviations from Plan

None - plan executed exactly as written.

`attachmentUrl` was confirmed present in `CreateTicketBody` in `lib/api-client-react/src/generated/api.schemas.ts` (line 328) — no `as any` cast was needed, proper typing used throughout.

## Known Stubs

None. All attachment functionality is fully wired: file selection, base64 conversion, preview, form submission, and detail display are all live.

## Self-Check: PASSED

- `artifacts/scla/src/pages/new-ticket.tsx` — FOUND and modified
- `artifacts/scla/src/pages/ticket-detail.tsx` — FOUND and modified
- Task 1 commit `44b3080` — FOUND
- Task 2 commit `ee02f16` — FOUND
