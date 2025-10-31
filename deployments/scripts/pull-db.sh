#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SCRIPT_ENV="$SCRIPT_DIR/.env"
if [ ! -f "$SCRIPT_ENV" ]; then
    echo "ERROR: .env file not found at $SCRIPT_ENV"
    exit 1
fi

set -a
source "$SCRIPT_ENV"
set +a

# Cleanup on exit
cleanup() {
    rm -f "$LOCAL_BACKUP_FILE"
}
trap cleanup EXIT

echo "Starting database pull..."

# 1. Create backup from VPS
echo "Creating backup from VPS..."
ssh -p "$VPS_PORT" "$VPS_HOST" \
    "cd $VPS_BACKUP_PATH && docker compose -f $COMPOSE_FILE_INFRA exec -T database pg_dump -U ${DB_USER} -d ${DB_NAME}" \
    > "$LOCAL_BACKUP_FILE"

if [ ! -s "$LOCAL_BACKUP_FILE" ]; then
    echo "ERROR: Backup failed"
    exit 1
fi

echo "Backup created: $(du -h "$LOCAL_BACKUP_FILE" | cut -f1)"

# 2. Stop Electric service
echo "Stopping Electric service..."
docker compose -f "$COMPOSE_FILE_LOCAL" stop electric 2>/dev/null || true

# 3. Check if database is running
if ! docker compose -f "$COMPOSE_FILE_LOCAL" ps database | grep -q "Up"; then
    echo "Starting database..."
    docker compose -f "$COMPOSE_FILE_LOCAL" up -d database

    # Wait for database
    max_attempts=30
    attempt=0
    while ! docker compose -f "$COMPOSE_FILE_LOCAL" exec -T database pg_isready -U "${DB_USER}" -d "${DB_NAME}" > /dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [ $attempt -ge $max_attempts ]; then
            echo "ERROR: Database failed to start"
            exit 1
        fi
        sleep 2
    done
fi

# 4. Recreate schema
echo "Recreating public schema..."
docker compose -f "$COMPOSE_FILE_LOCAL" exec -T database psql -U "${DB_USER}" -d "${DB_NAME}" <<-EOSQL
    DROP SCHEMA IF EXISTS drizzle CASCADE;
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO ${DB_USER};
    GRANT ALL ON SCHEMA public TO public;
EOSQL

# 5. Load backup
echo "Loading backup into local database..."
docker cp "$LOCAL_BACKUP_FILE" hoalu-db:/tmp/backup.sql
docker compose -f "$COMPOSE_FILE_LOCAL" exec -T database \
    psql -U "${DB_USER}" -d "${DB_NAME}" -f /tmp/backup.sql > /dev/null
docker compose -f "$COMPOSE_FILE_LOCAL" exec -T database rm /tmp/backup.sql

# 6. Restart Electric service
echo "Restarting Electric service..."
docker compose -f "$COMPOSE_FILE_LOCAL" up -d electric

echo "Done! Database synced successfully."
