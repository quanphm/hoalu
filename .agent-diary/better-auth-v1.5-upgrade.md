# Better Auth v1.5 Upgrade

**Date**: 2026-03-01
**Status**: Complete (including APIError refactor)

**Migration File**: `0004_unique_infant_terrible.sql`

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

**Migration approach:** The Drizzle migration (`0004_unique_infant_terrible.sql`) handles the schema changes. Key operations:

- Renames `user_id` → `reference_id` via `ALTER TABLE RENAME COLUMN`
- Adds `config_id` column with default value `'default'`
- Drops the foreign key constraint on `user_id`
- Updates timestamp columns with precision and timezone
- Drops the `metadata` column

Existing `apikey` rows retain their data with `user_id` values preserved as `reference_id`.

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

**Critical correction:** `defineErrorCodes` **transforms values at runtime** into `{ code, message, toString }` objects:

```js
// @better-auth/core source (actual implementation)
function defineErrorCodes(codes) {
	return Object.fromEntries(
		Object.entries(codes).map(([key, value]) => [
			key,
			{
				code: key,
				message: value,
				toString: () => key,
			},
		]),
	);
}
```

So `WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND` becomes `{ code: "WORKSPACE_NOT_FOUND", message: "Workspace not found", toString: () => "WORKSPACE_NOT_FOUND" }`.

The `APIError.from()` static method **does exist** in v1.5 (located in `@better-auth/core/error`):

```ts
static from(status, error: { code: string; message: string }): APIError {
    return new APIError(status, { message: error.message, code: error.code });
}
```

This allows the new pattern:

```ts
import { APIError } from "@better-auth/core/error";
throw APIError.from("BAD_REQUEST", WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND);
```

**Migration required:**

- Import `APIError` from `"@better-auth/core/error"` instead of `"better-call"`
- Replace `new APIError("STATUS", { message: WORKSPACE_ERROR_CODES.X })` with `APIError.from("STATUS", WORKSPACE_ERROR_CODES.X)`
- Keep plain string literals as `new APIError("STATUS", { message: "literal" })`
- Keep no-message throws as `new APIError("STATUS")`
- Convert `ctx.json(null, { status, body: { message: WORKSPACE_ERROR_CODES.X } })` to `throw APIError.from(...)` for consistency

---

## Patches Applied

### @better-auth/api-key Type Fix

**Problem**: `@better-auth/api-key` v1.5 has a type visibility issue. The `PredefinedApiKeyOptions` type is:

1. Defined in `error-codes-xCoIeQ-k.d.mts`
2. Imported locally in `index.d.mts` as `n as PredefinedApiKeyOptions`
3. Used in the return type of `apiKey()` function as `configurations: PredefinedApiKeyOptions[]`
4. **NOT exported** from the main package entry point

When TypeScript tries to emit declaration files for `auth.ts`, it encounters `PredefinedApiKeyOptions` in the inferred type but cannot generate a valid import for it because the type is trapped as an internal-only name.

**Solution**: Created a patch using `bun patch` that adds `PredefinedApiKeyOptions` to the public exports:

**File Patched**:

- `node_modules/@better-auth/api-key/dist/index.d.mts`

**Change**:

```diff
-export { API_KEY_ERROR_CODES, API_KEY_TABLE_NAME, ApiKey, ApiKeyConfigurationOptions, ApiKeyOptions, apiKey, defaultKeyHasher };
+export { API_KEY_ERROR_CODES, API_KEY_TABLE_NAME, ApiKey, ApiKeyConfigurationOptions, ApiKeyOptions, PredefinedApiKeyOptions, apiKey, defaultKeyHasher };
```

**Why this works**: By exporting `PredefinedApiKeyOptions` from the main entry point, TypeScript can now properly reference the type when emitting declaration files. The type is no longer "trapped" inside the internal module.

**Patch file**: `patches/@better-auth%2Fapi-key@1.5.0.patch`

**Tool used**: `bun patch` (not `patch-package`) - Bun's native patching system that updates `package.json` `patchedDependencies` and the lockfile automatically.

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

| File                                                            | Change                                                                                |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `package.json`                                                  | `better-auth` → `^1.5.0`, add `@better-auth/api-key: ^1.5.0` to catalog               |
| `apps/api/package.json`                                         | Add `@better-auth/api-key: catalog:` to dependencies                                  |
| `apps/api/src/lib/auth.ts`                                      | Move `apiKey` import to `@better-auth/api-key`                                        |
| `apps/api/src/db/schema.ts`                                     | Rewrite `apikey` table to match v1.5 schema                                           |
| `apps/api/migrations/`                                          | New migration generated by `bun run db:generate`                                      |
| `packages/auth/src/plugins/workspace/error-codes.ts`            | Wrap with `defineErrorCodes()`                                                        |
| `packages/auth/src/plugins/workspace/routes/crud-workspaces.ts` | Import `APIError` from `@better-auth/core/error`, migrate throws to `APIError.from()` |
| `packages/auth/src/plugins/workspace/routes/crud-members.ts`    | Import `APIError` from `@better-auth/core/error`, migrate throws to `APIError.from()` |
| `packages/auth/src/plugins/workspace/routes/crud-invites.ts`    | Import `APIError` from `@better-auth/core/error`, migrate throws to `APIError.from()` |

---

## What Was NOT Changed

- `apps/app/src/hooks/use-auth.ts` — no deprecated APIs
- `apps/app/src/lib/auth-client.ts` — no deprecated APIs
