# Effect-TS Migration Plan for `apps/api/`

## Strategy Overview

- **Keep Hono** as HTTP layer — Better Auth, OpenAPI docs, Electric sync proxy all stay
- **Replace Zod → Effect Schema** — full migration (frontend `@hoalu/common` stays Zod for now)
- **Incremental roll-out** — each phase is independently shippable, no big-bang rewrite
- **Motivation**: typed errors, dependency injection via Layers, resource safety, structured concurrency

---

## Phase 0 — Foundation (Week 1)

**Goal**: Add Effect-TS, define base infrastructure. Zero business logic changes.

### New Files

| File                             | Purpose                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/effect/errors.ts`           | Typed error hierarchy replacing `HTTPException` + `null` returns                               |
| `src/effect/runtime.ts`          | Effect `Runtime` with base Layers (Logger, Env)                                                |
| `src/effect/bridge.ts`           | `runEffect(c, program)` — bridges Hono handlers → Effect, maps errors → HTTP                   |
| `src/effect/services/context.ts` | `RequestContext` service (user, session, workspace, membership)                                |
| `src/effect/schemas/common.ts`   | Effect Schema equivalents of `@hoalu/common/schema` primitives (Currency, Color, Repeat, etc.) |

### Modified Files

| File           | Change                                            |
| -------------- | ------------------------------------------------- |
| `package.json` | Add `"effect": "catalog:"`                        |
| `src/types.ts` | Extend `AppBindings` with `runtime: Runtime<...>` |

### Key Patterns Introduced

**Error hierarchy** replaces `HTTPException` + `return null`:

```typescript
// src/effect/errors.ts
class NotFoundError extends Schema.TaggedError<NotFoundError>()("NotFoundError", {
	resource: Schema.String,
	id: Schema.String,
}) {}

class ValidationError extends Schema.TaggedError<ValidationError>()("ValidationError", {
	message: Schema.String,
	issues: Schema.Array(Schema.String),
}) {}

class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>()("UnauthorizedError", {}) {}

class DatabaseError extends Schema.TaggedError<DatabaseError>()("DatabaseError", {
	message: Schema.String,
}) {}
```

**Bridge** auto-maps errors → HTTP:

```typescript
// src/effect/bridge.ts
export function runEffect<E, A>(c: Context, program: Effect<A, E>) {
	return Effect.runPromise(
		program.pipe(
			Effect.catchTags({
				NotFoundError: (e) => Effect.succeed(c.json({ message: e.message }, 404)),
				ValidationError: (e) =>
					Effect.succeed(c.json({ message: e.message, issues: e.issues }, 422)),
				UnauthorizedError: () => Effect.succeed(c.json({ message: "Unauthorized" }, 401)),
				DatabaseError: (e) => Effect.succeed(c.json({ message: e.message }, 500)),
			}),
			Effect.catchAllDefect((defect) =>
				Effect.succeed(c.json({ message: "Internal Server Error" }, 500)),
			),
			Effect.provide(runtime),
		),
	);
}
```

**Risk**: None — added infrastructure, no existing paths modified.

---

## Phase 1 — Service Layer (Week 2-3)

**Goal**: Convert repository classes to Effect Services. Keep old route handlers, start routing through services.

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

### Key Pattern: Repository → Service

```typescript
// src/effect/services/category.ts
import { Effect, pipe } from "effect";
import { CategoryRepository } from "#api/routes/categories/repository.ts";
// ... error types, etc.

class CategoryService extends Effect.Service<CategoryService>()("CategoryService", {
	effect: Effect.gen(function* () {
		const repo = new CategoryRepository(); // ← eventually replaced by DbService

		return {
			findAllByWorkspaceId: (params: { workspaceId: string; type?: "expense" | "income" }) =>
				Effect.tryPromise({
					try: () => repo.findAllByWorkspaceId(params),
					catch: (error) => new DatabaseError({ message: String(error) }),
				}),

			findOne: (params: { id: string; workspaceId: string }) =>
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

			insert: (data: NewCategory) =>
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
	dependencies: [], // ← DbService will be added here in Phase 2
}) {}
```

### Route Handler Change (minimal)

```typescript
// Before:
const categories = await categoryRepository.findAllByWorkspaceId({ workspaceId: workspace.id });

// After:
const categories = await Effect.runPromise(
	CategoryService.findAllByWorkspaceId({ workspaceId: workspace.id }).pipe(
		Effect.provide(EffectLayer),
	),
);
// error handling still manual until Phase 3's runEffect bridge
```

**Risk**: Low — services wrap existing repositories, no business logic changes.

---

## Phase 2 — Schema Migration (Week 3-4)

**Goal**: Replace Zod schemas with Effect Schema in route files.

### Current Zod Pattern → Effect Schema Pattern

```typescript
// BEFORE (Zod):
import * as z from "zod";

export const InsertCategorySchema = z.object({
	name: z.string().min(1),
	description: z.optional(z.string()),
	color: ColorSchema.default("gray"),
	type: CategoryTypeSchema,
});

// AFTER (Effect Schema):
import { Schema } from "effect";

export const InsertCategorySchema = Schema.Struct({
	name: Schema.String.pipe(Schema.minLength(1)),
	description: Schema.optional(Schema.String),
	color: Schema.String.pipe(Schema.optionalWith({ default: () => "gray" as const })),
	type: Schema.Literal("expense", "income"),
});

export type InsertCategory = Schema.Schema.Type<typeof InsertCategorySchema>;
```

### Shared Schemas to Migrate

| Zod (common)     | Effect Schema (api)                                                       |
| ---------------- | ------------------------------------------------------------------------- |
| `CurrencySchema` | `Currency = Schema.Literal("VND", "USD", "EUR", ...)`                     |
| `ColorSchema`    | `Color = Schema.Literal("gray", "red", ...)`                              |
| `RepeatSchema`   | `Repeat = Schema.Literal("none", "daily", "weekly", "monthly", "yearly")` |
| `IsoDateSchema`  | `IsoDate = Schema.Date` (or `Schema.String` with format validation)       |
| `MonetarySchema` | Schema with `transform` for amount formatting                             |
| `UUIDv7`         | `Schema.UUID`                                                             |

### Validator Replacement Strategy

Current Hono validators (`@hono/zod-validator`) → custom Effect Schema validators:

```typescript
// src/validators/effect-json-body.ts
import { Schema, Effect } from "effect";
import { HTTPException } from "hono/http-exception";

export function effectJsonBodyValidator<T>(schema: Schema.Schema<T>) {
	return async (c: Context, next: Next) => {
		const body = await c.req.json();
		const result = Schema.decodeUnknownEither(schema)(body);
		if (result._tag === "Left") {
			throw new HTTPException(400, { message: formatParseError(result.left) });
		}
		c.set("validatedJson", result.right);
		await next();
	};
}
```

### Files Modified (per resource — 11 resources × 1 schema file each)

| File                           | Change                                                      |
| ------------------------------ | ----------------------------------------------------------- |
| `src/routes/*/schema.ts`       | Rewrite from Zod → Effect Schema                            |
| `src/validators/json-body.ts`  | Add Effect Schema variant (or replace)                      |
| `src/validators/id-param.ts`   | Add Effect Schema variant                                   |
| `src/routes/*/index.ts`        | Update imports, use new schemas                             |
| `src/effect/schemas/common.ts` | Shared Effect schemas (Currency, Color, Repeat, UUID, Date) |

**Risk**: Medium — validation behavior must match exactly. Effect Schema's error format differs from Zod's. Test each resource endpoint after migration.

---

## Phase 3 — Route Handlers → Effect (Week 4-5)

**Goal**: Convert Hono handlers to run Effect programs via the bridge. This is where error handling becomes fully typed.

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

// AFTER:
app.get("/:id", idParamValidator, workspaceQueryValidator, workspaceMember, (c) => {
	const workspace = c.get("workspace");
	const param = c.req.valid("param");

	return runEffect(
		c,
		Effect.gen(function* () {
			const category = yield* CategoryService.findOne({ id: param.id, workspaceId: workspace.id });
			const validated = yield* Schema.decodeUnknown(CategorySchema)(category);
			return c.json({ data: validated }, 200);
		}),
	);
});
```

**Key win**: No more manual `if (!category)` checks, no `safeParse` + `if` chains. Errors propagate through Effect's typed error channel, caught and mapped to HTTP responses by the bridge.

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

**Goal**: Hono middleware provides Effect services instead of raw Hono ctx variables.

### Pattern Change

```typescript
// BEFORE (workspace-member.ts):
const workspaceMember = createMiddleware(async (c, next) => {
  const workspace = await db.query.workspace.findFirst(...);
  c.set("workspace", workspace);
  await next();
});

// AFTER:
const workspaceMember = createMiddleware(async (c, next) => {
  const runtime = c.get("runtime");  // Effect runtime from app-level
  const workspace = await Effect.runPromise(
    WorkspaceService.findBySlug(slug).pipe(Effect.provide(runtime))
  );
  c.set("workspace", workspace);
  c.set("workspaceService", WorkspaceService.make(workspace));  // scoped service
  await next();
});
```

### Files Modified

| File                                  | Change                                                         |
| ------------------------------------- | -------------------------------------------------------------- |
| `src/middlewares/user-session.ts`     | Wrap Better Auth call in Effect, provide `AuthContext` service |
| `src/middlewares/workspace-member.ts` | Provide `WorkspaceContext` service to request scope            |
| `src/effect/runtime.ts`               | Add `WorkspaceService`, `AuthService` to base layer list       |

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
├── app.ts                                    # Hono composition (unchanged shape)
├── index.ts                                  # Entry point (unchanged)
├── types.ts                                  # Extended AppBindings
├── db/
│   ├── index.ts                              # DB pool export (unchanged)
│   └── schema.ts                             # Drizzle schema (unchanged)
├── lib/
│   ├── auth.ts                               # Better Auth (unchanged)
│   ├── create-app.ts                         # Add runtime to app context
│   ├── electric.ts                           # Electric sync (unchanged)
│   ├── email.ts                              # Email (unchanged)
│   ├── env.ts                                # Phase 5: Effect Config
│   ├── ocr.ts                                # AI OCR (tiny service wrapper)
│   └── parse-with-ai.ts                      # AI parse (tiny service wrapper)
├── effect/
│   ├── errors.ts                             # Typed error classes
│   ├── runtime.ts                            # Runtime with all layers
│   ├── bridge.ts                             # Hono ↔ Effect bridge
│   └── services/                             # NEW: Effect Service layer
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
│       └── common.ts                         # Shared Effect Schema definitions
├── middlewares/
│   ├── user-session.ts                       # Phase 4: provide Auth service
│   └── workspace-member.ts                   # Phase 4: provide Workspace service
├── modules/
│   ├── api.ts                                # Route mounting (unchanged)
│   ├── auth.ts                               # Auth proxying (unchanged)
│   ├── health.ts                             # Health (unchanged)
│   ├── openapi.ts                            # Scalar docs (unchanged)
│   └── sync.ts                               # Electric sync (unchanged)
├── routes/
│   ├── categories/
│   │   ├── index.ts                          # Phase 3: Effect handlers
│   │   ├── repository.ts                     # SOFT DEPRECATED (service replaces it)
│   │   └── schema.ts                         # Phase 2: Effect Schema
│   └── ... (9 more resources, same pattern)
├── validators/
│   ├── effect-json-body.ts                   # NEW: Effect Schema body validator
│   ├── effect-id-param.ts                    # NEW: Effect Schema param validator
│   ├── id-param.ts                           # (keep during transition)
│   ├── json-body.ts                          # (keep during transition)
│   └── workspace-query.ts                    # (keep)
└── utils/
    ├── constants.ts                          # (unchanged)
    └── io.ts                                 # (unchanged)
```

### Files Deprecated (kept during transition, removed when all routes migrated)

- `src/routes/*/repository.ts` — replaced by `src/effect/services/*.ts`
- `src/validators/id-param.ts` — replaced by Effect Schema equivalent
- `src/validators/json-body.ts` — replaced by Effect Schema equivalent

---

## Risk Assessment

| Risk                                      | Impact             | Mitigation                                         |
| ----------------------------------------- | ------------------ | -------------------------------------------------- |
| Effect Schema validation differs from Zod | Production bugs    | Test each endpoint after Phase 2 migration         |
| `Effect.runPromise` race conditions       | Conn leak, memory  | Phase 5 resource safety via `Scope`                |
| Better Auth integration breaks            | Auth outage        | Keep Hono middleware, only wrap business logic     |
| Bundle size increase                      | Slower cold starts | Tree-shake Effect, only import needed modules      |
| Team learning curve                       | Slower development | Incremental roll-out, services co-exist with repos |

---

## Dependencies to Add

```json
{
	"dependencies": {
		"effect": "^3.x"
	}
}
```

No other Effect packages needed for Phases 0-3. `@effect/platform` not needed since we're keeping Hono.
