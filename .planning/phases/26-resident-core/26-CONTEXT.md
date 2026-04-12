# Phase 26: Resident Core - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous mode)

<domain>
## Phase Boundary

Authenticated residents can manage their apartment finances and maintenance — viewing bills, paying invoices, managing wallet, creating and tracking maintenance tickets, and editing their profile — all via Server Components in the Next.js app. This phase covers the core resident feature set: home dashboard, bills/invoices, wallet, Star Assist tickets, and profile management.

</domain>

<decisions>
## Implementation Decisions

### Home Dashboard (RES-01)
- Server Component fetching user-specific data (bills summary, recent tickets, notifications count)
- Dynamic content by user type: guest sees upgrade prompt + limited info; resident sees full dashboard
- Reuse existing dashboard data patterns from old artifacts/scla/src/pages/home.tsx

### Bills & Invoices (RES-02, RES-12)
- Bills list page with Server Component fetching from invoices table via Drizzle
- Status filtering (all/unpaid/paid/overdue) via URL search params
- Bill detail page showing line items from invoice_items table
- Pay button triggers Server Action that creates wallet_transaction and updates invoice status
- Wallet balance computed via SUM pattern (existing v2.1 decision)

### Star Assist Tickets (RES-03, RES-04)
- Ticket list page with status filtering
- New ticket form with 8 categories (as select dropdown)
- Photo attachment via file input, stored as base64 (existing v2.1 pattern, Supabase Storage deferred)
- Ticket detail page showing messages (chat comes in Phase 29)

### Wallet (RES-10)
- Wallet page showing current balance (computed SUM) and transaction history
- Filter by transaction type (credit/debit/payment/refund)
- Security deposit tab toggle (existing v2.1 pattern)

### Profile (RES-11)
- Profile page showing user details from users table
- Edit form with Server Action to update name, phone, apartment info

### Claude's Discretion
- Data fetching patterns (direct Drizzle queries in Server Components vs separate data layer)
- Loading/error UI specifics (Suspense boundaries, error.tsx)
- Pagination approach for lists
- Form validation library choice

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@workspace/db/schema` — invoices, invoice_items, tickets, ticket_messages, wallet_transactions, users tables
- `artifacts/web/src/lib/db.ts` — Drizzle connection
- `artifacts/web/src/lib/auth.ts` — getCurrentUser, requireAuth helpers (Phase 25)
- `artifacts/web/src/components/ui/` — Button, Card, Input, Badge
- `artifacts/web/src/app/(resident)/layout.tsx` — mobile bottom nav with auth

### Established Patterns
- Server Components by default, Client Components for interactive forms
- Server Actions for mutations
- URL search params for filtering
- Drizzle ORM with eq(), and(), desc() for queries

### Integration Points
- `(resident)/layout.tsx` — bottom nav links to bills, tickets, bookings, profile
- `(resident)/page.tsx` — home dashboard (currently placeholder from Phase 24)
- Wallet balance: `SELECT SUM(amount) FROM wallet_transactions WHERE user_id = ?`

</code_context>

<specifics>
## Specific Ideas

- Mobile-first UI with Tailwind CSS, touch-friendly
- Follow existing UX patterns from old scla app
- Ticket numbers use SA-XXXX pattern (existing convention)
- Invoice amounts stored as integers (cents), display as formatted currency

</specifics>

<deferred>
## Deferred Ideas

- Real-time chat on ticket detail — Phase 29
- Push notifications for ticket updates — Phase 29
- i18n translations — Phase 30
- Dark mode theming — Phase 30

</deferred>
