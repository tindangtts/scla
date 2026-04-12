# Phase 22: CI/CD Pipeline - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Every push to main is automatically validated and deployed; database is backed up daily. Delivers: (1) GitHub Actions CI workflow for lint + type-check + tests on push/PR, (2) merge blocking on failures, (3) automated deploy to Replit on merge to main, (4) daily PostgreSQL backup automation, (5) documented restore procedure.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase.

Key considerations:
- GitHub Actions is the CI platform
- Tests run via `pnpm run test` (Vitest, 95+ tests from Phases 18-19)
- Type checking via `pnpm run typecheck` across all packages
- Replit deployment may use Replit's deploy API or git-based auto-deploy
- PostgreSQL backup via pg_dump scheduled with GitHub Actions cron or Replit cron
- Backup storage location TBD (GitHub releases, external storage, or Replit persistent storage)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- package.json scripts at root and package level
- artifacts/api-server/vitest.config.ts — test configuration
- pnpm-workspace.yaml — workspace structure

### Established Patterns
- PNPM monorepo with workspace protocol
- Replit for deployment (single instance)
- Environment variables for secrets (SESSION_SECRET, VAPID keys, RESEND_API_KEY, DATABASE_URL)

### Integration Points
- .github/workflows/ for CI configuration
- Replit .replit file for deployment
- DATABASE_URL for backup connection

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
