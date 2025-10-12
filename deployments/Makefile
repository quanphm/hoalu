.PHONY: help deploy deploy-infra deploy-platform shutdown status logs logs-infra logs-platform clean wait-for-db fetch-env check-env check-env-or-fetch

help:
	@echo "Hoalu Deployment"
	@echo "========================="
	@echo ""
	@echo "Available commands:"
	@echo "  deploy             - Full deployment (infrastructure + platform)"
	@echo "  deploy-infra       - Deploy infrastructure services only"
	@echo "  deploy-platform    - Deploy platform services only"
	@echo "  shutdown           - Stop all services gracefully"
	@echo "  status             - Show status of all services"
	@echo "  logs               - Show logs from all services"
	@echo "  logs-infra         - Show logs from infrastructure services"
	@echo "  logs-platform      - Show logs from platform services"
	@echo "  clean              - Remove all containers and volumes"
	@echo "  fetch-env          - Fetch .env"
	@echo "  check-env          - Check .env"
	@echo "  check-env-or-fetch - Check for .env or fetch"
	@echo "  help               - Show this help message"

fetch-env:
	@echo "Fetching environment from Infisical..."
	@if [ -z "$$INFISICAL_CLIENT_ID" ] || [ -z "$$INFISICAL_CLIENT_SECRET" ] || [ -z "$$INFISICAL_HOALU_PROJECT_ID" ]; then \
		echo "Error: Required Infisical environment variables not set:"; \
		echo "  INFISICAL_CLIENT_ID"; \
		echo "  INFISICAL_CLIENT_SECRET"; \
		echo "  INFISICAL_HOALU_PROJECT_ID"; \
		exit 1; \
	fi
	@export INFISICAL_TOKEN=$$(infisical login --method=universal-auth --client-id=$$INFISICAL_CLIENT_ID --client-secret=$$INFISICAL_CLIENT_SECRET --silent --plain) && \
	infisical export --projectId=$$INFISICAL_HOALU_PROJECT_ID --env=prod > .env
	@echo "Environment variables fetched successfully from Infisical"

check-env:
	@echo "Checking environment configuration..."
	@if [ ! -f ".env" ]; then \
		echo "Error: .env file not found in deployments directory"; \
		exit 1; \
	fi
	@echo "Environment configuration OK"

check-env-or-fetch:
	@if [ ! -f ".env" ]; then \
		echo ".env file not found. Fetching from Infisical..."; \
		$(MAKE) fetch-env; \
	else \
		echo "Using existing .env file"; \
	fi

wait-for-db:
	@echo "Waiting for database to be ready..."
	@set -a; \
	. ./.env; \
	set +a; \
	max_attempts=30; \
	attempt=0; \
	while ! docker compose -f docker-compose.infra.yml exec -T database pg_isready -U "$$DB_USER" -d "$$DB_NAME" > /dev/null 2>&1; do \
		attempt=$$((attempt + 1)); \
		if [ $$attempt -ge $$max_attempts ]; then \
			echo "Database failed to start within expected time"; \
			exit 1; \
		fi; \
		echo "Attempt $$attempt/$$max_attempts - Database not ready yet..."; \
		sleep 2; \
	done
	@echo "Database is ready"

deploy-infra: check-env-or-fetch
	@echo "Starting Infrastructure Deployment"
	@if docker compose -f docker-compose.infra.yml up -d --build; then \
		echo "Infrastructure services deployed successfully"; \
	else \
		echo "Failed to deploy infrastructure services"; \
		exit 1; \
	fi
	@$(MAKE) wait-for-db
	@echo "Infrastructure deployment completed successfully"

deploy-platform: check-env-or-fetch
	@echo "Starting Platform Deployment"
	@echo "Checking infrastructure availability..."
	@if ! docker compose -f docker-compose.infra.yml ps --filter "status=running" | grep -q "hoalu-db"; then \
		echo "Infrastructure services are not running. Deploying infrastructure first..."; \
		$(MAKE) deploy-infra; \
	fi
	@echo "Starting platform services..."
	@if docker compose -f docker-compose.platform.yml up -d --build; then \
		echo "Platform services deployed successfully"; \
	else \
		echo "Failed to deploy platform services"; \
		exit 1; \
	fi
	@echo "Platform deployment completed successfully"

deploy: check-env-or-fetch
	@echo "Hoalu Production Deployment"
	@echo "================================"
	@echo ""
	@echo "Deploying Infrastructure"
	@echo "--------------------------------"
	@$(MAKE) deploy-infra
	@echo ""
	@echo "Deploying Platform"
	@echo "---------------------------"
	@$(MAKE) deploy-platform
	@echo ""
	@echo "Deployment completed successfully"

shutdown:
	@echo "Hoalu Graceful Shutdown"
	@echo "=========================="
	@echo ""
	@echo "Stopping Platform Services"
	@echo "-----------------------------------"
	@if docker compose -f docker-compose.platform.yml down; then \
		echo "Platform services stopped successfully"; \
	else \
		echo "Failed to stop platform services"; \
		exit 1; \
	fi
	@echo ""
	@echo "Stopping Infrastructure Services"
	@echo "-----------------------------------------"
	@if docker compose -f docker-compose.infra.yml down; then \
		echo "Infrastructure services stopped successfully"; \
	else \
		echo "Failed to stop infrastructure services"; \
		exit 1; \
	fi
	@echo ""
	@echo "All services stopped successfully"

status:
	@echo "Infrastructure Services:"
	@echo "------------------------"
	@docker compose -f docker-compose.infra.yml ps || true
	@echo ""
	@echo "Platform Services:"
	@echo "------------------"
	@docker compose -f docker-compose.platform.yml ps || true

logs:
	@echo "=== Infrastructure Logs ==="
	@docker compose -f docker-compose.infra.yml logs --tail=50 || true
	@echo ""
	@echo "=== Platform Logs ==="
	@docker compose -f docker-compose.platform.yml logs --tail=50 || true

logs-infra:
	@docker compose -f docker-compose.infra.yml logs -f

logs-platform:
	@docker compose -f docker-compose.platform.yml logs -f

clean:
	@echo "Cleaning up containers and volumes..."
	@docker compose -f docker-compose.platform.yml down -v --remove-orphans || true
	@docker compose -f docker-compose.infra.yml down -v --remove-orphans || true
	@echo "Cleanup completed"

