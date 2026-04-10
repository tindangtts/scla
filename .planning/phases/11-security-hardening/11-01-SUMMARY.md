---
phase: 11-security-hardening
plan: "01"
subsystem: authentication
tags: [security, bcrypt, jwt, password-hashing, migration]
dependency_graph:
  requires: []
  provides: [bcrypt-password-hashing, dual-hash-verification, jwt-hardening, bcrypt-seeded-accounts]
  affects: [auth-routes, admin-routes, seed, jwt-lib]
tech_stack:
  added: [bcryptjs@^3.0.3]
  patterns: [re-hash-on-login, fail-fast-startup-check, timing-safe-comparison]
key_files:
  created:
    - artifacts/api-server/src/lib/password.ts
  modified:
    - artifacts/api-server/src/lib/jwt.ts
    - artifacts/api-server/src/routes/auth.ts
    - artifacts/api-server/src/routes/admin.ts
    - artifacts/api-server/src/seed.ts
    - artifacts/api-server/package.json
    - pnpm-lock.yaml
decisions:
  - "bcryptjs chosen over node-bcrypt for pure-JS ESM compatibility on Replit (no native bindings)"
  - "Re-hash-on-login strategy enables zero-downtime migration from SHA256 to bcrypt"
  - "timingSafeEqual used on legacy SHA256 path to prevent timing attacks during migration window"
  - "JWT fail-fast guard uses process.env.SESSION_SECRET type cast to resolve TS narrowing limitation"
metrics:
  duration: "~20 minutes"
  completed: "2026-04-10"
  tasks_completed: 3
  files_modified: 6
  files_created: 1
---

# Phase 11 Plan 01: bcrypt Password Migration and JWT Hardening Summary

**One-liner:** bcrypt (cost 12) replaces SHA256 with silent re-hash-on-login migration via shared password.ts module, plus fail-fast SESSION_SECRET guard and 8-hour admin JWT expiry.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create shared password.ts module with bcrypt helpers | 6abc590 | artifacts/api-server/src/lib/password.ts, package.json |
| 2 | Harden jwt.ts and update admin JWT to 8-hour expiry | 6e0de01 | jwt.ts, routes/admin.ts |
| 3 | Migrate login flows to bcrypt with re-hash on login | 1d2cbc6 | routes/auth.ts, routes/admin.ts, seed.ts, jwt.ts |

## What Was Built

### password.ts — Shared bcrypt module
- `hashPasswordBcrypt(password)`: Async bcrypt hash at cost factor 12, returns `$2b$` prefixed hash
- `verifyPassword(password, storedHash)`: Dual-path verification — bcrypt for `$2b$` hashes, timing-safe SHA256 comparison for legacy hashes
- `isLegacyHash(storedHash)`: Returns true when hash does not start with `$2b$` (needs upgrade)

### jwt.ts — Fail-fast startup validation
- Replaced `?? "scla-dev-secret-2026"` fallback with explicit throw at module load time
- Server refuses to start if `SESSION_SECRET` is absent — prevents accidental deployment with no secret

### auth.ts — User registration and login
- Register: `passwordHash: await hashPasswordBcrypt(password)` — all new accounts are bcrypt from day one
- Login: `verifyPassword()` handles both bcrypt and legacy SHA256 accounts transparently
- Re-hash on successful login: `if (isLegacyHash(user.passwordHash)) { ... db.update ... }` — silent upgrade

### admin.ts — Admin/staff login and staff creation
- Admin login: same dual-hash pattern with re-hash for legacy staff accounts
- POST /staff: new staff accounts use bcrypt (`await hashPasswordBcrypt(password)`)
- Admin JWT expiry changed from 24 hours to 8 hours (per D-11)

### seed.ts — Demo accounts
- All 7 demo account password hashes now generated with `await hashPasswordBcrypt()`
- Staff: admin123, content123, support123 — all bcrypt seeded
- Users: password123 (4 accounts) — all bcrypt seeded

## Decisions Made

1. **bcryptjs over node-bcrypt**: Pure-JS implementation, no native bindings required — compatible with Replit's hosting environment
2. **Re-hash-on-login strategy**: Existing SHA256-hashed accounts are silently upgraded on their next successful login — zero downtime, no forced password resets
3. **timing-safe legacy path**: Even during the migration window, SHA256 comparisons use `timingSafeEqual` to prevent timing oracle attacks
4. **TypeScript cast for SESSION_SECRET**: TypeScript cannot narrow `string | undefined` to `string` after a module-scope `throw` in an `if` block, so `as string` cast is used after the guard

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Missing `const router = Router()` in auth.ts**
- **Found during:** Task 3 typecheck
- **Issue:** When removing the `import * as crypto` line and `hashPassword` function (which were on lines 5 and 10-12), the original `const router = Router()` on line 8 was accidentally omitted from the replacement
- **Fix:** Re-added `const router = Router();` after the imports block
- **Files modified:** artifacts/api-server/src/routes/auth.ts
- **Commit:** 1d2cbc6

**2. [Rule 1 - Bug] TypeScript type narrowing in jwt.ts**
- **Found during:** Task 3 typecheck — `TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'BinaryLike | KeyObject'`
- **Issue:** TypeScript cannot narrow `process.env.SESSION_SECRET` from `string | undefined` to `string` after a module-scope `if (!x) throw` guard
- **Fix:** Changed to `if (!process.env.SESSION_SECRET) { throw ... }` then `const SECRET = process.env.SESSION_SECRET as string`
- **Files modified:** artifacts/api-server/src/lib/jwt.ts
- **Commit:** 1d2cbc6

### Pre-existing Issues (Out of Scope)

The `pnpm typecheck` run reveals 76 pre-existing TypeScript errors (down from 78 before our changes):
- TS6305: lib/db dist declarations not built (project references issue, pre-existing)
- TS7006: implicit `any` in arrow function callbacks across admin.ts and other routes (pre-existing)

These were present before this plan and are not introduced by our changes. Logged to deferred items.

## Known Stubs

None — all password hashing paths are fully wired. The re-hash path is intentionally conditional (triggers only for legacy accounts).

## Self-Check: PASSED

- [x] `artifacts/api-server/src/lib/password.ts` — exists, exports all 3 functions
- [x] `artifacts/api-server/src/lib/jwt.ts` — contains `throw new Error`, no `scla-dev-secret-2026`
- [x] `artifacts/api-server/src/routes/auth.ts` — contains `isLegacyHash`, `hashPasswordBcrypt`, no `function hashPassword`
- [x] `artifacts/api-server/src/routes/admin.ts` — contains `60 * 60 * 8`, `isLegacyHash`, no `function hashPassword`, no `scla-dev-secret-2026`
- [x] `artifacts/api-server/src/seed.ts` — contains `hashPasswordBcrypt`, no `function hashPassword`
- [x] Commit 6abc590 (Task 1) — verified
- [x] Commit 6e0de01 (Task 2) — verified
- [x] Commit 1d2cbc6 (Task 3) — verified
