---
phase: 16-i18n-completion-and-auth-middleware-cleanup
plan: "02"
subsystem: api-server
tags: [auth, middleware, refactor, quality]
dependency_graph:
  requires: []
  provides: [shared-requireAdmin, migrated-auth-routes]
  affects: [artifacts/api-server/src/lib/auth-middleware.ts, artifacts/api-server/src/routes/auth.ts, artifacts/api-server/src/routes/admin.ts]
tech_stack:
  added: []
  patterns: [shared-middleware-extraction, express-middleware-chain]
key_files:
  created: []
  modified:
    - artifacts/api-server/src/lib/auth-middleware.ts
    - artifacts/api-server/src/routes/auth.ts
    - artifacts/api-server/src/routes/admin.ts
decisions:
  - "AdminTokenPayload imported type removed from auth.ts import — not used directly in handlers, only inferred via requireAdmin return type"
  - "ADMIN_SECRET retained in admin.ts scoped to signAdmin — auth-middleware.ts has its own copy for verifyAdmin to avoid cross-file dependency"
  - "AdminTokenPayload_Local intermediate interface removed immediately — was accidentally introduced during edit, corrected before commit"
metrics:
  duration: "~8 minutes"
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_modified: 3
requirements_closed:
  - QUAL-05
---

# Phase 16 Plan 02: Auth Middleware Extraction Summary

**One-liner:** Extracted requireAdmin/verifyAdmin/AdminTokenPayload into auth-middleware.ts as the single source of truth; migrated auth.ts /me and /upgrade to use requireAuth Express middleware chain.

## What Was Built

QUAL-05 gap closure: eliminates duplicate auth logic that existed in both auth.ts and admin.ts (verbatim copies placed in Phase 15), and removes two inline jwt.verify blocks in auth.ts /me and /upgrade routes.

### auth-middleware.ts changes
- Added `import * as crypto from "crypto"`
- Added exported `AdminTokenPayload` interface
- Added private `verifyAdmin` function with HMAC-SHA256 ctx:"admin" JWT verification
- Added exported `requireAdmin(req, res)` function returning `AdminTokenPayload | null`
- All four exports now live here: `AuthenticatedRequest`, `requireAuth`, `optionalAuth`, `requireAdmin`

### auth.ts changes
- Removed: local `AdminTokenPayload` interface, `verifyAdmin` function, `requireAdmin` function, `ADMIN_SECRET` constant, `crypto` import
- Added: import `{ requireAuth, requireAdmin, type AuthenticatedRequest }` from `../lib/auth-middleware.js`
- GET /me rewritten: `router.get('/me', requireAuth, async (req, res) => { const user = (req as AuthenticatedRequest).user; ... })`
- POST /upgrade rewritten: `router.post('/upgrade', requireAuth, async (req, res) => { const user = (req as AuthenticatedRequest).user; ... })`
- upgrade-requests routes (/upgrade-requests, /upgrade-requests/:id/approve, /upgrade-requests/:id/reject) now call the imported `requireAdmin`

### admin.ts changes
- Removed: local `AdminTokenPayload` interface, `verifyAdmin` function, `requireAdmin` function
- Added: import `{ requireAdmin, type AdminTokenPayload }` from `../lib/auth-middleware.js`
- Retained: `signAdmin` function (token generation for admin login — only in admin.ts, not moving)
- Retained: `ADMIN_SECRET` constant scoped above `signAdmin` (signAdmin needs it; auth-middleware.ts has its own copy)

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add requireAdmin to auth-middleware.ts | cb0435e | artifacts/api-server/src/lib/auth-middleware.ts |
| 2 | Migrate auth.ts + admin.ts to shared middleware | fd563ff | artifacts/api-server/src/routes/auth.ts, artifacts/api-server/src/routes/admin.ts |

## Verification Results

All plan verification criteria passed:
- `grep -c "export function requireAdmin" auth-middleware.ts` = 1
- `grep -c "function requireAdmin" auth.ts` = 0 (local copy deleted)
- `grep -c "function requireAdmin" admin.ts` = 0 (local copy deleted)
- `grep -c "jwt.verify" auth.ts` = 0 (inline verify removed from /me and /upgrade)
- `grep -c "from.*auth-middleware" auth.ts` = 1
- `grep -c "from.*auth-middleware" admin.ts` = 1
- `grep -c "function signAdmin" admin.ts` = 1 (not accidentally removed)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused AdminTokenPayload type import from auth.ts**
- **Found during:** Task 2 final review
- **Issue:** Plan's import template included `type AdminTokenPayload` in auth.ts import, but the type is never used directly in auth.ts handlers (callers only check `if (!adminPayload) return`)
- **Fix:** Removed `type AdminTokenPayload` from auth.ts import statement to keep the import clean and avoid TypeScript unused-import warnings
- **Files modified:** artifacts/api-server/src/routes/auth.ts
- **Commit:** fd563ff (included in same commit)

**2. [Rule 1 - Bug] Removed accidentally introduced AdminTokenPayload_Local interface in admin.ts**
- **Found during:** Task 2 edit
- **Issue:** During the edit replacing the admin.ts header, an intermediate `AdminTokenPayload_Local` interface was momentarily introduced as a placeholder
- **Fix:** Removed immediately before commit — final file has no local interfaces
- **Files modified:** artifacts/api-server/src/routes/admin.ts
- **Commit:** fd563ff (corrected before commit)

## Known Stubs

None — all routes are fully wired with real middleware.
