#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Hoalu Production Deployment"
echo "================================"

cleanup_on_failure() {
    echo ""
    echo "❌ Deployment failed. Checking service status..."
    cd "$DEPLOY_DIR"

    echo "Infrastructure services:"
    docker compose -f docker-compose.infra.yml ps || true

    echo "Platform services:"
    docker compose -f docker-compose.platform.yml ps || true

    echo "💡 To troubleshoot:"
    echo "   1. Check logs: docker compose -f docker-compose.infra.yml logs"
    echo "   2. Check logs: docker compose -f docker-compose.platform.yml logs"
    echo "   3. Verify .env file has all required variables"

    exit 1
}
trap cleanup_on_failure ERR

cd "$DEPLOY_DIR"

echo "🔍 Checking env variables"
echo "--------------------------------"
if [[ ! -f "$DEPLOY_DIR/.env" ]]; then
    echo "❌ Error: .env file not found in deployments directory"
    exit 1
fi
source "$DEPLOY_DIR/.env"

echo "⏳ Deploying Infrastructure"
echo "--------------------------------"
bash "$SCRIPT_DIR/deploy-infra.sh"

echo ""
echo "⏳ Deploying Platform"
echo "---------------------------"
bash "$SCRIPT_DIR/deploy-platform.sh"

echo ""
echo "🎉 Deployment completed successfully!"
