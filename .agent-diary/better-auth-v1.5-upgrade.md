# Better Auth v1.5 Upgrade

**Date**: 2026-03-01
**Status**: In progress

---

## Goal

Upgrade Better Auth from `^1.4.19` to `^1.5.0` across the monorepo, handling all breaking changes
identified from the v1.5 changelog.

---

## Breaking Changes That Apply to This Codebase

### 1. `apiKey` plugin extracted to `@better-auth/api-key`

The `apiKey` plugin is no longer bundled inside `better-auth/plugins`. It is now a standalone
package `@better-auth/api-key` that must be installed separately.

```diff
- import { apiKey, jwt, openAPI } from "better-auth/plugins";
+ import { jwt, openAPI } from "better-auth/plugins";
+ import { apiKey } from "@better-auth/api-key";
```

The package is added to the workspace catalog alongside `better-auth` so all apps can reference it
consistently with `"catalog:"`.

### 2. `apikey` table schema changes

The `@better-auth/api-key` v1.5 package ships a new schema. The differences from the existing
`apikey` table in `apps/api/src/db/schema.ts`:

| Column             | Before                                          | After                                       | Change                      |
| ------------------ | ----------------------------------------------- | ------------------------------------------- | --------------------------- |
| `id`               | `uuid` PK                                       | `text` PK                                   | Type changed                |
| `configId`         | ❌                                              | `text("config_id").notNull()`               | Added                       |
| `userId`           | `uuid("user_id").notNull().references(user.id)` | ❌                                          | Removed (with FK)           |
| `referenceId`      | ❌                                              | `text("reference_id").notNull()`            | Added (no FK — polymorphic) |
| `enabled`          | `boolean` (nullable)                            | `boolean.notNull()`                         | Made non-nullable           |
| `rateLimitEnabled` | `boolean` (nullable)                            | `boolean.notNull()`                         | Made non-nullable           |
| `requestCount`     | `integer` (nullable)                            | `integer.notNull()`                         | Made non-nullable           |
| `lastRefillAt`     | `timestamp`                                     | `timestamp(precision:6, tz:true)`           | Precision + timezone        |
| `lastRequest`      | `timestamp`                                     | `timestamp(precision:6, tz:true)`           | Precision + timezone        |
| `expiresAt`        | `timestamp`                                     | `timestamp(precision:6, tz:true)`           | Precision + timezone        |
| `createdAt`        | `timestamp.notNull()`                           | `timestamp(precision:6, tz:true).notNull()` | Precision + timezone        |
| `updatedAt`        | `timestamp.notNull()`                           | `timestamp(precision:6, tz:true).notNull()` | Precision + timezone        |
| `metadata`         | `text("metadata")`                              | `undefined`                                 | Removed                     |

**Key decision:** `referenceId` has no FK constraint. The `@better-auth/api-key` package manages
its own reference polymorphically (can reference users or organizations). The FK to `user.id` that
existed on `userId` is intentionally dropped.

**Migration approach:** The Drizzle migration renames `user_id` → `reference_id` via
`ALTER TABLE RENAME COLUMN` and handles all other additions/removals. Because existing `apikey`
rows (if any) have their `user_id` value preserved as `reference_id`, no data is lost.

```ts
import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const table = pgTable("table", {
	id: t.text("id").primaryKey(),
	configId: t.text("config_id").notNull(),
	name: t.text("name"),
	start: t.text("start"),
	prefix: t.text("prefix"),
	key: t.text("key").notNull(),
	referenceId: t.text("reference_id").notNull(),
	refillInterval: t.integer("refill_interval"),
	refillAmount: t.integer("refill_amount"),
	lastRefillAt: t.timestamp("last_refill_at", { precision: 6, withTimezone: true }),
	enabled: t.boolean("enabled").notNull(),
	rateLimitEnabled: t.boolean("rate_limit_enabled").notNull(),
	rateLimitTimeWindow: t.integer("rate_limit_time_window"),
	rateLimitMax: t.integer("rate_limit_max"),
	requestCount: t.integer("request_count").notNull(),
	remaining: t.integer("remaining"),
	lastRequest: t.timestamp("last_request", { precision: 6, withTimezone: true }),
	expiresAt: t.timestamp("expires_at", { precision: 6, withTimezone: true }),
	createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }).notNull(),
	updatedAt: t.timestamp("updated_at", { precision: 6, withTimezone: true }).notNull(),
	permissions: t.text("permissions"),
	metadata: undefined,
});
```

### 3. `$ERROR_CODES` must use `defineErrorCodes()`

Better Auth v1.5 tightens the `BetterAuthPlugin.$ERROR_CODES` type contract. Plugin authors must
wrap their error code objects with `defineErrorCodes()` from `@better-auth/core/utils/error-codes`.

**Critical implementation note:** `defineErrorCodes` is a **runtime identity function**:

```ts
// @better-auth/core source
export function defineErrorCodes<const T extends Record<string, string>>(codes): T {
	return codes as T; // ← returns the same object unchanged
}
```

It only validates at the TypeScript type level that all keys are `UPPER_SNAKE_CASE`. The values
remain plain strings at runtime. Therefore:

- No changes needed to how `WORKSPACE_ERROR_CODES.X` is used in route files
- `APIError` stays imported from `better-call` (not changed)
- `throw new APIError("STATUS", { message: WORKSPACE_ERROR_CODES.X })` continues to work as-is

The `APIError.from()` static method mentioned in the v1.5 changelog **does not exist** in the
released package. The changelog describes it as a pattern for plugin authors using `defineErrorCodes`
in combination with `APIError`, but the static method itself is not shipped. All existing
`new APIError(...)` usages are correct and unchanged.

---

## Breaking Changes That Do NOT Apply

| Change                                     | Reason not applicable                                                                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `InferUser` / `InferSession` types removed | `auth-client.ts` uses `typeof authClient.$Infer`, not those types                                                                          |
| `getMigrations` import path changed        | Not imported programmatically anywhere                                                                                                     |
| `advanced.database.useNumberId` removed    | Uses custom `generateId` function, not `useNumberId`                                                                                       |
| `@better-auth/core/utils` barrel removed   | Not imported from that barrel anywhere in codebase                                                                                         |
| After hooks run post-transaction           | `workspaceCreation.afterCreate` is a user callback called directly in the route handler, not a registered `hook.after`; behavior unchanged |

---

## Files Changed

| File                                                 | Change                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `package.json`                                       | `better-auth` → `^1.5.0`, add `@better-auth/api-key: ^1.5.0` to catalog |
| `apps/api/package.json`                              | Add `@better-auth/api-key: catalog:` to dependencies                    |
| `apps/api/src/lib/auth.ts`                           | Move `apiKey` import to `@better-auth/api-key`                          |
| `apps/api/src/db/schema.ts`                          | Rewrite `apikey` table to match v1.5 schema                             |
| `apps/api/migrations/`                               | New migration generated by `bun run db:generate`                        |
| `packages/auth/src/plugins/workspace/error-codes.ts` | Wrap with `defineErrorCodes()`                                          |

---

## What Was NOT Changed

- `apps/app/src/hooks/use-auth.ts` — no deprecated APIs
- `apps/app/src/lib/auth-client.ts` — no deprecated APIs
- `packages/auth/src/plugins/workspace/routes/crud-invites.ts` — no changes
- `packages/auth/src/plugins/workspace/routes/crud-members.ts` — no changes
- `packages/auth/src/plugins/workspace/routes/crud-workspaces.ts` — no changes
