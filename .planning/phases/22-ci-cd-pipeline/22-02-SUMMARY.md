---
phase: 22-ci-cd-pipeline
plan: 02
subsystem: infra
tags: [github-actions, postgresql, pg_dump, backup, devops, runbook]

# Dependency graph
requires:
  - phase: 22-01
    provides: CI/CD pipeline foundation (lint, test, deploy workflows)
provides:
  - Daily automated PostgreSQL backup via GitHub Actions cron (CICD-04)
  - Restore runbook with exact psql commands and verification checklist (CICD-05)
affects: [database, disaster-recovery, operations]

# Tech tracking
tech-stack:
  added: [actions/upload-artifact@v4, postgresql-client-16, pg_dump, gzip]
  patterns: [GitHub artifact retention for backup storage, gzip-compressed SQL dumps, integrity verification before upload]

key-files:
  created:
    - .github/workflows/db-backup.yml
    - docs/runbook-db-restore.md
  modified: []

key-decisions:
  - "30-day GitHub artifact retention eliminates need for external backup storage (S3, GCS)"
  - "pg_dump flags --no-owner --no-acl --clean --if-exists ensure portability across environments"
  - "Integrity check (file size + CREATE TABLE grep) catches silent pg_dump failures before artifact upload"
  - "workflow_dispatch enables on-demand backups without changing the cron schedule"

patterns-established:
  - "Backup naming: scla_backup_YYYYMMDD_HHMMSS.sql.gz for chronological sorting"
  - "DATABASE_URL via env: block (not direct interpolation) following safe secrets pattern"

requirements-completed: [CICD-04, CICD-05]

# Metrics
duration: 2min
completed: 2026-04-11
---

# Phase 22 Plan 02: DB Backup & Restore Runbook Summary

**Daily PostgreSQL backup via GitHub Actions cron with pg_dump, artifact upload (30-day retention), and restore runbook covering exact psql commands and verification checklist**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-11T08:13:54Z
- **Completed:** 2026-04-11T08:15:21Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- GitHub Actions workflow runs daily at 2 AM UTC (8:30 AM Myanmar time) with manual override via `workflow_dispatch`
- Backup pipeline: pg_dump to gzip, file size check, CREATE TABLE grep, upload as artifact with 30-day retention
- Restore runbook documents: locating artifacts, exact restore commands, post-restore table count checks, multi-environment guidance, and troubleshooting table for common failure modes

## Task Commits

Each task was committed atomically:

1. **Task 1: Create daily database backup workflow** - `674731e` (feat)
2. **Task 2: Create database restore runbook** - `f40b3ef` (docs)

**Plan metadata:** (final commit below)

## Files Created/Modified

- `.github/workflows/db-backup.yml` - Scheduled daily backup workflow: pg_dump, verify, upload artifact
- `docs/runbook-db-restore.md` - Complete restore procedure with verification checklist and troubleshooting guide

## Decisions Made

- Used GitHub Actions artifact storage with 30-day retention instead of external storage (S3/GCS) — zero infrastructure cost, sufficient for 30-day point-in-time recovery window
- `pg_dump --clean --if-exists` flags ensure idempotent restores without manual table drops in most cases
- Integrity check validates backup before upload: catches silent failures where pg_dump exits 0 but produces empty output

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**DATABASE_URL secret required in GitHub repository settings.**

To activate automated backups:
1. Go to GitHub repo > Settings > Secrets and variables > Actions
2. Add secret: `DATABASE_URL` = production PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database?sslmode=require`
3. The workflow will run automatically on next scheduled trigger (2 AM UTC daily)
4. Test immediately: Go to Actions > Daily DB Backup > Run workflow

## Next Phase Readiness

- CI/CD pipeline now has backup automation in addition to lint/test/deploy from Plan 01
- Phase 22 complete — both plans shipped
- Disaster recovery procedure is documented and runnable by any team member

---
*Phase: 22-ci-cd-pipeline*
*Completed: 2026-04-11*
