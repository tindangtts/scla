---
phase: 25-authentication
plan: 01
subsystem: auth
tags: [supabase-auth, next-middleware, server-actions, bcryptjs, shadcn-ui]

requires:
  - phase: 24-foundation
    provides: "Supabase client helpers (server, client, middleware), shadcn/ui components, Drizzle DB proxy"
provides:
  - "Login/register/admin-login pages with Server Actions"
  - "Auth helpers: getCurrentUser, requireAuth, requireAdmin"
  - "Middleware route protection (public vs resident vs admin paths)"
  - "Logout actions for resident and admin layouts"
affects: [26-resident-features, 27-resident-features-2, 28-admin]

tech-stack:
  added: [bcryptjs, "@radix-ui/react-label"]
  patterns: ["useActionState for form Server Actions", "Supabase Auth signInWithPassword/signUp pattern", "Middleware inline Supabase client for route protection"]

key-files:
  created:
    - artifacts/web/src/lib/auth.ts
    - artifacts/web/src/app/login/page.tsx
    - artifacts/web/src/app/login/actions.ts
    - artifacts/web/src/app/register/page.tsx
    - artifacts/web/src/app/register/actions.ts
    - artifacts/web/src/app/admin/login/page.tsx
    - artifacts/web/src/app/admin/login/actions.ts
    - artifacts/web/src/components/ui/label.tsx
    - "artifacts/web/src/app/(resident)/logout-action.ts"
    - "artifacts/web/src/app/(admin)/logout-action.ts"
  modified:
    - artifacts/web/src/middleware.ts
    - "artifacts/web/src/app/(resident)/layout.tsx"
    - "artifacts/web/src/app/(admin)/layout.tsx"
    - artifacts/web/package.json

key-decisions:
  - "Inline Supabase client in middleware instead of using updateSession helper -- needed getUser() result for route decisions"
  - "Register syncs user to app DB via Drizzle insert alongside Supabase Auth signUp for dual-source consistency"
  - "Admin login verifies staff table after Supabase Auth and signs out non-staff users"

patterns-established:
  - "useActionState pattern: all auth forms use React 19 useActionState with {error?: string} state shape"
  - "Server Action auth pattern: createClient() -> supabase.auth method -> revalidatePath -> redirect"
  - "Layout auth guard pattern: requireAuth()/requireAdmin() at top of async Server Component layouts"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-07]

duration: 3min
completed: 2026-04-11
---

# Phase 25 Plan 01: Auth Pages & Route Protection Summary

**Supabase Auth login/register/admin-login with Server Actions, middleware route protection, and layout auth guards using getUser() validation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-11T16:36:42Z
- **Completed:** 2026-04-11T16:39:52Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Login, register, and admin login pages with useActionState forms calling Supabase Auth Server Actions
- Middleware route protection: public routes bypass auth, resident routes redirect to /login, admin routes redirect to /admin/login
- Auth helpers (getCurrentUser, requireAuth, requireAdmin) with staff table verification for admin access
- Resident and admin layouts display user/staff info with logout functionality

## Task Commits

Each task was committed atomically:

1. **Task 1: Auth pages, Server Actions, and label component** - `1b586d0` (feat)
2. **Task 2: Middleware route protection and layout auth integration** - `5e736df` (feat)

## Files Created/Modified
- `artifacts/web/src/lib/auth.ts` - Shared auth helpers (getCurrentUser, requireAuth, requireAdmin)
- `artifacts/web/src/app/login/page.tsx` - Resident login form with useActionState
- `artifacts/web/src/app/login/actions.ts` - Login Server Action with signInWithPassword
- `artifacts/web/src/app/register/page.tsx` - Registration form with 5 fields
- `artifacts/web/src/app/register/actions.ts` - Register Server Action with signUp + DB sync
- `artifacts/web/src/app/admin/login/page.tsx` - Admin login form with distinct styling
- `artifacts/web/src/app/admin/login/actions.ts` - Admin login with staff table verification
- `artifacts/web/src/components/ui/label.tsx` - shadcn/ui Label component
- `artifacts/web/src/middleware.ts` - Route protection with public/resident/admin path matching
- `artifacts/web/src/app/(resident)/layout.tsx` - Resident layout with requireAuth and logout
- `artifacts/web/src/app/(resident)/logout-action.ts` - Resident logout Server Action
- `artifacts/web/src/app/(admin)/layout.tsx` - Admin layout with requireAdmin and staff info
- `artifacts/web/src/app/(admin)/logout-action.ts` - Admin logout Server Action

## Decisions Made
- Inlined Supabase client creation in middleware rather than using updateSession helper, since route protection needs the user object from getUser()
- Registration syncs to both Supabase Auth and app DB (usersTable) with bcryptjs hash for dual-source consistency
- Admin login checks staffUsersTable.isActive after Supabase Auth success, signs out non-staff users

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Auth foundation complete: login, register, admin login, route protection, auth helpers all working
- Ready for Phase 25 Plan 02 (session management / auth callback if applicable) or Phase 26 (resident features)
- All pages build successfully with Next.js 15

---
*Phase: 25-authentication*
*Completed: 2026-04-11*
