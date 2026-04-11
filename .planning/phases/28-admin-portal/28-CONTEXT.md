# Phase 28: Admin Portal - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous mode)

<domain>
## Phase Boundary

Admin staff can perform all management operations — user management, content moderation, ticket handling, wallet adjustments, and audit log review — through the unified Next.js admin route group. This covers: KPI dashboard, user list/detail/roles, upgrade request approval, ticket management, facility/booking management, content CRUD (announcements, promotions, newsletters, FAQs), staff accounts, audit logs, and wallet credit/debit.

</domain>

<decisions>
## Implementation Decisions

### Admin Dashboard (ADM-01)
- Server Component with aggregate queries: total residents, open tickets, active bookings, revenue
- Quick-action cards linking to key admin pages

### User Management (ADM-02, ADM-03)
- Users list with search and role filter
- User detail page showing profile, bills, tickets, wallet balance
- Role assignment via Server Action (update user_metadata in Supabase Auth + users table)
- Upgrade request list with approve/reject actions (reuse Phase 25 admin actions)

### Ticket & Facility Management (ADM-04, ADM-05)
- Admin ticket list with all tickets (not just user's own), status filter, assignment
- Ticket detail with status update dropdown and admin reply
- Facilities list with CRUD operations
- Bookings overview across all users

### Content Management (ADM-06)
- CRUD pages for: announcements, promotions, newsletters, FAQs
- Rich text or markdown for content body
- Publish/draft toggle

### Staff Management (ADM-07)
- Staff list page
- Create/edit staff with role assignment
- Staff accounts use Supabase Auth with admin role

### Audit Logs (ADM-08)
- Audit log list with action and date range filters
- Read-only — no edit/delete of audit records

### Wallet Operations (ADM-09)
- Admin wallet page to credit/debit resident wallets
- Creates wallet_transaction with audit trail
- Requires selecting a resident first

### Admin Layout (ADM-10)
- Sidebar navigation with links to all admin sections
- Already scaffolded in Phase 24, needs full nav links

### Claude's Discretion
- Table component patterns (data tables with sorting/pagination)
- Form patterns for CRUD operations
- Admin data query organization

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `artifacts/web/src/app/(admin)/layout.tsx` — sidebar layout from Phase 24
- `artifacts/web/src/app/(admin)/dashboard/page.tsx` — placeholder from Phase 24
- `artifacts/web/src/app/(admin)/upgrade-requests/` — from Phase 25
- `artifacts/web/src/lib/auth.ts` — requireAdmin helper
- `artifacts/web/src/lib/queries/` — query helpers pattern from Phase 26-27
- `@workspace/db/schema` — all tables including audit_logs, staff

### Integration Points
- Admin sidebar nav needs links to all new pages
- Admin auth middleware already protects (admin) route group (Phase 25)

</code_context>

<specifics>
## Specific Ideas

- Follow existing admin UX patterns from old artifacts/admin
- Audit logs must be append-only (non-blocking design from v2.1)
- Wallet balance uses computed SUM pattern

</specifics>

<deferred>
## Deferred Ideas

- Admin real-time ticket chat — Phase 29
- i18n for admin — Phase 30

</deferred>
