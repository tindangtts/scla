# Phase 16: i18n Completion & Auth Middleware Cleanup - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure/gap-closure phase)

<domain>
## Phase Boundary

Close two audit gaps: (1) Wire useTranslation on the 8 remaining pages that were missed in Phase 14, (2) Extract shared requireAdmin middleware and migrate auth.ts /me + /upgrade to shared requireAuth.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — gap closure phase. Follow existing patterns from Phase 14 (i18n) and Phase 15 (auth middleware).

Key constraints:
- Phase 14 established react-i18next pattern with `useTranslation()` hook — replicate on remaining pages
- Translation keys already exist in en.json/my.json for all 8 pages — just need to wire `t()` calls
- Phase 15 established `AuthenticatedRequest` type and `requireAuth`/`optionalAuth` in auth-middleware.ts — add `requireAdmin` there too
- auth.ts /me and /upgrade currently do inline jwt.verify — replace with requireAuth middleware

</decisions>

<canonical_refs>
## Canonical References

### i18n (ENH-01 gap)
- `artifacts/scla/src/i18n.ts` — i18n initialization
- `artifacts/scla/src/locales/en.json` — English translation keys (107 keys, all pages covered)
- `artifacts/scla/src/locales/my.json` — Myanmar translations
- `artifacts/scla/src/pages/profile.tsx` — Language toggle lives here but page itself not translated
- `artifacts/scla/src/pages/ticket-detail.tsx` — Not wired
- `artifacts/scla/src/pages/wallet.tsx` — Not wired
- `artifacts/scla/src/pages/upgrade.tsx` — Not wired
- `artifacts/scla/src/pages/bill-detail.tsx` — Not wired
- `artifacts/scla/src/pages/discover-detail.tsx` — Not wired
- `artifacts/scla/src/pages/info.tsx` — Not wired
- `artifacts/scla/src/pages/info-article.tsx` — Not wired

### Auth Middleware (QUAL-05 gap)
- `artifacts/api-server/src/lib/auth-middleware.ts` — Shared middleware (add requireAdmin here)
- `artifacts/api-server/src/routes/auth.ts` — /me and /upgrade use inline jwt.verify; upgrade-request endpoints have local requireAdmin copy
- `artifacts/api-server/src/routes/admin.ts` — Has local requireAdmin/verifyAdmin to deduplicate

</canonical_refs>

<code_context>
## Existing Code Insights

### Established Patterns
- Phase 14-06 wired 11 pages with `useTranslation` — follow same pattern
- Phase 15-04 migrated 5 route files to shared middleware — follow same pattern
- `AuthenticatedRequest` type already exported from auth-middleware.ts

### Integration Points
- 8 page files for i18n wiring
- auth-middleware.ts for requireAdmin extraction
- auth.ts for /me + /upgrade migration + requireAdmin import swap
- admin.ts for requireAdmin import swap

</code_context>

<specifics>
## Specific Ideas

No specific requirements — gap closure following established patterns.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>

---

*Phase: 16-i18n-completion-and-auth-middleware-cleanup*
*Context gathered: 2026-04-10*
