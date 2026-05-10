---
AI_CONTEXT: true
LAST_UPDATED: 2026-05-10
TECH_STACK: Bun 1.3.9, React 19, Hono, PostgreSQL 17, Electric SQL, TanStack ecosystem
---

# AGENTS.md

Hoalu backend api.

## Tech Stack

- **Framework**: Hono v4.12+ (lightweight web framework)
- **Runtime**: Bun (1.3.9)
- **Database**: PostgreSQL 17 with Drizzle ORM
- **Authentication**: Better Auth v1.6+ with custom workspace & public-id plugins
- **Validation**:
  - Zod v4 for schema validation
  - `hono-openapi` for OpenAPI generation with `describeRoute`
  - Custom validators: `jsonBodyValidator`, `workspaceQueryValidator`, `idParamValidator`
- **API Documentation**: Scalar via `@scalar/hono-api-reference`
- **Email**:
  - React Email for templates (`@hoalu/email`)
  - Nodemailer v7 for sending
  - `@react-email/render` for HTML generation
- **Storage**:
  - Redis (ioredis) for caching, rate limiting, and sessions
  - PostgreSQL (pg) as primary database
  - S3-compatible storage (via `s3.ts` lib)
- **Schema Management**: Drizzle Kit for migrations
- **AI Features**: OpenRouter integration (`lib/openrouter.ts`), receipt OCR (`lib/ocr.ts`), parse-with-ai (`lib/parse-with-ai.ts`)
- **Testing**: N/A (no test framework configured yet)

## Infrastructure

- **Build System**: Turborepo with Bun workspaces
- **Database**:
  - PostgreSQL 17 with logical replication (WAL level)
  - Drizzle ORM with migration-first workflow
  - Migrations at `apps/api/migrations/` (13 migrations as of May 2026)
- **Real-time Sync**: Electric SQL sync engine on port 4000 (`modules/sync.ts`)
- **Caching**: Redis for rate limiting, sessions, and temporary data
- **Reverse Proxy**: Caddy v2+ for development proxy server
  - Automatic HTTPS with self-signed certificates for localhost
  - HTTP/2 and HTTP/3 support enabled by default on HTTPS connections
  - Gzip compression for all responses
- **Containerization**: Docker Compose files in `deployments/`
  - `docker-compose.local.yml` - Local development
  - `docker-compose.infra.yml` - Infrastructure services
  - `docker-compose.platform.yml` - Platform deployment

## Component Registry

- **Path Alias**: `#api/*` maps to `./src/*`
- **Build**: `bun build ./src/index.ts --outdir ./dist --target bun --production` + `bun tsc -p tsconfig.build.json` for types
- **Main Entry**: `src/index.ts`
- **Key Files**:
  - `src/lib/create-app.ts` - `createHonoInstance()` and `createApp()` factory functions
  - `src/db/schema.ts` - Drizzle database schema (480 lines)
  - `src/db/index.ts` - Database connection
  - `src/lib/auth.ts` - Better Auth setup
  - `src/lib/email.ts` - Nodemailer email sending
  - `src/lib/redis.ts` - Redis client
  - `src/lib/s3.ts` - S3-compatible storage client
  - `src/lib/env.ts` - Environment variable validation
  - `src/modules/sync.ts` - Electric SQL sync proxy
  - `src/modules/api.ts` - OpenAPI docs route
  - `src/modules/auth.ts` - Auth route handler
  - `src/modules/health.ts` - Health check endpoint
  - `src/modules/openapi.ts` - OpenAPI spec generation

### API Routes (`apps/api/src/routes/`)

| Resource           | Files                              | Endpoints                                        | Repository Pattern                              |
| ------------------ | ---------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| **categories**     | index.ts, repository.ts, schema.ts | GET /, GET /:id, POST /, PATCH /:id, DELETE /:id | Class-based repository                          |
| **expenses**       | index.ts, repository.ts, schema.ts | GET /, GET /:id, POST /, PATCH /:id, DELETE /:id | Class-based repository                          |
| **events**         | index.ts, repository.ts, schema.ts | GET /, GET /:id, POST /, PATCH /:id, DELETE /:id | Class-based repository                          |
| **exchange-rates** | index.ts, repository.ts, schema.ts | GET /, POST /                                    | findAll, insertMany                             |
| **files**          | index.ts, repository.ts, schema.ts | GET /, POST /, DELETE /:id                       | findAllByWorkspaceId, upload, delete            |
| **incomes**        | index.ts, repository.ts, schema.ts | GET /, GET /:id, POST /, PATCH /:id, DELETE /:id | Class-based repository                          |
| **recurring-bills**| index.ts, repository.ts, schema.ts | GET /, GET /:id, POST /, PATCH /:id, DELETE /:id | Class-based repository                          |
| **tasks**          | index.ts, repository.ts, schema.ts | GET /, GET /:id, POST /, PATCH /:id, DELETE /:id | Class-based repository                          |
| **wallets**        | index.ts, repository.ts, schema.ts | GET /, GET /:id, POST /, PATCH /:id, DELETE /:id | Class-based repository                          |
| **workspaces**     | index.ts, repository.ts, schema.ts | GET /, PATCH /                                   | Workspace details, update                       |

## Architecture Patterns

### Route Structure

Each entity follows a consistent three-file pattern:

**1. `index.ts` - Route Handlers with OpenAPI**

```typescript
import { createHonoInstance } from "#api/lib/create-app.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import { workspaceQueryValidator } from "#api/validators/workspace-query.ts";
import * as schema from "./schema.ts";
import { ExpenseRepository } from "./repository.ts";

const app = createHonoInstance();
const repository = new ExpenseRepository();

app.get(
	"/",
	describeRoute({
		tags: ["Expenses"],
		summary: "Get all expenses",
		responses: {
			...OpenAPI.unauthorized(),
			...OpenAPI.response(z.object({ data: ExpensesSchema }), HTTPStatus.codes.OK),
		},
	}),
	workspaceQueryValidator,
	workspaceMember,
	async (c) => {
		const { workspaceId } = c.var.workspace;
		const expenses = await repository.findMany(workspaceId);
		return c.json({ data: expenses });
	},
);

export default app;
```

**2. `repository.ts` - Database Operations (Class-based)**

```typescript
import { db } from "#api/db/index.ts";
import { expense } from "#api/db/schema.ts";
import { eq, desc } from "drizzle-orm";

export class ExpenseRepository {
	async findMany(workspaceId: string) {
		return db
			.select()
			.from(expense)
			.where(eq(expense.workspaceId, workspaceId))
			.orderBy(desc(expense.date));
	}

	async create(data: InsertExpense) {
		return db.insert(expense).values(data).returning();
	}
}
```

**3. `schema.ts` - Zod Validation Schemas**

```typescript
import * as z from "zod";
import { CurrencySchema, RepeatSchema } from "@hoalu/common/schema";

export const InsertExpenseSchema = z.object({
	title: z.string().min(1),
	description: z.optional(z.string()),
	// ...
});

export const UpdateExpenseSchema = InsertExpenseSchema.partial();
```

### Middleware Flow

```
Request
  → [optional] userSession (populates c.get("user"), c.get("session"))
  → workspaceQueryValidator (validates ?workspaceIdOrSlug)
  → workspaceMember (finds workspace + membership, sets c.var)
  → handler (executes business logic)
  → response
```

### Validators

All custom validators live in `#api/validators/`:

| Validator                   | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `workspace-query.ts`        | Validates `?workspaceIdOrSlug` query param   |
| `id-param.ts`               | Validates `/:id` path param                  |
| `json-body.ts`              | Validates JSON request body against Zod      |
| `validator-wrapper.ts`      | Wrapper for standard-validate pattern        |

### Middlewares

| Middleware              | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `user-session.ts`       | Reads session from auth API, sets user + session ctx |
| `workspace-member.ts`   | Looks up workspace by slug/publicId, validates member|

### Auth Helpers from `@hoalu/furnace`

| Export          | Purpose                                           |
| --------------- | ------------------------------------------------- |
| `logger`        | Pino logger middleware (pretty in dev)             |
| `notFound`      | Global 404 handler                                 |
| `onError`       | Global error handler                               |
| `OpenAPI`       | Helper for OpenAPI responses (unauthorized, bad_request, not_found, server_parse_error, response) |

### Error Handling

```typescript
import { HTTPException } from "hono/http-exception";
import { HTTPStatus } from "@hoalu/common/http-status";

app.get("/expenses/:id", async (c) => {
	const expense = await repository.findById(c.req.param("id"));
	if (!expense) {
		throw new HTTPException(HTTPStatus.codes.NOT_FOUND, {
			message: "Expense not found",
		});
	}
	return c.json({ data: expense });
});
```

### OpenAPI Documentation (describeRoute pattern)

```typescript
import { describeRoute } from "hono-openapi";
import { OpenAPI } from "@hoalu/furnace";

app.get(
	"/",
	describeRoute({
		tags: ["Expenses"],
		summary: "List expenses",
		responses: {
			...OpenAPI.unauthorized(),
			...OpenAPI.bad_request(),
			...OpenAPI.server_parse_error(),
			...OpenAPI.response(z.object({ data: ExpensesSchema }), HTTPStatus.codes.OK),
		},
	}),
	// handler...
);
```

## Utility Modules

| Module / Lib            | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `lib/redis.ts`          | Redis client (ioredis)                           |
| `lib/email.ts`          | Nodemailer email transport                       |
| `lib/s3.ts`             | S3-compatible file storage                       |
| `lib/env.ts`            | Environment variable validation                  |
| `lib/ocr.ts`            | Receipt OCR parsing                              |
| `lib/openrouter.ts`     | OpenRouter API client for AI features            |
| `lib/parse-with-ai.ts`  | AI-powered expense parsing                       |
| `lib/electric.ts`       | Electric SQL client setup                        |

## Database

### Schema Overview

- Schema file: `apps/api/src/db/schema.ts` (480 lines)
- Migrations directory: `apps/api/migrations/`
- Commands:
  - `bun run db:generate` — generates migration from schema changes
  - `bun run db:migrate` — applies pending migrations
  - Auto-migrate is part of `dev` script (`bun db:migrate && bun --watch src/index.ts`)

### Enum Types (from `@hoalu/common/enums`)

| Enum              | Values                                                             |
| ----------------- | ------------------------------------------------------------------ |
| COLOR             | red, green, teal, blue, yellow, orange, purple, pink, gray, stone |
| WALLET_TYPE       | cash, bank-account, credit-card, debit-card, digital-account       |
| PRIORITY          | urgent, high, medium, low, none                                    |
| TASK_STATUS       | todo, in-progress, done, blocked, canceled                         |
| REPEAT            | one-time, daily, weekly, monthly, yearly, custom                   |
| CATEGORY_TYPE     | expense, income                                                    |
| EVENT_STATUS      | open, closed                                                       |
