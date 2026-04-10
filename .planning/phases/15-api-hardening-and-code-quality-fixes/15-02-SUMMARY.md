---
phase: 15-api-hardening-and-code-quality-fixes
plan: 02
subsystem: api-server
tags: [error-handling, validation, express, security]
requirements: [QUAL-04, QUAL-08]
dependency_graph:
  requires: []
  provides: [global-error-handler, staff-password-validation]
  affects: [artifacts/api-server/src/app.ts, artifacts/api-server/src/routes/admin.ts]
tech_stack:
  added: []
  patterns: [express-4-param-error-handler, password-length-validation]
key_files:
  created: []
  modified:
    - artifacts/api-server/src/app.ts
    - artifacts/api-server/src/routes/admin.ts
decisions:
  - "4-param Express error handler placed as the last app.use call after the /api router mount so Express routes it correctly as an error handler"
  - "Error handler logs server errors (status >= 500) via existing pino logger; client errors are passed through with err.message"
  - "Password validation in POST /admin/staff mirrors the identical check in auth.ts resident registration for consistency"
metrics:
  duration: 5m
  completed: "2026-04-10T12:48:18Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 15 Plan 02: Global Error Handler and Staff Password Validation Summary

**One-liner:** Global 4-param Express error handler in app.ts plus password-length guard on POST /admin/staff — consistent JSON error shape and minimum-8-char password enforcement.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add global Express error handler to app.ts | c47116c | artifacts/api-server/src/app.ts |
| 2 | Add password length validation to POST /admin/staff | 877231f | artifacts/api-server/src/routes/admin.ts |

## What Was Built

### Task 1 — Global Express Error Handler (app.ts)

Added `Request`, `Response`, and `NextFunction` to the existing express import, then registered a 4-argument error-handler middleware as the last `app.use` call in `app.ts` — after `app.use("/api", router)` and before `export default app`.

The handler:
- Reads `err.status` or `err.statusCode` (coercing to 500 if absent)
- Logs server errors (status >= 500) via the existing `logger.error` call
- Returns `{ error: "internal_server_error", message: "An unexpected error occurred" }` for 5xx responses
- Returns `{ error: "internal_server_error", message: err.message }` for 4xx errors passed through `next(err)`

### Task 2 — Password Length Validation on POST /admin/staff (admin.ts)

Inserted a single guard line in the POST `/staff` handler, immediately after the existing required-fields check:

```typescript
if (password.length < 8) return res.status(400).json({ error: "validation_error", message: "Password must be at least 8 characters" });
```

This mirrors the identical pattern used in `auth.ts` resident registration, closing the gap where staff accounts could be created with trivially short passwords.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- [x] `c47116c` exists: `git log --oneline | grep c47116c` — found
- [x] `877231f` exists: `git log --oneline | grep 877231f` — found
- [x] `grep -n "err: Error" artifacts/api-server/src/app.ts` — line 56 found
- [x] `grep -n "internal_server_error" artifacts/api-server/src/app.ts` — line 62 found
- [x] Error handler line 56 > router mount line 51 — confirmed
- [x] `grep -n "password.length < 8" artifacts/api-server/src/routes/admin.ts` — line 587 found
- [x] No new TypeScript errors introduced in app.ts or admin.ts (pre-existing unbuilt-dist errors in other files are out of scope)
