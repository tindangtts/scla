---
phase: 26-resident-core
plan: 01
subsystem: ui
tags: [nextjs, server-components, server-actions, drizzle, wallet, invoices, profile]

requires:
  - phase: 25-authentication
    provides: Supabase Auth with requireAuth(), user lookup, middleware route protection
provides:
  - Resident home dashboard with guest vs resident differentiation
  - Bills list with status filtering and bill detail with line items
  - Invoice payment via wallet debit Server Action
  - Wallet balance and transaction history page
  - Profile view and edit with Server Actions
affects: [26-resident-core, 27-resident-features, 28-admin]

tech-stack:
  added: []
  patterns: [query-helpers-in-lib-queries, formatMMK-helper, useActionState-for-forms]

key-files:
  created:
    - artifacts/web/src/lib/queries/dashboard.ts
    - artifacts/web/src/lib/queries/bills.ts
    - artifacts/web/src/lib/queries/wallet.ts
    - artifacts/web/src/app/(resident)/bills/page.tsx
    - artifacts/web/src/app/(resident)/bills/[id]/page.tsx
    - artifacts/web/src/app/(resident)/bills/[id]/pay-action.ts
    - artifacts/web/src/app/(resident)/bills/[id]/pay-button.tsx
    - artifacts/web/src/app/(resident)/wallet/page.tsx
    - artifacts/web/src/app/(resident)/profile/page.tsx
    - artifacts/web/src/app/(resident)/profile/actions.ts
    - artifacts/web/src/app/(resident)/profile/edit-form.tsx
  modified:
    - artifacts/web/src/app/(resident)/page.tsx

key-decisions:
  - "Query helpers in src/lib/queries/ for reusable data fetching"
  - "Wallet balance computed via SUM(CASE) SQL, consistent with v2.1 pattern"
  - "Overdue filter uses current_date SQL comparison for server-side accuracy"

patterns-established:
  - "Query helpers: reusable async functions in lib/queries/ for DB access"
  - "formatMMK: Number().toLocaleString() + ' MMK' for currency display"
  - "Server Action pattern: prevState + formData signature with useActionState in client component"

requirements-completed: [RES-01, RES-02, RES-10, RES-11, RES-12]

duration: 3min
completed: 2026-04-11
---

# Phase 26 Plan 01: Resident Core Pages Summary

**Resident dashboard with guest/resident split, bills list with status filtering, invoice payment from wallet, wallet balance view, and profile management**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-11T17:02:15Z
- **Completed:** 2026-04-11T17:05:12Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Home dashboard differentiates guest (upgrade prompt) vs resident (bills summary, wallet balance, recent tickets, quick actions)
- Bills page with All/Unpaid/Paid/Overdue filter tabs, bill detail with line items table and pay button
- Invoice payment Server Action validates wallet balance, creates debit transaction, updates invoice to paid
- Wallet page shows computed balance and full transaction history
- Profile page displays user details with editable name and phone fields

## Task Commits

Each task was committed atomically:

1. **Task 1: Home dashboard, bills list/detail, and wallet pages** - `6fd9c51` (feat)
2. **Task 2: Invoice payment, profile management, and wiring** - `a76b320` (feat)

## Files Created/Modified

- `artifacts/web/src/lib/queries/dashboard.ts` - Dashboard data aggregation (unpaid bills, tickets, wallet balance)
- `artifacts/web/src/lib/queries/bills.ts` - Bills list with status filtering, single bill lookup
- `artifacts/web/src/lib/queries/wallet.ts` - Wallet balance computation and transaction listing
- `artifacts/web/src/app/(resident)/page.tsx` - Rewritten home dashboard with guest/resident split
- `artifacts/web/src/app/(resident)/bills/page.tsx` - Bills list with filter tabs
- `artifacts/web/src/app/(resident)/bills/[id]/page.tsx` - Bill detail with line items table
- `artifacts/web/src/app/(resident)/bills/[id]/pay-action.ts` - Pay invoice Server Action
- `artifacts/web/src/app/(resident)/bills/[id]/pay-button.tsx` - PayButton client component with useActionState
- `artifacts/web/src/app/(resident)/wallet/page.tsx` - Wallet balance and transaction history
- `artifacts/web/src/app/(resident)/profile/page.tsx` - Profile view with user details
- `artifacts/web/src/app/(resident)/profile/actions.ts` - Update profile Server Action
- `artifacts/web/src/app/(resident)/profile/edit-form.tsx` - EditForm client component

## Decisions Made

- Query helpers placed in `src/lib/queries/` for reuse across pages (dashboard, bills, wallet)
- Wallet balance uses SUM(CASE) SQL aggregation, consistent with v2.1 computed balance pattern
- Overdue bills filter uses PostgreSQL `current_date` for server-side date comparison accuracy
- PayButton uses a temporary stub in Task 1 then wired to payInvoice action in Task 2

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All resident core financial pages are ready
- Plan 02 (star-assist tickets, bookings, discover) can build on this foundation
- Profile page ready for future enhancements (avatar, notification preferences)

---
*Phase: 26-resident-core*
*Completed: 2026-04-11*
