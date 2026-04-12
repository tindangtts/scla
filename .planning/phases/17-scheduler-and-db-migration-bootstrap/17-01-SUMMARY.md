---
phase: 17-scheduler-and-db-migration-bootstrap
plan: "01"
subsystem: api-server
tags: [db-migrations, startup, sequences, postgresql]
dependency_graph:
  requires: []
  provides: [applyMigrations, booking_number_seq, ticket_number_seq]
  affects: [artifacts/api-server/src/index.ts]
tech_stack:
  added: []
  patterns: [startup-migration-runner, import.meta.url-path-resolution]
key_files:
  created:
    - artifacts/api-server/src/lib/migration-runner.ts
  modified:
    - artifacts/api-server/src/index.ts
decisions:
  - "No try/catch in applyMigrations — errors propagate to index.ts which crashes the process intentionally"
  - "Path resolved via import.meta.url so it survives esbuild bundling"
  - ".js extensions on all imports to match existing ESM pattern in api-server"
metrics:
  duration: "41s"
  completed: "2026-04-10T18:26:59Z"
  tasks_completed: 2
  files_modified: 2
requirements_satisfied:
  - COMM-02
---

# Phase 17 Plan 01: DB Migration Bootstrap Summary

**One-liner:** Idempotent PostgreSQL sequence bootstrap via applyMigrations() called before app.listen on every server startup.

## What Was Built

`migration-runner.ts` reads `lib/db/migrations/0001_add_number_sequences.sql` and runs it against the live database using `pool.query()`. The SQL uses `CREATE SEQUENCE IF NOT EXISTS`, making the operation safe to re-run on every startup. `index.ts` now calls `applyMigrations()` before `app.listen`, crashing the process on failure so the server never starts with a broken DB state.

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create migration-runner.ts | 0d00ad6 | artifacts/api-server/src/lib/migration-runner.ts |
| 2 | Wire applyMigrations into index.ts | acf303d | artifacts/api-server/src/index.ts |

## Decisions Made

1. **No try/catch in applyMigrations** — errors propagate to index.ts which calls `process.exit(1)`. Server must not start if migrations fail.
2. **import.meta.url path resolution** — `__dirname = dirname(fileURLToPath(import.meta.url))` ensures the SQL file path resolves correctly after esbuild bundling.
3. **.js extensions on imports** — matched existing ESM pattern throughout api-server (esbuild handles .ts -> .js mapping).

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `artifacts/api-server/src/lib/migration-runner.ts` — FOUND
- `artifacts/api-server/src/index.ts` — FOUND (modified)
- Commit 0d00ad6 — FOUND
- Commit acf303d — FOUND
