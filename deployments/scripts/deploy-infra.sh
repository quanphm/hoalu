#!/bin/bash

set -euo pipefail

echo "🚀 Starting Infrastructure Deployment"

if docker compose -f docker-compose.infra.yml up -d --build; then
    echo "✅ Infrastructure services deployed successfully"
else
    echo "❌ Failed to deploy infrastructure services"
    exit 1
fi

echo "⏳ Waiting for database to be ready..."
max_attempts=30
attempt=0
while ! docker exec hoalu-db pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [[ $attempt -ge $max_attempts ]]; then
        echo "❌ Database failed to start within expected time"
        exit 1
    fi
    echo "⏳ Attempt $attempt/$max_attempts - Database not ready yet..."
    sleep 2
done

echo "✅ Infrastructure deployment completed successfully!"
