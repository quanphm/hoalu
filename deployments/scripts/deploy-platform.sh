#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting Hoalu Platform Deployment"

if [[ ! -f "$DEPLOY_DIR/.env" ]]; then
    echo "❌ Error: .env file not found in deployments directory"
    exit 1
fi

echo "📋 Deploying platform services..."

cd "$DEPLOY_DIR"

echo "🔍 Checking infrastructure services..."
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
