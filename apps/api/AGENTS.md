---
AI_CONTEXT: true
VERSION: 0.20.0
LAST_UPDATED: 2026-01-24
TECH_STACK: Bun, React 19, Hono, PostgreSQL 17, Electric SQL, TanStack ecosystem
---

# AGENTS.md

Hoalu backend api.

## Tech Stack

- **Framework**: Hono v4.10+ (lightweight web framework)
- **Runtime**: Bun (Node.js alternative)
- **Database**: PostgreSQL 17 with Drizzle ORM v0.44+
- **Authentication**: Better Auth v1.4+ with custom workspace plugin
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

## Infrastructure

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

## Component Registry

- **Path Alias**: `#api/*` maps to `./src/*`
- **Build**: Bun bundler for production, TypeScript for type definitions
- **Main Entry**: `src/index.ts`
- **Key Files**:
  - `src/app.ts` - Hono app configuration
  - `src/db/schema.ts` - Drizzle database schema (346 lines)
  - `src/db/index.ts` - Database connection
  - `src/lib/auth.ts` - Better Auth setup
  - `src/modules/sync.ts` - Electric SQL sync proxy

### API Routes (`apps/api/src/routes/`)

| Resource           | Files                              | Endpoints                                        | Repository Methods                                    |
| ------------------ | ---------------------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| **categories**     | index.ts, repository.ts, schema.ts | GET /, GET /:id, POST /, PATCH /:id, DELETE /:id | findAllByWorkspaceId, findOne, insert, update, delete |
| **expenses**       | index.ts, repository.ts, schema.ts | GET /, GET /:id, POST /, PATCH /:id, DELETE /:id | findAllByWorkspaceId, findOne, insert, update, delete |
| **wallets**        | index.ts, repository.ts, schema.ts | GET /, GET /:id, POST /, PATCH /:id, DELETE /:id | findAllByWorkspaceId, findOne, insert, update, delete |
| **tasks**          | index.ts, repository.ts, schema.ts | GET /, GET /:id, POST /, PATCH /:id, DELETE /:id | findAllByWorkspaceId, findOne, insert, update, delete |
| **files**          | index.ts, repository.ts, schema.ts | GET /, POST /, DELETE /:id                       | findAllByWorkspaceId, upload, delete                  |
| **exchange-rates** | index.ts, repository.ts, schema.ts | GET /, POST /                                    | findAll, insertMany                                   |

## Architecture Patterns

API Routes Structure (`apps/api/src/routes/`)

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

## Patterns

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
export async function createExpenseWithFiles(data: InsertExpense, files: File[]) {
	return db.transaction(async (tx) => {
		const [expense] = await tx.insert(expenseTable).values(data).returning();

		if (files.length > 0) {
			await tx.insert(fileTable).values(files.map((f) => ({ ...f, expenseId: expense.id })));
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
	},
);
```

## Task Templates

### Template: Add New API Route

Use this template when adding a new resource endpoint (e.g., notes, tags, budgets).

**Steps:**

1. **Create route folder**: `apps/api/src/routes/[resource]/`

2. **Create three files** following the standard pattern:

   **File 1: `index.ts`** - HTTP handlers with OpenAPI docs

   ```typescript
   import { HTTPException } from "hono/http-exception";
   import { describeRoute } from "hono-openapi";
   import * as z from "zod";

   import { generateId } from "@hoalu/common/generate-id";
   import { HTTPStatus } from "@hoalu/common/http-status";
   import { OpenAPI } from "@hoalu/furnace";

   import { createHonoInstance } from "#api/lib/create-app.ts";
   import { workspaceMember } from "#api/middlewares/workspace-member.ts";
   import { [Resource]Repository } from "#api/routes/[resource]/repository.ts";
   import { Insert[Resource]Schema, [Resource]Schema } from "#api/routes/[resource]/schema.ts";
   import { idParamValidator } from "#api/validators/id-param.ts";
   import { jsonBodyValidator } from "#api/validators/json-body.ts";
   import { workspaceQueryValidator } from "#api/validators/workspace-query.ts";

   const app = createHonoInstance();
   const repository = new [Resource]Repository();
   const TAGS = ["[Resource]s"];

   // GET /api/[resource]s
   const route = app.get(
     "/",
     describeRoute({ tags: TAGS, summary: "Get all [resource]s" }),
     workspaceQueryValidator,
     workspaceMember,
     async (c) => {
       const workspace = c.get("workspace");
       const data = await repository.findAllByWorkspaceId({ workspaceId: workspace.id });
       return c.json({ data }, HTTPStatus.codes.OK);
     }
   );

   // POST /api/[resource]s
   // PATCH /api/[resource]s/:id
   // DELETE /api/[resource]s/:id
   // ... add other CRUD operations

   export default route;
   ```

   **File 2: `repository.ts`** - Database operations

   ```typescript
   import { and, desc, eq } from "drizzle-orm";

   import { db, schema } from "#api/db/index.ts";

   type New[Resource] = typeof schema.[resource].$inferInsert;

   export class [Resource]Repository {
     async findAllByWorkspaceId(param: { workspaceId: string }) {
       return db
         .select()
         .from(schema.[resource])
         .where(eq(schema.[resource].workspaceId, param.workspaceId))
         .orderBy(desc(schema.[resource].createdAt));
     }

     async findOne(param: { id: string; workspaceId: string }) {
       const [result] = await db
         .select()
         .from(schema.[resource])
         .where(
           and(
             eq(schema.[resource].id, param.id),
             eq(schema.[resource].workspaceId, param.workspaceId)
           )
         );
       return result || null;
     }

     async insert(param: New[Resource]) {
       try {
         const [result] = await db.insert(schema.[resource]).values(param).returning();
         return result;
       } catch (_error) {
         return null;
       }
     }

     async update<T>(param: { id: string; workspaceId: string; payload: T }) {
       try {
         const [result] = await db
           .update(schema.[resource])
           .set({ ...param.payload, updatedAt: new Date() })
           .where(
             and(
               eq(schema.[resource].id, param.id),
               eq(schema.[resource].workspaceId, param.workspaceId)
             )
           )
           .returning();
         return result || null;
       } catch (_error) {
         return null;
       }
     }

     async delete(param: { id: string; workspaceId: string }) {
       await db
         .delete(schema.[resource])
         .where(
           and(
             eq(schema.[resource].id, param.id),
             eq(schema.[resource].workspaceId, param.workspaceId)
           )
         );
       return { id: param.id };
     }
   }
   ```

   **File 3: `schema.ts`** - Zod validation schemas

   ```typescript
   import * as z from "zod";

   export const Insert[Resource]Schema = z.object({
     title: z.string().min(1),
     description: z.string().optional(),
     workspaceId: z.uuidv7(),
     // Add other fields
   });

   export const Update[Resource]Schema = Insert[Resource]Schema.partial();

   export const [Resource]Schema = z.object({
     id: z.uuidv7(),
     title: z.string(),
     description: z.string().nullable(),
     workspaceId: z.uuidv7(),
     createdAt: z.string(),
     updatedAt: z.string(),
   });

   export const [Resource]sSchema = z.array([Resource]Schema);

   export const Delete[Resource]Schema = z.object({
     id: z.uuidv7(),
   });
   ```

3. **Add table to database schema**: `apps/api/src/db/schema.ts`

   ```typescript
   export const [resource] = pgTable(
   	"[resource]",
   	{
   		id: uuid("id").primaryKey(),
   		title: text("title").notNull(),
   		description: text("description"),
   		workspaceId: uuid("workspace_id")
   			.notNull()
   			.references(() => workspace.id, { onDelete: "cascade" }),
   		createdAt: timestamp("created_at").defaultNow().notNull(),
   		updatedAt: timestamp("updated_at").defaultNow().notNull(),
   	},
   	(table) => [index("[resource]_workspace_id_idx").on(table.workspaceId)],
   );
   ```

4. **Generate and apply migration**:

   ```bash
   cd apps/api
   bun run db:generate  # Creates migration file
   bun run db:migrate   # Applies migration
   ```

5. **Register route in API module**: `apps/api/src/modules/api.ts`

   ```typescript
   import [resource]Route from "#api/routes/[resource]/index.ts";

   // In the module function:
   app.route("/api/[resource]s", [resource]Route);
   ```

6. **Test the endpoints**:

   ```bash
   # Start dev server
   bun run dev

   # Test API
   curl http://hoalu.localhost/api/[resource]s?workspaceId=xxx
   ```

**Example:** See `apps/api/src/routes/expenses/` for complete reference implementation.

### Template: Add Database Migration

Use this when modifying the database schema (adding columns, tables, indexes, etc.).

**Steps:**

1. **Modify schema**: Edit `apps/api/src/db/schema.ts`

   ```typescript
   // Example: Add a new column
   export const expense = pgTable("expense", {
   	// ... existing columns
   	tags: text("tags").array().default([]), // New column
   });
   ```

2. **Generate migration**:

   ```bash
   cd apps/api
   bun run db:generate
   # This creates a new file in apps/api/migrations/
   ```

3. **Review migration SQL**:
   - Check generated SQL in `apps/api/migrations/XXXX_*.sql`
   - Ensure it matches your intent
   - Add custom SQL if needed (e.g., data migrations)

4. **Apply migration**:

   ```bash
   bun run db:migrate
   ```

5. **Verify Electric SQL sync**:

   ```bash
   # Check Electric service
   curl http://localhost:4000/health

   # Restart Electric if needed
   bun run docker:down
   bun run docker:up
   ```

6. **Update frontend collection schema** if needed:
   ```typescript
   // apps/app/src/lib/collections/expense.ts
   export const SelectExpenseSchema = z.object({
   	// ... existing fields
   	tags: z.array(z.string()).default([]), // Add new field
   });
   ```

## Database Development

Database Schema `apps/api/src/db/schema.ts`

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

export const repeatEnum = pgEnum("repeat_enum", ["none", "daily", "weekly", "monthly", "yearly"]);

export const taskStatusEnum = pgEnum("task_status_enum", [
	"todo",
	"in_progress",
	"done",
	"cancelled",
]);

export const priorityEnum = pgEnum("priority_enum", ["low", "medium", "high", "urgent"]);
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
index("expense_title_idx").using("gin", sql`to_tsvector('english', ${expense.title})`);

// GIN indexes for JSONB
index("workspace_metadata_idx").using("gin", table.metadata);
```

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
		sql`to_tsvector('english', ${expense.title}) @@ plainto_tsquery('english', ${searchTerm})`,
	);
```
