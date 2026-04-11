# Phase 25: Authentication - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous mode — smart discuss with recommended defaults)

<domain>
## Phase Boundary

Users can register, log in, and stay logged in via Supabase Auth, with Next.js middleware enforcing resident vs admin route protection, replacing all custom JWT flows. This phase delivers: Supabase Auth email/password registration and login, cookie-based session persistence, middleware route protection (resident vs admin), guest-to-resident upgrade workflow, and user data migration strategy.

</domain>

<decisions>
## Implementation Decisions

### Authentication Flow
- Use Supabase Auth `signUp` and `signInWithPassword` for email/password auth
- Use `@supabase/ssr` cookie-based sessions (already scaffolded in Phase 24)
- Login page at `/login`, registration at `/register`, admin login at `/admin/login`
- After login, redirect to `/(resident)` dashboard; after admin login, redirect to `/(admin)/dashboard`
- Use Supabase Auth `user_metadata` to store role (guest/resident/admin) and apartment info

### Middleware & Route Protection
- Next.js middleware at `middleware.ts` (root) using the `updateSession` helper from Phase 24
- Middleware checks Supabase session: no session → redirect to `/login`
- Admin routes check `user_metadata.role === 'admin'` or staff table membership → redirect to `/admin/login` if not admin
- Public routes: `/login`, `/register`, `/admin/login` — no auth required

### Guest-to-Resident Upgrade
- Guest registers with limited role, can submit upgrade request with apartment details
- Admin reviews and approves/rejects — updates `user_metadata.role` to 'resident'
- Reuse existing upgrade_requests table from Drizzle schema

### User Data Migration (AUTH-06)
- Existing users in the `users` and `staff` tables need Supabase Auth accounts
- Strategy: seed script creates Supabase Auth users via `supabase.auth.admin.createUser()` with existing emails/passwords
- For production: migration script to bulk-create auth users from existing DB records
- Map Supabase Auth `user.id` to existing `users.id` via `users.auth_id` column (or use Supabase user ID as primary)

### Claude's Discretion
- Form validation approach (Zod + react-hook-form vs simpler)
- Error message UX for failed login/registration
- Password requirements (defer to Supabase defaults or customize)
- Session refresh strategy details

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `artifacts/web/src/lib/supabase/server.ts` — Server-side Supabase client (Phase 24)
- `artifacts/web/src/lib/supabase/client.ts` — Client-side Supabase client (Phase 24)
- `artifacts/web/src/lib/supabase/middleware.ts` — Session update helper (Phase 24)
- `artifacts/web/src/lib/db.ts` — Drizzle ORM connection (Phase 24)
- `@workspace/db/schema` — users, staff, upgrade_requests tables
- `artifacts/web/src/components/ui/` — shadcn/ui Button, Card, Input, Badge (Phase 24)

### Established Patterns
- Route groups: `(resident)` and `(admin)` with separate layouts
- Mobile-first bottom nav in resident layout
- Sidebar nav in admin layout
- Server Components by default, Client Components when interactivity needed

### Integration Points
- Root `middleware.ts` — intercepts all routes for session management
- `(resident)/layout.tsx` — needs auth context for user display
- `(admin)/layout.tsx` — needs admin auth check
- Seed script (`scripts/src/seed.ts`) — needs to create Supabase Auth users

</code_context>

<specifics>
## Specific Ideas

- User prefers Supabase Auth (from memory: project_supabase_preference.md)
- Existing Supabase project: tcpluxdnfznudxfecfkg (from memory: project_supabase_db.md)
- Must preserve demo account credentials for testing (resident@test.com, guest@test.com, admin@test.com)

</specifics>

<deferred>
## Deferred Ideas

- Supabase Row-Level Security (RLS) policies — future enhancement (ENH-02)
- Social login (OAuth) — out of scope for v3.0
- Password reset via email link — could add in this phase if straightforward with Supabase
- Email verification — Supabase handles this natively, enable if time allows

</deferred>
