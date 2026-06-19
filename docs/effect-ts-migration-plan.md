# Effect-TS Migration Plan for `apps/api/` — Full Hono Replacement (Effect v4)

## Strategy Overview

- **Replace Hono** with `@effect/platform-node` v4 — Effect `HttpRouter` for routing, `HttpServer` for serving, `HttpMiddleware` for middleware
- **Better Auth** stays — `auth.handler(Request)` returns `Response`, framework-agnostic at the handler level
- **Replace Zod → Effect Schema v4** — full migration for backend validation
- **Incremental roll-out** — each phase is independently shippable, no big-bang rewrite
- **Motivation**: typed errors, dependency injection via Layers, resource safety, structured concurrency, unified HTTP layer

## Dependencies

```json
{
	"dependencies": {
		"effect": "^4.0.0-beta.x",
		"@effect/platform-node": "^4.0.0-beta.x"
	}
}
```

All Effect ecosystem packages share a single version number in v4.

---

## Phase 0 — Foundation (Week 1)

**Goal**: Add Effect-TS v4, define base infrastructure, replace Hono app factory. Zero business logic changes.

### New Files

| File                             | Purpose                                                           |
| -------------------------------- | ----------------------------------------------------------------- |
| `src/effect/errors.ts`           | Typed error hierarchy replacing `HTTPException` + `null` returns  |
| `src/effect/runtime.ts`          | Effect `Runtime` with base Layers (Logger, Env, NodeHttpServer)   |
| `src/effect/http-app.ts`         | `createHttpApp()` — returns `HttpRouter` application builder      |
| `src/effect/services/context.ts` | `RequestContext` service (user, session, workspace, membership)   |
| `src/effect/schemas/common.ts`   | Effect Schema v4 equivalents of `@hoalu/common/schema` primitives |

### Modified Files

| File           | Change                                           |
| -------------- | ------------------------------------------------ |
| `package.json` | Add `effect` and `@effect/platform-node` v4      |
| `src/index.ts` | Replace Hono `serve` with `NodeHttpServer.serve` |

### Key Patterns Introduced

**Error hierarchy** replaces `HTTPException` + `return null`:

```typescript
// src/effect/errors.ts
import { Schema } from "effect";

class NotFoundError extends Schema.TaggedErrorClass<NotFoundError>()("NotFoundError", {
	resource: Schema.String,
	id: Schema.String,
}) {}

class ValidationError extends Schema.TaggedErrorClass<ValidationError>()("ValidationError", {
	message: Schema.String,
	issues: Schema.Array(Schema.String),
}) {}

class UnauthorizedError extends Schema.TaggedErrorClass<UnauthorizedError>()(
	"UnauthorizedError",
	{},
) {}

class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()("DatabaseError", {
	message: Schema.String,
}) {}
```

**HTTP App factory** replaces `createHonoInstance()`:

```typescript
// src/effect/http-app.ts
import { HttpRouter } from "effect/unstable/http";
import { Layer } from "effect";

export function createHttpApp() {
	return HttpRouter.make;
}

export function serveApp(appLayer: Layer.Layer<any, any, HttpRouter>) {
	return HttpRouter.serve(appLayer);
}
```

**Risk**: None — added infrastructure, no existing paths modified.

---

## Phase 1 — Service Layer (Week 2-3)

**Goal**: Convert repository classes to Effect v4 Services. Keep old route handlers, start routing through services.

### New Files (one per resource)

| File                                    | Replaces                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| `src/effect/services/db.ts`             | Direct `import { db }` → `DbService` Layer (manages pool lifecycle via `Scope`) |
| `src/effect/services/redis.ts`          | Direct `import redis` → `RedisService` Layer                                    |
| `src/effect/services/s3.ts`             | Direct `import bunS3Client` → `S3Service` Layer                                 |
| `src/effect/services/category.ts`       | `routes/categories/repository.ts`                                               |
| `src/effect/services/expense.ts`        | `routes/expenses/repository.ts`                                                 |
| `src/effect/services/wallet.ts`         | `routes/wallets/repository.ts`                                                  |
| `src/effect/services/task.ts`           | `routes/tasks/repository.ts`                                                    |
| `src/effect/services/file.ts`           | `routes/files/repository.ts`                                                    |
| `src/effect/services/income.ts`         | `routes/incomes/repository.ts`                                                  |
| `src/effect/services/event.ts`          | `routes/events/repository.ts`                                                   |
| `src/effect/services/exchange-rate.ts`  | `routes/exchange-rates/repository.ts`                                           |
| `src/effect/services/recurring-bill.ts` | `routes/recurring-bills/repository.ts`                                          |
| `src/effect/services/workspace.ts`      | — (auth/workspace operations)                                                   |

### Key Pattern: Repository → Service (v4)

```typescript
// src/effect/services/category.ts
import { Context, Effect, Layer } from "effect";
import { CategoryRepository } from "#api/routes/categories/repository.ts";

class CategoryService extends Context.Service<
	CategoryService,
	{
		findAllByWorkspaceId: (params: {
			workspaceId: string;
			type?: "expense" | "income";
		}) => Effect.Effect<Array<Category>, DatabaseError>;
		findOne: (params: {
			id: string;
			workspaceId: string;
		}) => Effect.Effect<Category, NotFoundError | DatabaseError>;
		insert: (data: NewCategory) => Effect.Effect<Category, DatabaseError>;
		// ... update, delete
	}
>()("CategoryService") {
	static readonly layer = Layer.effect(
		this,
		Effect.gen(function* () {
			const repo = new CategoryRepository();

			return {
				findAllByWorkspaceId: (params) =>
					Effect.tryPromise({
						try: () => repo.findAllByWorkspaceId(params),
						catch: (error) => new DatabaseError({ message: String(error) }),
					}),

				findOne: (params) =>
					Effect.gen(function* () {
						const result = yield* Effect.tryPromise({
							try: () => repo.findOne(params),
							catch: (error) => new DatabaseError({ message: String(error) }),
						});
						if (!result) {
							return yield* Effect.fail(new NotFoundError({ resource: "Category", id: params.id }));
						}
						return result;
					}),

				insert: (data) =>
					Effect.gen(function* () {
						const result = yield* Effect.tryPromise({
							try: () => repo.insert(data),
							catch: (error) => new DatabaseError({ message: String(error) }),
						});
						if (!result) return yield* Effect.fail(new DatabaseError({ message: "Insert failed" }));
						return result;
					}),

				// ... update, delete
			};
		}),
	);
}
```

### Route Handler Change (minimal)

```typescript
// Before:
const categories = await categoryRepository.findAllByWorkspaceId({ workspaceId: workspace.id });

// After:
const categories = await Effect.runPromise(
	CategoryService.use((s) => s.findAllByWorkspaceId({ workspaceId: workspace.id })).pipe(
		Effect.provide(CategoryService.layer),
	),
);
// error handling still manual until Phase 3's runEffect bridge
```

**Risk**: Low — services wrap existing repositories, no business logic changes.

---

## Phase 2 — Schema Migration (Week 3-4)

**Goal**: Replace Zod schemas with Effect Schema v4 in route files.

### Current Zod Pattern → Effect Schema v4 Pattern

```typescript
// BEFORE (Zod):
import * as z from "zod";

export const InsertCategorySchema = z.object({
	name: z.string().min(1),
	description: z.optional(z.string()),
	color: ColorSchema.default("gray"),
	type: CategoryTypeSchema,
});

// AFTER (Effect Schema v4):
import { Schema } from "effect";

export const InsertCategorySchema = Schema.Struct({
	name: Schema.String.check(Schema.isMinLength(1)),
	description: Schema.optional(Schema.String),
	color: Schema.String.pipe(Schema.withDecodingDefaultType(Effect.succeed("gray"))),
	type: Schema.Literals(["expense", "income"]),
});

export type InsertCategory = Schema.Schema.Type<typeof InsertCategorySchema>;
```

### Shared Schemas to Migrate

| Zod (common)     | Effect Schema v4 (api)                                                       |
| ---------------- | ---------------------------------------------------------------------------- |
| `CurrencySchema` | `Currency = Schema.Literals(["VND", "USD", "EUR", ...])`                     |
| `ColorSchema`    | `Color = Schema.Literals(["gray", "red", ...])`                              |
| `RepeatSchema`   | `Repeat = Schema.Literals(["none", "daily", "weekly", "monthly", "yearly"])` |
| `IsoDateSchema`  | `IsoDate = Schema.Date` (or `Schema.String` with format validation)          |
| `MonetarySchema` | Schema with `decodeTo` for amount formatting                                 |
| `UUIDv7`         | `Schema.String.check(Schema.isUUID())`                                       |

### Validator Replacement Strategy

Current Hono validators (`@hono/zod-validator`) → Effect Schema v4 validators:

```typescript
// src/validators/effect-json-body.ts
import { Schema, Effect, SchemaIssue } from "effect";
import { HttpServerResponse } from "effect/unstable/http";

export function effectJsonBodyValidator<A>(schema: Schema.Schema<A>) {
	return Effect.gen(function* () {
		const request = yield* HttpServerRequest.HttpServerRequest;
		const body = yield* request.json;
		const result = Schema.decodeUnknownExit(schema)(body);
		if (result._tag === "Failure") {
			const issues = SchemaIssue.makeFormatterStandardSchemaV1()(result.cause).issues;
			return HttpServerResponse.json({ message: "Validation failed", issues }, { status: 400 });
		}
		// ... provide validated body to context
	});
}
```

### Files Modified (per resource — 11 resources × 1 schema file each)

| File                           | Change                                                      |
| ------------------------------ | ----------------------------------------------------------- |
| `src/routes/*/schema.ts`       | Rewrite from Zod → Effect Schema v4                         |
| `src/validators/json-body.ts`  | Add Effect Schema v4 variant (or replace)                   |
| `src/validators/id-param.ts`   | Add Effect Schema v4 variant                                |
| `src/routes/*/index.ts`        | Update imports, use new schemas                             |
| `src/effect/schemas/common.ts` | Shared Effect schemas (Currency, Color, Repeat, UUID, Date) |

**Risk**: Medium — validation behavior must match exactly. Effect Schema v4 error format differs from Zod's. Test each resource endpoint after migration.

---

## Phase 3 — Route Handlers → Effect (Week 4-5)

**Goal**: Convert Hono handlers to Effect v4 HTTP handlers. This is where error handling becomes fully typed.

### Route Handler Before/After

```typescript
// BEFORE (categories/index.ts - GET /:id):
app.get("/:id", idParamValidator, workspaceQueryValidator, workspaceMember, async (c) => {
	const workspace = c.get("workspace");
	const param = c.req.valid("param");

	const category = await categoryRepository.findOne({ id: param.id, workspaceId: workspace.id });
	if (!category) {
		return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
	}

	const parsed = CategorySchema.safeParse(category);
	if (!parsed.success) {
		return c.json({ message: createIssueMsg(parsed.error.issues) }, 422);
	}
	return c.json({ data: parsed.data }, 200);
});

// AFTER (Effect v4):
import { HttpRouter, HttpServerResponse } from "effect/unstable/http";
import { Effect, Schema } from "effect";

const getCategoryById = HttpRouter.route(
	"GET",
	"/:id",
	Effect.gen(function* () {
		const context = yield* RequestContext;
		const params = yield* HttpRouter.RouteContext;
		const category = yield* CategoryService.use((s) =>
			s.findOne({ id: params.id, workspaceId: context.workspace.id }),
		);
		const validated = yield* Schema.decodeUnknown(CategorySchema)(category);
		return HttpServerResponse.json({ data: validated });
	}).pipe(Effect.provide(CategoryService.layer)),
);
```

**Key win**: No more manual `if (!category)` checks, no `safeParse` + `if` chains. Errors propagate through Effect's typed error channel, caught and mapped to HTTP responses by the router.

### Files Modified

| File                                  | Change                                                     |
| ------------------------------------- | ---------------------------------------------------------- |
| `src/routes/categories/index.ts`      | 226 lines → ~120 lines (remove boilerplate error handling) |
| `src/routes/expenses/index.ts`        | Same pattern (549 → ~300 lines)                            |
| `src/routes/recurring-bills/index.ts` | Same pattern (387 → ~200 lines)                            |
| `src/routes/files/index.ts`           | Same pattern (383 → ~200 lines)                            |
| All 7 other route `index.ts` files    | Same pattern                                               |
| `src/effect/services/category.ts`     | Add `Schema.decodeUnknown` validation inside service       |

**Impact**: ~50% reduction in handler boilerplate across all 11 resources.

---

## Phase 4 — Middleware → Effect Context (Week 5-6)

**Goal**: Replace Hono middleware with Effect v4 middleware and context services.

### Pattern Change

```typescript
// BEFORE (workspace-member.ts):
const workspaceMember = createMiddleware(async (c, next) => {
  const workspace = await db.query.workspace.findFirst(...)
  c.set("workspace", workspace)
  await next()
})

// AFTER (Effect v4 middleware):
import { HttpRouter, HttpMiddleware } from "effect/unstable/http"
import { Context, Effect } from "effect"

class WorkspaceContext extends Context.Service<WorkspaceContext, {
  workspace: Workspace
  membership: Membership
}>()("WorkspaceContext") {}

const WorkspaceMiddleware = HttpRouter.middleware<{
  provides: WorkspaceContext
}>()(
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const slug = request.searchParams.get("workspaceIdOrSlug")
    const user = yield* AuthContext

    const workspace = yield* WorkspaceService.use((s) => s.findBySlug(slug))
    const membership = yield* WorkspaceService.use((s) => s.findMembership(workspace.id, user.id))

    return (effect) => Effect.provideService(effect, WorkspaceContext, { workspace, membership })
  })
).layer
```

### Files Modified

| File                                  | Change                                                    |
| ------------------------------------- | --------------------------------------------------------- |
| `src/middlewares/user-session.ts`     | Replaced by `AuthContext` service + middleware layer      |
| `src/middlewares/workspace-member.ts` | Replaced by `WorkspaceContext` service + middleware layer |
| `src/effect/runtime.ts`               | Add `WorkspaceService`, `AuthService` to base layer list  |

---

## Phase 5 — Advanced (Week 6+)

1. **Effect Config**: Replace `verifyEnv()` with `Effect.Config` for env validation with better errors
2. **Structured concurrency**: Parallel DB queries via `Effect.all()` for dashboard stats
3. **Resource safety**: DB pool, Redis connection, S3 client managed via `Effect.acquireRelease` (auto-cleanup)
4. **Observability**: Effect Logger + spans replacing Pino for structured tracing
5. **Testing**: Add tests using `Effect.TestServices` / `TestContext` — the DI makes services trivially mockable

---

## File Tree After Full Migration

```
apps/api/src/
├── index.ts                                  # Entry point: Effect Runtime + NodeHttpServer
├── types.ts                                  # App context types (RequestContext, etc.)
├── db/
│   ├── index.ts                              # DB pool export (unchanged)
│   └── schema.ts                             # Drizzle schema (unchanged)
├── lib/
│   ├── auth.ts                               # Better Auth (unchanged)
│   ├── electric.ts                           # Electric sync (unchanged)
│   ├── email.ts                              # Email (unchanged)
│   ├── env.ts                                # Phase 5: Effect Config
│   ├── ocr.ts                                # AI OCR (tiny service wrapper)
│   └── parse-with-ai.ts                      # AI parse (tiny service wrapper)
├── effect/
│   ├── errors.ts                             # Typed error classes (Schema.TaggedErrorClass)
│   ├── runtime.ts                            # Runtime with all layers
│   ├── http-app.ts                           # createHttpApp() + serveApp()
│   └── services/                             # Effect v4 Service layer
│       ├── context.ts                        # RequestContext (user, workspace, membership)
│       ├── db.ts                             # DbService (pool lifecycle)
│       ├── redis.ts                          # RedisService
│       ├── s3.ts                             # S3Service
│       ├── category.ts                       # CategoryService
│       ├── expense.ts                        # ExpenseService
│       ├── wallet.ts                         # WalletService
│       ├── task.ts                           # TaskService
│       ├── file.ts                           # FileService
│       ├── income.ts                         # IncomeService
│       ├── event.ts                          # EventService
│       ├── exchange-rate.ts                  # ExchangeRateService
│       ├── recurring-bill.ts                 # RecurringBillService
│       └── workspace.ts                      # WorkspaceService
│   └── schemas/
│       └── common.ts                         # Shared Effect Schema v4 definitions
├── middlewares/                              # Effect v4 middleware layers
│   ├── auth.ts                               # AuthContext middleware
│   ├── workspace.ts                          # WorkspaceContext middleware
│   ├── rate-limit.ts                         # Rate limiting middleware
│   └── cors.ts                               # CORS middleware
├── modules/                                  # Effect v4 route modules
│   ├── api.ts                                # BFF routes (HttpRouter)
│   ├── auth.ts                               # Auth proxy (auth.handler)
│   ├── health.ts                             # Health check route
│   ├── openapi.ts                            # OpenAPI docs (static or generated)
│   └── sync.ts                               # Electric sync routes
├── routes/                                   # Route handlers (Effect v4)
│   ├── categories/
│   │   ├── index.ts                          # Phase 3: Effect handlers
│   │   ├── repository.ts                     # SOFT DEPRECATED (service replaces it)
│   │   └── schema.ts                         # Phase 2: Effect Schema v4
│   └── ... (9 more resources, same pattern)
├── validators/
│   ├── effect-json-body.ts                   # Effect Schema v4 body validator
│   ├── effect-id-param.ts                    # Effect Schema v4 param validator
│   ├── id-param.ts                           # (keep during transition)
│   ├── json-body.ts                          # (keep during transition)
│   └── workspace-query.ts                    # (keep)
└── utils/
    ├── constants.ts                          # (unchanged)
    └── io.ts                                 # (unchanged)
```

### Files Deprecated (kept during transition, removed when all routes migrated)

- `src/routes/*/repository.ts` — replaced by `src/effect/services/*.ts`
- `src/validators/id-param.ts` — replaced by Effect Schema v4 equivalent
- `src/validators/json-body.ts` — replaced by Effect Schema v4 equivalent
- `src/lib/create-app.ts` — replaced by `src/effect/http-app.ts`

---

## Risk Assessment

| Risk                                         | Impact             | Mitigation                                         |
| -------------------------------------------- | ------------------ | -------------------------------------------------- |
| Effect Schema v4 validation differs from Zod | Production bugs    | Test each endpoint after Phase 2 migration         |
| `Effect.runPromise` race conditions          | Conn leak, memory  | Phase 5 resource safety via `Scope`                |
| Better Auth integration breaks               | Auth outage        | `auth.handler` is framework-agnostic — low risk    |
| Bundle size increase                         | Slower cold starts | Effect v4 tree-shakes to ~6-15KB min+gzip          |
| Team learning curve                          | Slower development | Incremental roll-out, services co-exist with repos |
| v4 API changes during beta                   | Breaking changes   | Pin to specific beta version, monitor changelogs   |

---

## Key v4 API Changes from v3

| v3 API                                              | v4 API                                             | Notes                                     |
| --------------------------------------------------- | -------------------------------------------------- | ----------------------------------------- |
| `Effect.Service<T>()(id, { effect, dependencies })` | `Context.Service<T>()(id, { make })`               | Use `Layer.effect` for layer construction |
| `Context.Tag(id)<Self, Shape>()`                    | `Context.Service<Self, Shape>()(id)`               | Class syntax updated                      |
| `Schema.TaggedError`                                | `Schema.TaggedErrorClass`                          | Renamed                                   |
| `Schema.Literal("a", "b")`                          | `Schema.Literals(["a", "b"])`                      | Variadic → array                          |
| `Schema.String.pipe(Schema.minLength(1))`           | `Schema.String.check(Schema.isMinLength(1))`       | `is*` prefix for filters                  |
| `Schema.UUID`                                       | `Schema.String.check(Schema.isUUID())`             | Restructured                              |
| `Schema.decodeUnknown`                              | `Schema.decodeUnknownEffect`                       | Renamed                                   |
| `Schema.decodeUnknownEither`                        | `Schema.decodeUnknownExit`                         | Renamed                                   |
| `Schema.optionalWith(schema, { default })`          | `schema.pipe(Schema.withDecodingDefaultType(...))` | Restructured                              |
