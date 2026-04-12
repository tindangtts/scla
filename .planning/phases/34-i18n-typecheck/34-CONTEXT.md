# Phase 34: i18n Backfill + Typecheck Cleanup - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Complete Myanmar translations for UI strings introduced during v3.0 migration, and resolve all pre-existing typecheck errors in api route test files so `pnpm --filter @workspace/web typecheck` exits 0 and CI typecheck step passes on every push.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. No user-facing behavior changes.

Key considerations:
- **i18n**: diff `messages/en.json` vs `messages/my.json` to find missing keys. Backfill with accurate Myanmar (မြန်မာ) translations. When uncertain, transliterate product names (SCLA, Star Assist) and use natural Myanmar phrasing for verbs/nouns.
- **Typecheck**: the errors are all in test files using spread arguments and `RequestInit` typing mismatches with Next.js types. Fix by explicit tuple typing or type-asserting request bodies.

</decisions>

<code_context>
## Existing Code Insights

### Files to Touch
- `artifacts/web/messages/my.json` — backfill missing Myanmar keys
- `artifacts/web/messages/en.json` — may need sync if keys drifted
- `artifacts/web/src/app/api/cron/bill-overdue-check/__tests__/route.test.ts`
- `artifacts/web/src/app/api/notifications/unread-count/__tests__/route.test.ts`
- `artifacts/web/src/app/api/push/subscribe/__tests__/route.test.ts`
- `artifacts/web/src/app/api/tickets/[id]/messages/__tests__/route.test.ts`
- `artifacts/web/src/lib/__tests__/notifications.test.ts`
- `artifacts/web/src/lib/__tests__/push.test.ts`

### Verify
- `cd artifacts/web && pnpm typecheck` — must exit 0
- EN/MY key count parity via jq or node script

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase.

</specifics>

<deferred>
## Deferred Ideas

None — final cleanup before deploy.

</deferred>
