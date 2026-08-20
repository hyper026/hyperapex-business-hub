# Hyperapex Business Hub — Backup & Recovery Runbook

## Scope
This runbook covers MySQL database backups for the Business Hub. Backups may contain confidential client and financial information and must be stored in a private, access-controlled location.

## Recommended production policy
- Run a database backup once per day during a low-traffic period.
- Keep at least 14 daily copies; extend retention when required by the firm's records policy.
- Store a second copy outside the application server in encrypted private storage.
- Never commit `.sql`, `.sql.gz`, database credentials, or backup files to Git.
- Periodically perform a test restore to a separate database/environment.

## Configuration
Set these environment variables in the production environment:

```text
DB_HOST
DB_PORT=3306
DB_NAME
DB_USER
DB_PASSWORD
BACKUP_DIR=/secure/private/backups
BACKUP_RETENTION_DAYS=14
```

## Create a backup
From the backend directory:

```bash
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
```

The script uses `mysqldump --single-transaction` and gzip compression, then removes backup files older than the configured retention period.

## Restore
**Restoration can overwrite current data. Confirm the target database and backup before proceeding.**

```bash
chmod +x scripts/restore-db.sh
BACKUP_FILE=/secure/private/backups/hyperapex_business_hub_YYYYMMDDTHHMMSSZ.sql.gz ./scripts/restore-db.sh
```

The script requires the operator to type `RESTORE` before importing the backup.

## Scheduling
Use the hosting provider's scheduler/cron facility to run the backup daily. Example cron entry for 02:30 server time:

```cron
30 2 * * * cd /srv/hyperapex/backend && /usr/bin/env bash scripts/backup-db.sh >> /var/log/hyperapex-db-backup.log 2>&1
```

Use the production server's actual paths and timezone. Do not place passwords directly in the cron line; load them from the protected application environment or a secrets manager.

## Recovery checklist
1. Confirm the incident and preserve the current environment where possible.
2. Identify the latest known-good backup.
3. Verify the backup file exists and is readable.
4. Restore to a staging/separate database first when time and circumstances allow.
5. Verify clients, matters, quotations, invoices, payments and task records.
6. Switch the application to the recovered database only after verification.
7. Record the recovery date, backup used, operator and outcome.
8. Create a fresh backup after recovery.

## Important
This repository provides scripts and a runbook; it does not itself create an external backup service. Production scheduling, encrypted off-site storage, credentials and access controls must be configured on the hosting infrastructure.