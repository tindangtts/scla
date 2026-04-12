# Phase 32: Integration Fixes & Polish - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning
**Mode:** Auto-generated (gap closure from milestone audit)

<domain>
## Phase Boundary

Fix admin routing architecture (rename (admin) to admin directory), replace bottom nav anchor tags with Next.js Link components, add missing dark mode classes to dashboard, fix revalidatePath inconsistencies, and run code formatting.

</domain>

<decisions>
## Implementation Decisions

### Admin Routing Fix (CRITICAL)
- Rename `artifacts/web/src/app/(admin)` to `artifacts/web/src/app/admin`
- This makes all admin pages accessible at `/admin/*` URLs (e.g., `/admin/dashboard`, `/admin/tickets`)
- All existing sidebar links, redirect() calls, and revalidatePath() calls already use `/admin/*` paths — they become correct after the rename
- Middleware already checks `pathname.startsWith("/admin")` — becomes effective after rename
- The admin login page at `artifacts/web/src/app/admin/login/page.tsx` already works (it's outside the route group)

### Bottom Nav Fix (MEDIUM)
- Replace `<a href="...">` with `import Link from "next/link"` and `<Link href="...">` in resident layout
- Enables client-side navigation without full page reloads

### Dark Mode Fix (LOW)
- Add `dark:bg-gray-800 dark:border-gray-700` to dashboard quick action cards

### revalidatePath Fix (LOW)
- After admin routing fix, upgrade-requests actions need `/admin/upgrade-requests` prefix added to revalidatePath calls

### Code Formatting (ADVISORY)
- Run `pnpm format` to fix 148 pre-existing formatting issues

### Claude's Discretion
- Any other minor polish items discovered during the fix

</decisions>

<code_context>
## Existing Code Insights

### Files to Modify
- `artifacts/web/src/app/(admin)/` — rename to `artifacts/web/src/app/admin/`
- `artifacts/web/src/app/(resident)/layout.tsx` — bottom nav <a> → <Link>
- `artifacts/web/src/app/(resident)/page.tsx` — dashboard dark mode classes
- `artifacts/web/src/app/(admin)/upgrade-requests/actions.ts` — revalidatePath fix

### No New Files Needed
All fixes are modifications to existing files or directory rename.

</code_context>

<specifics>
## Specific Ideas

The directory rename is the core fix. Everything else is polish.

</specifics>

<deferred>
## Deferred Ideas

- Pre-existing typecheck errors — separate concern, not blocking functionality

</deferred>
