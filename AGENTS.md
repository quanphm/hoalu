# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hoalu is a modern expense tracking and workspace management application built as a monorepo using Bun and Turbo. It features real-time synchronization, multi-workspace support, and a comprehensive API.

## Tech Stack

### Frontend (@hoalu/app)
- **Framework**: React 19 with TanStack Router, Query, and Form
- **Styling**: TailwindCSS with shadcn/ui & base-ui components
- **State Management**: Jotai atoms for local state
- **Data Fetching**: TanStack Query with custom query options
- **Real-time Sync**: Electric SQL with PGlite for offline-first experience
- **PWA**: Vite PWA plugin for progressive web app functionality

### Backend (@hoalu/api)
- **Framework**: Hono with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with custom workspace plugin
- **Validation**: Arktype for runtime validation
- **API Documentation**: OpenAPI with Scalar
- **Email**: Resend with React Email templates

### Infrastructure
- **Build System**: Turbo monorepo with Bun package manager
- **Database**: PostgreSQL 17 with logical replication (WAL)
- **Real-time Sync**: Electric SQL sync engine
- **Caching**: Redis for rate limiting and session storage
- **Containerization**: Docker Compose for local development

## Monorepo Structure

### Applications (`/apps`)
- `@hoalu/api` - Backend API with Hono
- `@hoalu/app` - Frontend React application

### Packages (`/packages`)
- `@hoalu/auth` - Better Auth plugins and workspace management
- `@hoalu/common` - Shared utilities, enums, and validation
- `@hoalu/countries` - Country, currency, and language data
- `@hoalu/email` - Email templates with React Email
- `@hoalu/furnace` - Hono server utilities and middleware
- `@hoalu/icons` - Icon library (Lucide, Meteocons, Nucleo, Tabler)
- `@hoalu/ui` - Shared UI components based on shadcn/ui
- `@hoalu/tsconfig` - TypeScript configurations

## Development Workflow

### Getting Started
```bash
# Install Bun if not already installed
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Start development environment
bun run dev

# Start local Docker services
bun run docker:up
```

### Key Commands
- `bun run build` - Build all packages and apps
- `bun run dev` - Start development servers
- `bun run lint` - Run Biome linting
- `bun run format` - Format code with Biome
- `bun run docker:up` - Start local Docker services
- `bun run docker:down` - Stop Docker services

### Database Management
```bash
# Generate migration files
cd apps/api && bun run db:generate

# Apply migrations
cd apps/api && bun run db:migrate
```

## Architecture Patterns

### API Routes Structure (`apps/api/src/routes/`)
Each entity follows a consistent pattern:
- `index.ts` - Route handlers with OpenAPI documentation
- `repository.ts` - Database operations using Drizzle ORM
- `schema.ts` - Arktype validation schemas

Example route structure:
```typescript
// Standard CRUD operations with middleware
app.get("/", workspaceQueryValidator, workspaceMember, async (c) => {
  // Handler implementation
});
```

### Frontend Architecture (`apps/app/src/`)

#### Component Organization
- `components/` - Reusable UI components
- `components/charts/` - Chart-specific components
- `components/forms/` - Form components with validation
- `components/layouts/` - Layout components
- `components/providers/` - Context providers

#### State Management
- **Global State**: Jotai atoms in `/atoms`
  - `draftExpenseAtom` - Draft expense form data
  - `selectedExpenseAtom` - Currently selected expense
  - Dialog state atoms for UI management

#### Data Layer
- **Query Management**: TanStack Query with factory pattern
  - `lib/query-key-factory.ts` - Centralized query key management
  - `services/query-options.ts` - Reusable query configurations
  - `services/mutations.ts` - Mutation configurations

#### Routing
- TanStack Router with file-based routing
- Protected routes with authentication guards
- Layout-based route organization (`_dashboard`, `_auth`)

### Real-time Synchronization

#### Electric SQL Integration
- **Doki Package**: Custom hooks for Electric SQL + TanStack Query
- **Shape-based Sync**: Subscribes to database changes via Electric shapes
- **Offline-first**: PGlite for local PostgreSQL in the browser
- **Sync Middleware**: API proxy for Electric sync endpoint with authentication

Key sync components:
```typescript
// Custom hook for real-time data
const { data, isLoading } = useDokiShape({
  syncKey: ['expenses'],
  optionsFn: () => getExpenseShapeOptions(workspaceId)
});
```

### Authentication & Authorization

#### Better Auth Configuration
- Custom workspace plugin for multi-tenant support
- Role-based access control (owner, admin, member)
- Invitation system with email notifications
- Session management with Redis

#### Workspace Management
- Multi-workspace support with slug-based routing
- Member invitation and role management
- Workspace-scoped data isolation

### Database Schema

#### Core Entities
- **Users & Auth**: Standard Better Auth schema with public IDs
- **Workspaces**: Multi-tenant workspaces with metadata
- **Members**: Workspace membership with roles
- **Expenses**: Core expense tracking with categories and wallets
- **Files**: File attachments with S3 integration
- **Exchange Rates**: Currency conversion support

#### Key Patterns
- UUID primary keys with public IDs for external references
- Workspace-scoped foreign keys for data isolation
- Full-text search indexes on text fields
- Enum types for standardized values (colors, priorities, etc.)

## Code Conventions

### Import Organization (Biome)
```typescript
// 1. Node/Bun modules
import path from "node:path";

// 2. npm packages
import { queryOptions } from "@tanstack/react-query";

// 3. @hoalu packages
import { HTTPStatus } from "@hoalu/common/http-status";

// 4. Local imports
import { apiClient } from "#app/lib/api-client.ts";
```

### Imports
We're going to configure "imports" in the package.json to use path aliases for imports.
We'll set it to "#apps/*": "./src/*" for `apps/app/src` and "#api/*": "./src/*" for `apps/api/src` which will allow us to import anything in the root of the repo with #<dirname>/<filepath>.


### Component Patterns
- Function components with TypeScript
- Custom hooks for complex logic
- Props interfaces with descriptive names
- Conditional rendering with early returns

### API Patterns
- OpenAPI documentation for all endpoints
- Consistent error handling with HTTP status codes
- Middleware chaining for authentication and validation
- Repository pattern for database operations

## Environment Configuration

### Required Environment Variables
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database connection
- `SYNC_SECRET` - Electric SQL authentication
- `SYNC_URL` - Electric SQL service URL
- `PUBLIC_API_URL` - API base URL for frontend
- `PUBLIC_APP_BASE_URL` - Frontend base URL

### Docker Services
- PostgreSQL with logical replication enabled
- Electric SQL sync engine
- Redis for caching and sessions

## Development Tips

### Working with the Monorepo
- Use workspace references (`workspace:*`) for internal packages
- Shared catalog for common dependencies
- Turbo handles build dependencies automatically

### Database Development
- Drizzle ORM with TypeScript schema definitions
- Migration-first development workflow
- Full-text search capabilities built-in

### Frontend Development
- Hot module replacement with Vite
- Type-safe routing with TanStack Router
- Optimistic updates with TanStack Query
- Real-time updates via Electric SQL shapes

### Testing & Quality
- Biome for linting and formatting
- TypeScript strict mode across all packages
- Consistent naming conventions

## Common Debugging

### Sync Issues
- Check Electric SQL service health on port 4000
- Verify `SYNC_SECRET` matches between API and Electric
- Monitor shape subscriptions in browser dev tools

### Database Issues
- Ensure PostgreSQL has `wal_level=logical` for Electric SQL
- Check migration status with Drizzle
- Verify workspace isolation in queries

### Authentication Issues
- Check session expiration logic in query options
- Verify Better Auth configuration matches frontend client
- Monitor workspace permissions in middleware
