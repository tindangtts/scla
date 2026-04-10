# Phase 17: Scheduler & DB Migration Bootstrap - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure/gap-closure phase)

<domain>
## Phase Boundary

Close two audit gaps: (1) Add a lightweight scheduler that triggers sendBillOverdueEmail for overdue invoices, (2) Auto-apply PostgreSQL sequences at server startup so booking/ticket creation doesn't fail on fresh deploys.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — infrastructure gap closure phase.

Key constraints:
- Use node-cron or setInterval-based scheduler (no external cron dependency — runs inside the Express process)
- Bill overdue check: query invoices where dueDate < now AND status != 'paid', call sendBillOverdueEmail for each
- Run check on startup + every 24 hours
- Auto-apply sequences: execute the SQL from lib/db/migrations/0001_add_number_sequences.sql at server startup (CREATE SEQUENCE IF NOT EXISTS is idempotent)
- Keep it simple — this is MVP scheduling, not a full job queue

</decisions>

<canonical_refs>
## Canonical References

### Email Service
- `artifacts/api-server/src/lib/email-service.ts` — sendBillOverdueEmail (exported, never called)

### Push Service
- `artifacts/api-server/src/lib/push-service.ts` — sendPushToUser (for bill-due push)

### Database
- `lib/db/migrations/0001_add_number_sequences.sql` — SQL to create sequences
- `lib/db/src/index.ts` — DB connection
- `artifacts/api-server/src/routes/invoices.ts` — Invoice queries for overdue check

### Server Entry
- `artifacts/api-server/src/index.ts` or `app.ts` — Server startup (migration auto-apply goes here)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `sendBillOverdueEmail` already implemented — just needs a caller
- `sendPushToUser` available for bill-due push notifications
- DB connection available from `@workspace/db`

### Integration Points
- Server startup (index.ts) — add migration runner + scheduler init
- New scheduler module — imports email + push services

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>

---

*Phase: 17-scheduler-and-db-migration-bootstrap*
*Context gathered: 2026-04-10*
