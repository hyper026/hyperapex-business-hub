#!/usr/bin/env bash
set -euo pipefail

: "${DB_HOST:?DB_HOST is required}"
: "${DB_PORT:=3306}"
: "${DB_NAME:?DB_NAME is required}"
: "${DB_USER:?DB_USER is required}"
: "${DB_PASSWORD:?DB_PASSWORD is required}"
: "${BACKUP_FILE:?BACKUP_FILE is required}"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

read -r -p "Type RESTORE to replace database $DB_NAME from $BACKUP_FILE: " confirmation
[[ "$confirmation" == "RESTORE" ]] || { echo 'Restore cancelled.'; exit 1; }

gunzip -c "$BACKUP_FILE" | mysql --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" --password="$DB_PASSWORD" "$DB_NAME"
printf 'Restore completed from: %s\n' "$BACKUP_FILE"
