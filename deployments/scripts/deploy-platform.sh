#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Platform Deployment"

echo "🔍 Checking infrastructure available..."
if ! docker compose -f docker-compose.infra.yml ps --filter "status=running" | grep -q "hoalu-db"; then
    echo "❌ Infrastructure services are not running. Please run deploy-infra.sh first"
    exit 1
fi

echo "🔧 Starting platform services..."
if docker compose -f docker-compose.platform.yml up -d --build; then
    echo "✅ Platform services deployed successfully"
else
    echo "❌ Failed to deploy platform services"
    exit 1
fi

echo "✅ Platform deployment completed successfully!"
