# Database Restore Procedure

This runbook documents how to restore the SCLA production database from a GitHub Actions backup artifact.

---

## Prerequisites

Before starting a restore, ensure you have:

- Access to GitHub Actions artifacts (repo collaborator or higher)
- PostgreSQL client tools (`pg_dump`, `pg_restore`, `psql`) version 16+
- Target database connection string (`DATABASE_URL`)
- Sufficient permissions to DROP/CREATE tables on the target database

---

## Locating Backups

1. Navigate to the GitHub repository > **Actions** > **"Daily DB Backup"** workflow
2. Each successful run has a `db-backup-YYYYMMDD_HHMMSS` artifact
3. Download the desired artifact (click the artifact name to download a zip file)
4. Or use the GitHub CLI:
   ```bash
   gh run download <run-id> -n db-backup-<timestamp>
   ```
5. Backups are retained for **30 days** — older backups are automatically purged

---

## Restore Steps

> **WARNING:** Restoring replaces all existing data in the target database. Ensure you have confirmed the correct backup before proceeding.

```bash
# 1. Download and extract backup
unzip db-backup-YYYYMMDD_HHMMSS.zip

# 2. Verify backup contents before restoring
zcat scla_backup_YYYYMMDD_HHMMSS.sql.gz | head -50

# 3. Restore to target database (WARNING: this replaces all data)
zcat scla_backup_YYYYMMDD_HHMMSS.sql.gz | psql "$DATABASE_URL"

# 4. Verify restore succeeded
psql "$DATABASE_URL" -c "SELECT count(*) FROM users;"
psql "$DATABASE_URL" -c "SELECT count(*) FROM invoices;"
psql "$DATABASE_URL" -c "SELECT count(*) FROM tickets;"
psql "$DATABASE_URL" -c "SELECT count(*) FROM bookings;"
```

---

## Verification Checklist

After restore, verify data integrity:

- [ ] `users` table has expected row count
- [ ] `invoices` table has expected row count
- [ ] `tickets` table has expected row count
- [ ] `bookings` table has expected row count
- [ ] Application starts without errors: `pnpm run dev`
- [ ] A resident can log in and see their dashboard
- [ ] Admin portal shows correct KPI stats

---

## Restoring to a Different Environment

When restoring to staging or local development:

1. Change `DATABASE_URL` to point to the target environment (staging, local)
2. After restore, run `pnpm --filter db push` to ensure schema is in sync
3. Update any environment-specific configuration (API URLs, webhook URLs)

```bash
# Example: restore to local dev database
DATABASE_URL="postgresql://postgres:password@localhost:5432/scla_dev" \
  zcat scla_backup_YYYYMMDD_HHMMSS.sql.gz | psql "$DATABASE_URL"
```

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| `permission denied` | Database user lacks CREATEDB or is not the owner | Ensure the database user has the correct permissions |
| `relation already exists` | Expected — backup uses `--clean --if-exists` which drops first | If issues persist, drop and recreate: `dropdb $DB_NAME && createdb $DB_NAME` |
| Backup file too small | `DATABASE_URL` secret may not be set in GitHub | Verify the secret is configured; re-run the backup workflow manually |
| Partial restore | Connection interrupted during restore | Re-run the full restore — SQL dumps are transactional |
| `zcat: not found` | macOS uses `gzcat` | Use `gzcat` on macOS or `zcat` on Linux |

---

## Emergency Contacts

- **Database issues:** Check Replit dashboard for database status and connection limits
- **GitHub Actions failures:** Check the workflow run logs under Actions > Daily DB Backup > [failed run]
- **Urgent restore needed:** Contact the system administrator with the backup artifact name and target environment

---

## Related

- Backup workflow: `.github/workflows/db-backup.yml`
- Required secret: `DATABASE_URL` (production PostgreSQL connection string)
- Backup format: `scla_backup_YYYYMMDD_HHMMSS.sql.gz` (gzip-compressed SQL dump)
