---
phase: 25-authentication
plan: 02
subsystem: auth
tags: [supabase-auth, server-actions, upgrade-workflow, seed-script, drizzle]

requires:
  - phase: 25-authentication
    provides: "Auth helpers (requireAuth, requireAdmin), Supabase client, login/register pages"
provides:
  - "Guest-to-resident upgrade request form at /upgrade"
  - "Admin upgrade request approval/rejection at /upgrade-requests"
  - "Seed script creating Supabase Auth users for all 7 demo accounts"
affects: [26-resident-features, 28-admin]

tech-stack:
  added: ["@supabase/supabase-js (scripts workspace)"]
  patterns: ["Admin service role client for auth user management", "Idempotent Supabase Auth seeding with createUser/updateUserById"]

key-files:
  created:
    - "artifacts/web/src/app/(resident)/upgrade/page.tsx"
    - "artifacts/web/src/app/(resident)/upgrade/actions.ts"
    - "artifacts/web/src/app/(resident)/upgrade/upgrade-form.tsx"
    - "artifacts/web/src/app/(admin)/upgrade-requests/page.tsx"
    - "artifacts/web/src/app/(admin)/upgrade-requests/actions.ts"
  modified:
    - scripts/src/seed.ts
    - scripts/package.json

key-decisions:
  - "Separate client component UpgradeForm for useActionState interactivity within Server Component page"
  - "Admin approval updates both app DB and Supabase Auth user_metadata for dual-source consistency"
  - "Seed auth users use actual emails/passwords from existing DB seed data for consistency"

patterns-established:
  - "Admin service role pattern: createClient(url, serviceRoleKey) for auth.admin operations in Server Actions"
  - "Conditional seed pattern: skip Supabase Auth seeding when env vars not set"

requirements-completed: [AUTH-05, AUTH-06]

duration: 3min
completed: 2026-04-11
---

# Phase 25 Plan 02: Upgrade Workflow & Auth Seed Summary

**Guest-to-resident upgrade form with admin approval workflow and idempotent Supabase Auth user seeding for all demo accounts**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-11T16:42:45Z
- **Completed:** 2026-04-11T16:46:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Guest upgrade request form with unit number, resident ID, and development dropdown
- Admin page listing all upgrade requests with approve/reject actions updating DB and Supabase Auth
- Seed script creates 7 Supabase Auth users (4 residents + 3 staff) idempotently

## Task Commits

Each task was committed atomically:

1. **Task 1: Guest upgrade request form and admin approval workflow** - `f2a5945` (feat)
2. **Task 2: Update seed script to create Supabase Auth users** - `28e5115` (feat)

## Files Created/Modified
- `artifacts/web/src/app/(resident)/upgrade/page.tsx` - Server Component checking user type/status, rendering appropriate state
- `artifacts/web/src/app/(resident)/upgrade/actions.ts` - Server Action to submit upgrade request with validation
- `artifacts/web/src/app/(resident)/upgrade/upgrade-form.tsx` - Client form component with useActionState
- `artifacts/web/src/app/(admin)/upgrade-requests/page.tsx` - Admin page listing requests with approve/reject buttons
- `artifacts/web/src/app/(admin)/upgrade-requests/actions.ts` - Server Actions for approve (updates DB + Auth metadata) and reject
- `scripts/src/seed.ts` - Added seedAuthUsers() for 7 demo accounts with idempotent handling
- `scripts/package.json` - Added @supabase/supabase-js dependency
- `pnpm-lock.yaml` - Updated lockfile

## Decisions Made
- Created separate UpgradeForm client component rather than inlining "use client" in the page, keeping the page as a Server Component for DB queries
- Admin approval updates Supabase Auth user_metadata (user_type: resident) alongside DB update for consistency
- Seed script emails/passwords match existing DB seed values exactly (not the plan's suggested values which differed slightly)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type error in listUsers() result**
- **Found during:** Task 1 (admin approval actions)
- **Issue:** `listUsers()` return type was `never` for users array due to Supabase JS v2 typing
- **Fix:** Used explicit type annotations on find callback and cast for id access
- **Files modified:** artifacts/web/src/app/(admin)/upgrade-requests/actions.ts
- **Verification:** Build passes
- **Committed in:** f2a5945 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Type fix necessary for compilation. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full auth feature set complete: login, register, admin login, route protection, upgrade workflow, auth seeding
- Ready for Phase 26 (resident features) and Phase 28 (admin features)
- All pages build successfully with Next.js 15

---
*Phase: 25-authentication*
*Completed: 2026-04-11*
