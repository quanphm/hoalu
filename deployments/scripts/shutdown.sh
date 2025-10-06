#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"

echo "🛑 Hoalu Graceful Shutdown"
echo "==========================="

cleanup_on_failure() {
    echo ""
    echo "❌ Shutdown failed"
    exit 1
}
trap cleanup_on_failure ERR

cd "$DEPLOY_DIR"

echo "Step 1: Stopping Platform Services"
echo "-----------------------------------"
if docker compose -f docker-compose.platform.yml down; then
    echo "✅ Platform services stopped successfully"
else
    echo "❌ Failed to stop platform services"
    exit 1
fi

echo ""
echo "Step 2: Stopping Infrastructure Services"
echo "-----------------------------------------"
if docker compose -f docker-compose.infra.yml down; then
    echo "✅ Infrastructure services stopped successfully"
else
    echo "❌ Failed to stop infrastructure services"
    exit 1
fi

echo ""
echo "🎉 All services stopped successfully!"
