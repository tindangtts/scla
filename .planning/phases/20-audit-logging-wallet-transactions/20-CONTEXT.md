# Phase 20: Audit Logging & Wallet Transactions - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin actions are traceable via audit logs and wallet balances reflect real payment activity. This phase delivers: (1) audit_logs table with middleware-based capture for all admin actions, (2) wallet_transactions table with computed balance, (3) bill payment deduction from wallet, (4) admin manual wallet adjustment, (5) admin audit log viewer, (6) resident wallet transaction history with filters.

</domain>

<decisions>
## Implementation Decisions

### Audit Logging Architecture
- Express middleware wraps admin routes — captures action, actor, target automatically
- No retention limit (keep all logs) — simple for v2.1
- Read-only audit log list in admin portal with date/actor/action filters
- Single `audit_logs` table: id, actorId, actorEmail, action (enum), targetType, targetId, metadata (JSON), createdAt

### Wallet Transaction Workflows
- `wallet_transactions` table with computed balance (SUM of credits - debits) — no separate balance field
- POST /api/invoices/:id/pay deducts from wallet, creates debit transaction, updates invoice status — all in one DB transaction
- POST /api/admin/wallet/:userId/adjust with { amount, reason, type: credit/debit } for admin manual adjustments
- Show deposit transactions in existing wallet page with a tab/filter for "Security Deposit" vs "Wallet"

### Claude's Discretion
- Drizzle schema definitions for new tables
- Enum values for audit action types
- Filter/pagination implementation details for admin audit log UI
- Wallet transaction list UI layout and filtering

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- lib/db/src/schema/ — Drizzle table definitions (extend with audit_logs, wallet_transactions)
- artifacts/api-server/src/routes/admin.ts — Admin routes to wrap with audit middleware
- artifacts/api-server/src/routes/wallet.ts — Existing wallet balance endpoint
- artifacts/admin/src/pages/ — Admin portal pages

### Established Patterns
- Drizzle ORM for all DB operations with PostgreSQL native enums
- Express middleware chain (requireAuth, requireAdmin)
- Admin portal uses same React + Tailwind + Radix UI pattern as resident app
- JSON metadata columns used in other tables (invoices.lineItems, tickets.updates)

### Integration Points
- Audit middleware hooks into admin route handlers
- Wallet deduction integrates with existing invoice pay endpoint
- New admin pages need nav integration in admin sidebar
- New API routes registered in app.ts

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond the decisions captured above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
