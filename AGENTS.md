# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Project Overview

**Hoalu** is a modern expense tracking and workspace management application built as a monorepo using Bun and Turbo. It features real-time synchronization, multi-workspace support, offline-first architecture, and a comprehensive API.

**Version**: 0.15.0
**Package Manager**: Bun
**Build System**: Turborepo

## Tech Stack

### Frontend (@hoalu/app)

- **Framework**: React 19 with React DOM 19
- **Routing**: TanStack Router v1.134+ with file-based routing
- **Data Fetching**: TanStack Query v5.90+ with TanStack React DB v0.1+
- **Forms**: TanStack Form v1.23+ with Zod v4 validation
- **State Management**: Jotai v2.15+ atoms for local state
- **Real-time Sync**:
  - Electric SQL with `@electric-sql/pglite` v0.3+
  - `@tanstack/electric-db-collection` for reactive collections
  - PGlite Sync for offline-first PostgreSQL in browser
- **Styling**:
  - TailwindCSS v4.1+ with `@tailwindcss/vite`
  - shadcn/ui and base-ui components via `@hoalu/ui`
  - `class-variance-authority` for component variants
- **UI Components**:
  - TipTap v3.10+ for rich text editing
  - Recharts v3.3+ for data visualization
  - TanStack Table v8.21+ and Virtual v3.13+ for lists
- **PWA**: Vite PWA plugin with workbox strategies
- **Dev Tools**: React Query DevTools, Router DevTools, Form DevTools
- **Build Tool**: Vite with SWC for fast compilation
- **Hotkeys**: react-hotkeys-hook v5.2+

### Backend (@hoalu/api)

- **Framework**: Hono v4.10+ (lightweight web framework)
- **Runtime**: Bun (Node.js alternative)
- **Database**: PostgreSQL 17 with Drizzle ORM v0.44+
- **Authentication**: Better Auth v1.3+ with custom workspace plugin
- **Validation**:
  - Zod v4 for schema validation
  - `@hono/zod-validator` and `@hono/standard-validator`
  - `hono-openapi` for OpenAPI generation
- **API Documentation**: Scalar via `@scalar/hono-api-reference`
- **Email**:
  - React Email for templates
  - Nodemailer v7 for sending
  - `@react-email/render` for HTML generation
- **Storage**:
  - Redis (ioredis v5.8+) for caching and sessions
  - PostgreSQL (pg v8.16+) as primary database
- **Schema Management**: Drizzle Kit v0.31+ for migrations

### Infrastructure

- **Build System**: Turborepo with Bun workspaces
- **Database**:
  - PostgreSQL 17 with logical replication (WAL level)
  - Drizzle ORM with migration-first workflow
- **Real-time Sync**: Electric SQL sync engine on port 4000
- **Caching**: Redis for rate limiting, sessions, and temporary data
- **Reverse Proxy**: Caddy v2+ for development proxy server
  - Automatic HTTPS with self-signed certificates for localhost (when using https:// scheme)
  - HTTP/2 and HTTP/3 support enabled by default on HTTPS connections
  - Gzip compression for all responses
  - Simple reverse proxy configuration
- **Containerization**: Docker Compose for local development
  - `docker-compose.local.yml` - Local development
  - `docker-compose.infra.yml` - Infrastructure services
  - `docker-compose.platform.yml` - Platform deployment

#### Reverse Proxy with Caddy

**Port Architecture:**

```
Development Setup:
  Browser → hoalu.localhost (Caddy) → localhost:5173 (Vite dev server)
  Browser → api.hoalu.localhost (Caddy) → localhost:3000 (Hono API)

Internal Services:
  - Vite dev server: localhost:5173 (HTTP, not directly accessible)
  - Hono API server: localhost:3000 (HTTP, not directly accessible)
  - Electric SQL: localhost:4000 (HTTP, proxied through API `/sync`)
  - PostgreSQL: localhost:5432 (internal)
  - Redis: localhost:6379 (internal)

Public-facing (via Caddy):
  - Frontend: http://hoalu.localhost (HTTP by default, HTTPS optional)
  - API: http://api.hoalu.localhost (HTTP by default, HTTPS optional)
```

**Current Caddyfile Configuration (`/Caddyfile`):**

```caddy
api.hoalu.localhost {
	reverse_proxy localhost:3000
	encode gzip
}

hoalu.localhost {
	reverse_proxy localhost:5173
	encode gzip
}
```

**HTTPS Configuration (Optional):**

To enable HTTPS with automatic TLS certificates, prefix addresses with `https://`:

```caddy
# API proxy with HTTPS and HTTP/2
https://api.hoalu.localhost {
	# Handle CORS preflight requests
	@options {
		method OPTIONS
	}
	handle @options {
		header {
			Access-Control-Allow-Origin "https://hoalu.localhost"
			Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
			Access-Control-Allow-Headers "Content-Type, Authorization, Cookie"
			Access-Control-Allow-Credentials "true"
			Access-Control-Max-Age "86400"
		}
		respond 204
	}

	# Add CORS headers to all responses
	header {
		Access-Control-Allow-Origin "https://hoalu.localhost"
		Access-Control-Allow-Credentials "true"
	}

	reverse_proxy localhost:3000 {
		header_up Host {host}
		header_up X-Real-IP {remote_host}
	}

	encode gzip
}

# Frontend proxy with HTTPS and HTTP/2
https://hoalu.localhost {
	reverse_proxy localhost:5173
	encode gzip
}
```

**Running Caddy:**

```bash
# Run Caddy from project root
caddy run

# Or run in background
caddy start

# Reload configuration without downtime
caddy reload

# Stop Caddy
caddy stop

# Validate Caddyfile syntax
caddy validate --config Caddyfile
```

**Caddy Features:**

- **Automatic TLS**: When using `https://` scheme, Caddy auto-generates self-signed certificates for localhost
- **HTTP/2**: Automatically enabled for HTTPS connections
- **HTTP/3**: Enabled by default (QUIC protocol)
- **Compression**: Gzip encoding applied to all proxied responses
- **Custom Local Domains**: Uses `.localhost` TLDs which work without `/etc/hosts` modification
- **Zero Config**: Works out of the box with minimal configuration

**Benefits:**

- ✅ Custom local domains (hoalu.localhost) instead of port-based URLs
- ✅ No need to modify `/etc/hosts` - `.localhost` domains work natively
- ✅ Clean, production-like URLs in development
- ✅ Gzip compression reduces bandwidth usage
- ✅ Optional HTTPS support for production-like development
- ✅ HTTP/2 multiplexing when using HTTPS
- ✅ Matches production deployment architecture
- ✅ Single proxy point for frontend and API
- ✅ Easy to add features like rate limiting, caching, or load balancing

## Monorepo Structure

```
hoalu/
├── apps/
│   ├── api/              # Backend Hono API
│   │   ├── src/
│   │   │   ├── db/       # Drizzle schema and connection
│   │   │   ├── lib/      # Auth, Redis, S3, Email utilities
│   │   │   ├── middlewares/  # User session, workspace member
│   │   │   ├── modules/  # API, Auth, OpenAPI, Sync modules
│   │   │   ├── routes/   # CRUD routes (categories, expenses, etc.)
│   │   │   ├── utils/    # Constants, I/O, monetary helpers
│   │   │   └── validators/  # Request validators
│   │   └── migrations/   # Drizzle database migrations
│   │
│   ├── app/              # Frontend React application
│   │   ├── src/
│   │   │   ├── atoms/    # Jotai state atoms
│   │   │   ├── components/  # React components
│   │   │   │   ├── charts/     # Data visualization
│   │   │   │   ├── expenses/   # Expense-specific components
│   │   │   │   ├── forms/      # Form components with TanStack Form
│   │   │   │   ├── layouts/    # Layout components
│   │   │   │   ├── providers/  # Context providers
│   │   │   │   └── wallets/    # Wallet components
│   │   │   ├── helpers/  # Utility functions
│   │   │   ├── hooks/    # Custom React hooks
│   │   │   ├── lib/      # Core libraries
│   │   │   │   ├── collections/  # TanStack DB collections
│   │   │   │   ├── api-client.ts
│   │   │   │   ├── query-key-factory.ts
│   │   │   │   └── schema.ts
│   │   │   ├── routes/   # TanStack Router routes
│   │   │   │   ├── _auth/      # Auth routes
│   │   │   │   └── _dashboard/ # Dashboard routes
│   │   │   ├── services/ # API queries and mutations
│   │   │   └── styles/   # Global styles
│   │   └── public/       # Static assets
│   │
│   └── web/              # Reserved for future web app
│
├── packages/
│   ├── auth/             # Better Auth plugins & workspace management
│   ├── common/           # Shared utilities, enums, validation schemas
│   ├── countries/        # Country, currency, language data
│   ├── email/            # React Email templates
│   ├── furnace/          # Hono server utilities & middleware
│   ├── icons/            # Icon libraries (Lucide, Meteocons, Nucleo, Tabler)
│   ├── themes/           # TailwindCSS theme configurations
│   ├── tsconfig/         # Shared TypeScript configurations
│   └── ui/               # Shared UI components (shadcn/ui based)
│
├── deployments/          # Docker and deployment configs
│   ├── scripts/          # Deployment scripts
│   └── *.Dockerfile      # Container definitions
│
└── package.json          # Root workspace config with catalog
```

### Applications (`/apps`)

#### `@hoalu/api` - Backend API

- **Path Alias**: `#api/*` maps to `./src/*`
- **Build**: Bun bundler for production, TypeScript for type definitions
- **Main Entry**: `src/index.ts`
- **Key Files**:
  - `src/app.ts` - Hono app configuration
  - `src/db/schema.ts` - Drizzle database schema (346 lines)
  - `src/db/index.ts` - Database connection
  - `src/lib/auth.ts` - Better Auth setup
  - `src/modules/sync.ts` - Electric SQL sync proxy

#### `@hoalu/app` - Frontend Application

- **Path Alias**: `#app/*` maps to `./src/*`
- **Build**: Vite with React SWC plugin
- **Main Entry**: `src/main.tsx`
- **Key Files**:
  - `src/lib/api-client.ts` - Hono RPC client (8105 lines)
  - `src/lib/schema.ts` - Frontend type definitions (3127 lines)
  - `src/hooks/use-db.ts` - TanStack DB live queries
  - `src/services/query-options.ts` - Reusable query configs
  - `src/services/mutations.ts` - Mutation configurations

### Packages (`/packages`)

#### Core Packages

- **@hoalu/auth** - Better Auth workspace plugin
- **@hoalu/common** - Shared utilities (`datetime`, `monetary`, `schema`, `enums`)
- **@hoalu/countries** - Country/currency data with helpers
- **@hoalu/email** - React Email templates (join-workspace, reset-password, verify-email)
- **@hoalu/furnace** - Hono utilities (error handlers, auth guards, CORS, OpenAPI)
- **@hoalu/icons** - Unified icon exports from multiple libraries
- **@hoalu/themes** - TailwindCSS color themes and base styles
- **@hoalu/tsconfig** - Shared TypeScript configs (base, app, bun, vite)
- **@hoalu/ui** - shadcn/ui components with customizations

## Development Workflow

### Getting Started

```bash
# Install Bun if not already installed
curl -fsSL https://bun.sh/install | bash

# Install Caddy if not already installed (macOS)
brew install caddy

# Install dependencies
bun install

# Start local infrastructure (PostgreSQL, Redis, Electric)
bun run docker:up

# Start Caddy reverse proxy (in project root)
caddy run

# Start development servers (API + App)
bun run dev
```

### Key Commands

**Root Level:**

- `bun run build` - Build all packages and apps (via Turbo)
- `bun run dev` - Start dev servers for all apps
- `bun run docker:up` - Start Docker infrastructure
- `bun run docker:down` - Stop Docker infrastructure

**Caddy:**

```bash
# Start Caddy reverse proxy
caddy run                 # Run in foreground
caddy start               # Run in background
caddy reload              # Reload configuration
caddy stop                # Stop Caddy server
caddy validate            # Validate Caddyfile syntax
```

**API (@hoalu/api):**

```bash
cd apps/api

# Database
bun run db:generate    # Generate Drizzle migrations
bun run db:migrate     # Apply migrations

# Development
bun run dev           # Start API dev server with auto-reload
bun run build         # Build API and type definitions
bun run clean         # Clean build artifacts
```

**App (@hoalu/app):**

```bash
cd apps/app

# Development
bun run dev           # Start Vite dev server
bun run dev:pwa       # Start with PWA dev mode
bun run build         # Build for production
bun run preview       # Preview production build
```

### Database Management

```bash
# From apps/api directory
bun run db:generate   # Create migration from schema changes
bun run db:migrate    # Apply pending migrations

# Pull production database (deployment script)
./deployments/scripts/pull-db.sh
```

## Architecture Patterns

### API Routes Structure (`apps/api/src/routes/`)

Each entity (categories, expenses, wallets, tasks, files, exchange-rates) follows a consistent three-file pattern:

**1. `index.ts` - Route Handlers with OpenAPI**

```typescript
import { createHonoApp } from "@hoalu/furnace";
import { workspaceQueryValidator } from "#api/validators/workspace-query.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import * as repository from "./repository.ts";
import * as schema from "./schema.ts";

const app = createHonoApp();

// GET /api/expenses?workspaceId=xxx
app.get("/", workspaceQueryValidator, workspaceMember, async (c) => {
  const { workspaceId } = c.var.workspace;
  const expenses = await repository.findMany(workspaceId);
  return c.json({ data: expenses });
});

// POST /api/expenses
app.post("/", jsonBodyValidator(schema.CreateExpenseSchema), async (c) => {
  // Handler implementation
});

export default app;
```

**2. `repository.ts` - Database Operations**

```typescript
import { db } from "#api/db/index.ts";
import { expense, wallet, category } from "#api/db/schema.ts";
import { eq, desc } from "drizzle-orm";

export async function findMany(workspaceId: string) {
  return db
    .select()
    .from(expense)
    .where(eq(expense.workspaceId, workspaceId))
    .orderBy(desc(expense.date));
}

export async function create(data: InsertExpense) {
  return db.insert(expense).values(data).returning();
}
```

**3. `schema.ts` - Zod Validation Schemas**

```typescript
import * as z from "zod";
import { CurrencySchema, RepeatSchema } from "@hoalu/common/schema";

export const CreateExpenseSchema = z.object({
  title: z.string().min(1),
  amount: z.coerce.number(),
  currency: CurrencySchema,
  repeat: RepeatSchema,
  // ...
});

export const UpdateExpenseSchema = CreateExpenseSchema.partial();
```

**Middleware Flow:**

```
Request
  → workspaceQueryValidator (validates ?workspaceId)
  → workspaceMember (checks user is member)
  → handler (executes business logic)
  → response
```

### Frontend Architecture (`apps/app/src/`)

#### Path Aliases

```typescript
// Use #app/* for all imports
import { useAuth } from "#app/hooks/use-auth.ts";
import { apiClient } from "#app/lib/api-client.ts";
import { ExpenseFormSchema } from "#app/lib/schema.ts";
```

#### Component Organization

```
components/
├── charts/           # Data visualization components
│   ├── expense-stats-row.tsx
│   ├── expenses-overview.tsx
│   ├── category-breakdown.tsx
│   └── date-range-picker.tsx
│
├── expenses/         # Expense-specific components
│   ├── expense-list.tsx      # Virtualized list
│   ├── expense-content.tsx   # List item component
│   ├── expense-details.tsx   # Detail view
│   ├── expense-actions.tsx   # Action buttons
│   └── expense-filter.tsx    # Filter controls
│
├── forms/            # Form components with TanStack Form
│   ├── form.tsx              # Base form wrapper
│   ├── input.tsx             # Text inputs
│   ├── select.tsx            # Select dropdowns
│   ├── datepicker.tsx        # Date picker
│   ├── transaction-amount.tsx # Currency input
│   └── files.tsx             # File upload
│
├── layouts/          # Layout components
├── providers/        # React context providers
│   ├── ui-provider.tsx
│   ├── dialog-provider.tsx
│   ├── local-postgres-provider.tsx
│   └── workspace-action-provider.tsx
│
└── wallets/          # Wallet components
```

#### State Management with Jotai

**Location**: `apps/app/src/atoms/`

```typescript
// atoms/expenses.ts
import { atom } from "jotai";

export const draftExpenseAtom = atom<Partial<ExpenseFormSchema> | null>(null);
export const selectedExpenseAtom = atom<string | null>(null);

// atoms/dialogs.ts
export const expenseDialogAtom = atom(false);
export const categoryDialogAtom = atom(false);

// atoms/filters.ts
export const dateRangeAtom = atom<{ from: Date; to: Date } | null>(null);
```

**Usage Pattern:**

```typescript
import { useAtom } from "jotai";
import { selectedExpenseAtom } from "#app/atoms/expenses.ts";

function ExpenseList() {
  const [selectedId, setSelectedId] = useAtom(selectedExpenseAtom);
  // ...
}
```

#### Data Layer - TanStack Query + DB

**Collections** (`lib/collections/`):

```typescript
// lib/collections/expense.ts
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

export const SelectExpenseSchema = z.object({
  id: z.uuidv7(),
  title: z.string(),
  amount: z.coerce.number(), // Coerces string to number
  currency: CurrencySchema,
  date: IsoDateSchema,
  wallet_id: z.uuidv7(),
  category_id: z.uuidv7(),
  // ...
});

export const expenseCollection = (workspaceId: string) => {
  return createCollection(
    electricCollectionOptions({
      getKey: (item) => item.id,
      schema: SelectExpenseSchema,
      shapeOptions: {
        url: `${import.meta.env.PUBLIC_API_URL}/sync`,
        params: {
          table: "expense",
          where: "workspace_id = $1",
          params: [workspaceId],
        },
        fetchClient: (req, init) =>
          fetch(req, { ...init, credentials: "include" }),
      },
    })
  );
};
```

**Live Queries** (`hooks/use-db.ts`):

```typescript
import { useLiveQuery, eq } from "@tanstack/react-db";
import { datetime } from "@hoalu/common/datetime";
import { monetary } from "@hoalu/common/monetary";

export function useExpenseLiveQuery() {
  const workspace = useWorkspace();

  // Query with joins
  const { data: expenses } = useLiveQuery((q) =>
    q
      .from({ expense: expenseCollection(workspace.id) })
      .innerJoin(
        { wallet: walletCollection(workspace.id) },
        ({ expense, wallet }) => eq(expense.wallet_id, wallet.id)
      )
      .leftJoin(
        { category: categoryCollection(workspace.id) },
        ({ expense, category }) => eq(expense.category_id, category.id)
      )
      .orderBy(({ expense }) => expense.date, "desc")
      .select(({ expense, wallet, category }) => ({
        ...expense,
        category: {
          id: category?.id,
          name: category?.name,
          description: category?.description,
          color: category?.color,
        },
        wallet: {
          id: wallet.id,
          name: wallet.name,
          description: wallet.description,
          currency: wallet.currency,
          type: wallet.type,
          isActive: wallet.is_active,
        },
      }))
  );

  // Transform for presentation layer
  return useMemo(() => {
    if (!expenses) return [];

    return expenses.map((expense) => ({
      ...expense,
      date: datetime.format(expense.date, "yyyy-MM-dd"),
      amount: monetary.fromRealAmount(Number(expense.amount), expense.currency),
      realAmount: Number(expense.amount),
      convertedAmount: Number(expense.amount),
    }));
  }, [expenses]);
}

export type ExpensesClient = ReturnType<typeof useExpenseLiveQuery>;
export type ExpenseClient = ExpensesClient[number];
```

**Query Options** (`services/query-options.ts`):

```typescript
import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "#app/lib/api-client.ts";

export const getExpensesQueryOptions = (workspaceId: string) =>
  queryOptions({
    queryKey: ["expenses", workspaceId],
    queryFn: async () => {
      const res = await apiClient.api.expenses.$get({
        query: { workspaceId },
      });
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const { data } = await res.json();
      return data;
    },
  });
```

**Mutations** (`services/mutations.ts`):

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "#app/lib/api-client.ts";

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ExpensePostSchema) => {
      const res = await apiClient.api.expenses.$post({ json: data });
      if (!res.ok) throw new Error("Failed to create expense");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["expenses", variables.workspaceId],
      });
    },
  });
}
```

#### Routing with TanStack Router

**File-based Routes:**

```
routes/
├── _auth/               # Auth layout
│   ├── login.tsx
│   ├── register.tsx
│   └── route.tsx        # Auth layout wrapper
│
├── _dashboard/          # Dashboard layout
│   ├── $slug/           # Workspace routes
│   │   ├── expenses.tsx
│   │   ├── categories.tsx
│   │   ├── wallets.tsx
│   │   └── settings/
│   │       ├── general.tsx
│   │       ├── members.tsx
│   │       └── billing.tsx
│   ├── account/         # User account
│   │   ├── preferences.tsx
│   │   └── tokens.tsx
│   ├── index.tsx        # Workspace list
│   └── route.tsx        # Dashboard layout
│
└── index.tsx            # Home/landing
```

**Route Protection:**

```typescript
// routes/_dashboard/route.tsx
export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async ({ context }) => {
    const { session } = await context.auth.getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
});
```

### Real-time Synchronization

#### Electric SQL Architecture

**Flow:**

```
PostgreSQL (WAL)
  → Electric SQL Sync Engine (port 4000)
  → API Sync Proxy (/sync endpoint with auth)
  → PGlite in Browser (offline storage)
  → TanStack DB Collections (reactive queries)
  → React Components
```

**Sync Proxy** (`apps/api/src/modules/sync.ts`):

```typescript
import { createHonoApp } from "@hoalu/furnace";

const app = createHonoApp();

app.all("/sync/*", async (c) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Proxy to Electric with authentication
  const syncUrl = new URL(`${env.SYNC_URL}${c.req.path}`);
  return fetch(syncUrl, {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: c.req.raw.body,
  });
});
```

**PGlite Provider** (`components/providers/local-postgres-provider.tsx`):

```typescript
import { PGliteProvider } from "@electric-sql/pglite-react"
import { electricSync } from "@electric-sql/pglite-sync"

export function LocalPostgresProvider({ children }) {
  const db = usePGlite({
    dataDir: "idb://hoalu-db",
    extensions: { electric: electricSync() },
  })

  return <PGliteProvider db={db}>{children}</PGliteProvider>
}
```

**Collection Sync:**

```typescript
// Collections automatically sync via Electric shapes
const expenseCollection = createCollection(
  electricCollectionOptions({
    shapeOptions: {
      url: `${API_URL}/sync`, // Proxied to Electric
      params: {
        table: "expense",
        where: "workspace_id = $1",
        params: [workspaceId],
      },
    },
    schema: SelectExpenseSchema,
  })
);

// Live queries subscribe to changes
const { data } = useLiveQuery((q) =>
  q.from({ expense: expenseCollection(workspaceId) })
);
// Data updates automatically when DB changes!
```

### Authentication & Authorization

#### Better Auth Setup

**Server** (`apps/api/src/lib/auth.ts`):

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { workspacePlugin } from "@hoalu/auth/plugins/workspace";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    workspacePlugin({
      // Custom workspace management
      createWorkspaceOnSignup: true,
      roleHierarchy: ["owner", "admin", "member"],
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
});
```

**Client** (`apps/app/src/lib/auth-client.ts`):

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_API_URL,
});

export const { useSession, signIn, signOut } = authClient;
```

**Middleware** (`apps/api/src/middlewares/workspace-member.ts`):

```typescript
export const workspaceMember = createMiddleware(async (c, next) => {
  const session = c.var.session;
  const { workspaceId } = c.var.workspace;

  const member = await db
    .select()
    .from(memberTable)
    .where(
      and(
        eq(memberTable.workspaceId, workspaceId),
        eq(memberTable.userId, session.userId)
      )
    )
    .limit(1);

  if (!member.length) {
    return c.json({ error: "Not a workspace member" }, 403);
  }

  c.set("member", member[0]);
  await next();
});
```

#### Workspace Management

**Multi-tenancy Pattern:**

- All data scoped by `workspace_id` foreign key
- Slug-based routing: `/dashboard/:slug/expenses`
- Member roles: `owner`, `admin`, `member`
- Invitation system with expiration

**Workspace Context:**

```typescript
// hooks/use-workspace.ts
export function useWorkspace() {
  const params = Route.useParams(); // TanStack Router
  const { data: workspace } = useSuspenseQuery(
    getWorkspaceQueryOptions(params.slug)
  );
  return workspace;
}
```

### Database Schema

#### Schema Overview (`apps/api/src/db/schema.ts`)

**Auth Tables (Better Auth):**

- `user` - User accounts with public IDs
- `session` - Active sessions
- `account` - OAuth provider accounts
- `verification` - Email verification tokens
- `jwks` - JSON Web Key Set

**Workspace Tables:**

- `workspace` - Multi-tenant workspaces
- `member` - Workspace membership with roles
- `invitation` - Pending workspace invitations
- `apikey` - API keys for programmatic access

**Core Tables:**

- `category` - Expense categories (name, color, workspace)
- `wallet` - Wallets/accounts (name, type, currency, workspace)
- `expense` - Expenses (amount, date, category, wallet, workspace)
- `file` - File attachments (S3 storage)
- `task` - Task management (title, status, priority, workspace)
- `fx_rate` - Exchange rates (from/to currency, rate, valid dates)

**Enums:**

```typescript
export const colorTypeEnum = pgEnum("color_enum", [
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "purple",
  "pink",
]);

export const walletTypeEnum = pgEnum("wallet_type_enum", [
  "cash",
  "bank",
  "credit_card",
  "digital_wallet",
  "investment",
]);

export const repeatEnum = pgEnum("repeat_enum", [
  "none",
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);

export const taskStatusEnum = pgEnum("task_status_enum", [
  "todo",
  "in_progress",
  "done",
  "cancelled",
]);

export const priorityEnum = pgEnum("priority_enum", [
  "low",
  "medium",
  "high",
  "urgent",
]);
```

**Key Patterns:**

```typescript
// UUID primary keys
id: uuid("id").primaryKey();

// Public IDs for external references
publicId: text("public_id").notNull().unique();

// Workspace scoping
workspaceId: uuid("workspace_id")
  .notNull()
  .references(() => workspace.id, { onDelete: "cascade" });

// Timestamps
createdAt: timestamp("created_at").notNull();
updatedAt: timestamp("updated_at").notNull();

// JSONB for flexible metadata
metadata: jsonb("metadata").$type<Record<string, any>>().default({});

// Numeric for precise decimals
amount: numeric("amount", { precision: 18, scale: 2 }).notNull();

// Full-text search indexes
index("expense_title_idx").using(
  "gin",
  sql`to_tsvector('english', ${expense.title})`
);

// GIN indexes for JSONB
index("workspace_metadata_idx").using("gin", table.metadata);
```

#### Example Schema Definition

```typescript
export const expense = pgTable(
  "expense",
  {
    id: uuid("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    date: date("date", { mode: "string" }).notNull(),
    repeat: repeatEnum().default("none").notNull(),

    // Foreign keys
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => wallet.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => user.id),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("expense_workspace_id_idx").on(table.workspaceId),
    index("expense_date_idx").on(table.date),
    index("expense_wallet_id_idx").on(table.walletId),
    index("expense_category_id_idx").on(table.categoryId),
    index("expense_title_search_idx").using(
      "gin",
      sql`to_tsvector('english', ${table.title})`
    ),
  ]
);
```

## Code Conventions

### Import Organization (Biome)

```typescript
// 1. Node/Bun built-in modules
import { readFile } from "node:fs/promises";
import path from "node:path";

// 2. External npm packages (alphabetical)
import { queryOptions } from "@tanstack/react-query";
import { eq, desc } from "drizzle-orm";
import { hc } from "hono/client";
import * as z from "zod";

// 3. @hoalu workspace packages (alphabetical)
import { datetime } from "@hoalu/common/datetime";
import { HTTPStatus } from "@hoalu/common/http-status";
import { monetary } from "@hoalu/common/monetary";
import { CurrencySchema } from "@hoalu/common/schema";

// 4. Local imports using path alias (alphabetical)
import { apiClient } from "#app/lib/api-client.ts";
import { useAuth } from "#app/hooks/use-auth.ts";
import { ExpenseFormSchema } from "#app/lib/schema.ts";

// 5. Relative imports (if necessary)
import { getExpenseById } from "./repository.ts";
```

### Path Aliases

**Apps use `#app/*` and `#api/*`:**

```json
// apps/app/package.json
{
  "imports": {
    "#app/*": "./src/*"
  }
}

// apps/api/package.json
{
  "imports": {
    "#api/*": "./src/*"
  }
}
```

**Packages use `#<package-name>/*`:**

```json
// packages/common/package.json
{
  "imports": {
    "#common/*": "./src/*"
  }
}
```

### TypeScript Conventions

**Function Components:**

```typescript
import type { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  variant?: "primary" | "secondary"
  onClick?: () => void
}

export function Button({ children, variant = "primary", onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className={cn("btn", `btn-${variant}`)}>
      {children}
    </button>
  )
}
```

**Custom Hooks:**

```typescript
export function useExpenses(workspaceId: string) {
  const { data, isLoading, error } = useQuery(
    getExpensesQueryOptions(workspaceId)
  );

  return { expenses: data ?? [], isLoading, error };
}
```

**Type Inference from Functions:**

```typescript
export function useExpenseLiveQuery() {
  // ... implementation
}

// Export inferred types
export type ExpensesClient = ReturnType<typeof useExpenseLiveQuery>;
export type ExpenseClient = ExpensesClient[number];
```

**Zod Schema Patterns:**

```typescript
// Define schema
export const ExpenseFormSchema = z.object({
  title: z.string().min(1),
  amount: z.coerce.number(), // Coerce string to number
  currency: CurrencySchema,
  date: z.iso.datetime(),
  walletId: z.uuidv7(),
  categoryId: z.uuidv7(),
  repeat: RepeatSchema,
});

// Infer TypeScript type
export type ExpenseFormSchema = z.infer<typeof ExpenseFormSchema>;

// Partial for updates
export const UpdateExpenseSchema = ExpenseFormSchema.partial();
```

**Hono RPC Client Types:**

```typescript
import type { InferRequestType, InferResponseType } from "hono/client";
import type { honoClient } from "#app/lib/api-client.ts";

// Infer response type
export type ExpenseSchema = InferResponseType<
  typeof honoClient.api.expenses.$get,
  200
>["data"][number];

// Infer request type
export type ExpensePostSchema = InferRequestType<
  typeof honoClient.api.expenses.$post
>["json"];
```

### Component Patterns

**Early Returns for Loading/Error States:**

```typescript
export function ExpenseList() {
  const expenses = useExpenseLiveQuery()

  if (!expenses.length) {
    return <EmptyState message="No expenses found" />
  }

  return (
    <div>
      {expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} />
      ))}
    </div>
  )
}
```

**Compound Components:**

```typescript
export function ExpenseDetails({ expense }: { expense: ExpenseClient }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{expense.title}</CardTitle>
        <CardDescription>{expense.category?.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <CurrencyValue
          value={expense.amount}
          currency={expense.currency}
        />
      </CardContent>
      <CardFooter>
        <ExpenseActions expenseId={expense.id} />
      </CardFooter>
    </Card>
  )
}
```

### API Patterns

**Repository Functions:**

```typescript
// Always return typed results
export async function findMany(workspaceId: string): Promise<Expense[]> {
  return db
    .select()
    .from(expense)
    .where(eq(expense.workspaceId, workspaceId))
    .orderBy(desc(expense.date));
}

// Use transactions for multi-step operations
export async function createExpenseWithFiles(
  data: InsertExpense,
  files: File[]
) {
  return db.transaction(async (tx) => {
    const [expense] = await tx.insert(expenseTable).values(data).returning();

    if (files.length > 0) {
      await tx
        .insert(fileTable)
        .values(files.map((f) => ({ ...f, expenseId: expense.id })));
    }

    return expense;
  });
}
```

**Error Handling:**

```typescript
import { HTTPException } from "hono/http-exception";
import { HTTPStatus } from "@hoalu/common/http-status";

app.get("/expenses/:id", async (c) => {
  const expense = await repository.findById(c.req.param("id"));

  if (!expense) {
    throw new HTTPException(HTTPStatus.NOT_FOUND, {
      message: "Expense not found",
    });
  }

  return c.json({ data: expense });
});
```

**OpenAPI Documentation:**

```typescript
app.openapi(
  createRoute({
    method: "get",
    path: "/expenses",
    tags: ["expenses"],
    summary: "List expenses",
    request: {
      query: z.object({
        workspaceId: z.uuidv7(),
        limit: z.coerce.number().optional(),
      }),
    },
    responses: {
      200: {
        description: "List of expenses",
        content: {
          "application/json": {
            schema: z.object({
              data: z.array(ExpenseSchema),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    // Handler implementation
  }
);
```

## Environment Configuration

### Environment Variables

**API (`apps/api/.env`):**

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=hoalu

# Electric SQL
SYNC_URL=http://localhost:4000
SYNC_SECRET=your-sync-secret

# Better Auth
BETTER_AUTH_SECRET=your-auth-secret
BETTER_AUTH_URL=http://localhost:3000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# S3 (optional)
S3_ENDPOINT=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=

# Email (optional)
EMAIL_FROM=noreply@hoalu.app
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

**App (`apps/app/.env`):**

```bash
# API URL (via Caddy proxy)
PUBLIC_API_URL=http://api.hoalu.localhost

# App URL (via Caddy proxy)
PUBLIC_APP_BASE_URL=http://hoalu.localhost
```

**Note:** When using Caddy reverse proxy:

- Frontend runs on `localhost:5173` internally, served via Caddy at `hoalu.localhost`
- API runs on `localhost:3000` internally, served via Caddy at `api.hoalu.localhost`
- All browser requests go through Caddy for compression and optional HTTPS
- `.localhost` domains work natively without `/etc/hosts` modification

For HTTPS setup, change URLs to `https://hoalu.localhost` and `https://api.hoalu.localhost`

### Docker Services

**Infrastructure Stack:**

```yaml
# docker-compose.local.yml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: hoalu
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    command:
      - -c
      - wal_level=logical # Required for Electric SQL
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  electric:
    image: electricsql/electric:latest
    environment:
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/hoalu
      ELECTRIC_WRITE_TO_PG_MODE: logical_replication
      AUTH_MODE: secure
      AUTH_JWT_SECRET: ${SYNC_SECRET}
    ports:
      - "4000:4000"
    depends_on:
      - postgres
```

**Start Services:**

```bash
cd deployments
docker compose -f docker-compose.local.yml up -d
```

## Development Tips

### Working with the Monorepo

**Workspace References:**

```json
// Use workspace:* for internal packages
{
  "dependencies": {
    "@hoalu/common": "workspace:*",
    "@hoalu/ui": "workspace:*"
  }
}
```

**Shared Catalog:**

```json
// Root package.json - DRY for common versions
{
  "workspaces": {
    "catalog": {
      "react": "^19.2.0",
      "react-dom": "^19.2.0",
      "zod": "^4.1.12",
      "hono": "^4.10.4",
      "better-auth": "^1.3.34",
      "tailwindcss": "^4.1.16"
    }
  }
}

// Package references catalog
{
  "dependencies": {
    "react": "catalog:",
    "zod": "catalog:"
  }
}
```

**Turbo Build Pipeline:**

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"], // Build dependencies first
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Database Development

**Schema-First Workflow:**

1. Update `apps/api/src/db/schema.ts`
2. Generate migration: `bun run db:generate`
3. Review SQL in `apps/api/migrations/`
4. Apply migration: `bun run db:migrate`
5. Electric SQL picks up changes automatically

**Drizzle Query Patterns:**

```typescript
// Select with joins
const expensesWithWallet = await db
  .select({
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    walletName: wallet.name,
  })
  .from(expense)
  .innerJoin(wallet, eq(expense.walletId, wallet.id));

// Aggregation
const totalByCategory = await db
  .select({
    categoryId: expense.categoryId,
    total: sum(expense.amount),
  })
  .from(expense)
  .groupBy(expense.categoryId);

// Subqueries
const recentExpenses = db
  .select()
  .from(expense)
  .where(gt(expense.date, sql`NOW() - INTERVAL '30 days'`))
  .as("recent");

// Full-text search
const results = await db
  .select()
  .from(expense)
  .where(
    sql`to_tsvector('english', ${expense.title}) @@ plainto_tsquery('english', ${searchTerm})`
  );
```

### Frontend Development

**Hot Module Replacement:**

- Vite HMR with Fast Refresh
- Component updates without losing state
- CSS updates without page reload

**DevTools:**

```typescript
// Enable all DevTools in development
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { TanStackFormDevtools } from "@tanstack/react-form-devtools"

function App() {
  return (
    <>
      {/* App content */}
      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools />
          <TanStackRouterDevtools />
        </>
      )}
    </>
  )
}
```

**Performance Optimization:**

```typescript
// Virtualized lists for large datasets
import { useVirtualizer } from "@tanstack/react-virtual"

function ExpenseList({ expenses }: { expenses: ExpenseClient[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: expenses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 78, // Estimate row height
    overscan: 5, // Render 5 extra items
  })

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <ExpenseItem
            key={expenses[virtualRow.index].id}
            expense={expenses[virtualRow.index]}
            style={{
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

**Optimistic Updates:**

```typescript
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.api.expenses[":id"].$delete({ param: { id } });
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["expenses"] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(["expenses"]);

      // Optimistically update
      queryClient.setQueryData<ExpenseSchema[]>(["expenses"], (old) =>
        old?.filter((e) => e.id !== id)
      );

      return { previous };
    },
    onError: (err, id, context) => {
      // Rollback on error
      queryClient.setQueryData(["expenses"], context?.previous);
    },
  });
}
```

### Testing & Quality

**Biome Configuration:**

```json
// biome.json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

**TypeScript Strict Mode:**
All packages use strict TypeScript:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

**Naming Conventions:**

- Components: `PascalCase` (ExpenseList.tsx)
- Hooks: `camelCase` with `use` prefix (useExpenses.ts)
- Utilities: `camelCase` (formatCurrency.ts)
- Types: `PascalCase` with Schema suffix (ExpenseFormSchema)
- Constants: `UPPER_SNAKE_CASE` (PG_ENUM_COLOR)
- Files: `kebab-case` or `PascalCase` for components

## Common Debugging

### Sync Issues

**Electric SQL Health Check:**

```bash
# Check Electric service
curl http://localhost:4000/health

# Verify WAL level
psql -h localhost -U postgres -d hoalu -c "SHOW wal_level;"
# Should return: logical
```

**Browser DevTools:**

```typescript
// Monitor shape subscriptions
window.addEventListener("electric:shape-sync", (e) => {
  console.log("Shape synced:", e.detail);
});

// Check PGlite database
const db = window.__pglite__;
await db.query("SELECT * FROM expense LIMIT 5");
```

**Common Issues:**

1. **Shape not updating**: Check `SYNC_SECRET` matches between API and Electric
2. **Auth errors**: Verify `fetchClient` includes credentials
3. **Stale data**: Clear PGlite IndexedDB: `indexedDB.deleteDatabase("idb://hoalu-db")`

### Database Issues

**Migration Troubleshooting:**

```bash
# Check migration status
cd apps/api
bun run drizzle-kit push

# Reset database (DANGER - deletes all data)
dropdb hoalu && createdb hoalu
bun run db:migrate
```

**Connection Pool:**

```typescript
// apps/api/src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, {
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client);
```

### Authentication Issues

**Session Debugging:**

```typescript
// Check session in API route
app.get("/debug/session", async (c) => {
  const session = await getSession(c);
  return c.json({ session, userId: session?.userId });
});
```

**Cookie Issues:**

```typescript
// Ensure credentials included in fetch
const res = await fetch("/api/expenses", {
  credentials: "include", // Required for cookies
});

// Check cookie settings
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Credentials", "true");
  await next();
});
```

**Workspace Permissions:**

```typescript
// Verify member role
const member = await db.query.member.findFirst({
  where: and(
    eq(memberTable.workspaceId, workspaceId),
    eq(memberTable.userId, session.userId)
  ),
});

console.log("User role:", member?.role);
```

## Key Files Reference

**Configuration:**

- `/package.json` - Root workspace config
- `/turbo.json` - Turborepo pipeline
- `/biome.json` - Linting and formatting
- `/Caddyfile` - Reverse proxy configuration
- `/deployments/docker-compose.local.yml` - Local infrastructure

**API:**

- `/apps/api/src/app.ts` - Hono app setup
- `/apps/api/src/db/schema.ts` - Database schema (346 lines)
- `/apps/api/src/lib/auth.ts` - Better Auth configuration
- `/apps/api/src/modules/sync.ts` - Electric SQL proxy

**App:**

- `/apps/app/src/main.tsx` - React entry point
- `/apps/app/src/lib/api-client.ts` - Hono RPC client (8105 lines)
- `/apps/app/src/lib/schema.ts` - Frontend types (3127 lines)
- `/apps/app/src/hooks/use-db.ts` - Live query hooks
- `/apps/app/src/services/query-options.ts` - TanStack Query configs
- `/apps/app/src/services/mutations.ts` - Mutation configs

**Shared:**

- `/packages/common/src/schema.ts` - Shared Zod schemas
- `/packages/common/src/enums.ts` - Shared enum constants
- `/packages/common/src/datetime.ts` - Date utilities
- `/packages/common/src/monetary.ts` - Currency utilities

## Additional Notes

### Zod v4 Coercion

**`z.coerce.number()`** - Automatically converts string inputs to numbers:

```typescript
const schema = z.object({
  amount: z.coerce.number(), // "123" → 123
  quantity: z.coerce.number().int(), // "5" → 5
});

schema.parse({ amount: "123.45", quantity: "5" });
// → { amount: 123.45, quantity: 5 }
```

**Why it's used:**

- Electric SQL sends numeric values as strings for precision
- Zod coerces them back to JavaScript numbers
- Maintains type safety throughout the pipeline

### Import Paths

Always use the configured path aliases:

- ✅ `import { useAuth } from "#app/hooks/use-auth.ts"`
- ❌ `import { useAuth } from "../../hooks/use-auth.ts"`

### File Extensions

Always include `.ts` or `.tsx` extensions in imports:

- ✅ `import { schema } from "./schema.ts"`
- ❌ `import { schema } from "./schema"`

This is required for Bun and improves IDE support.
