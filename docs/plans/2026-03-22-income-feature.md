# Income Feature Implementation Plan

**Goal:** Add income tracking as a distinct entity with its own categories, list page, and dashboard comparison chart against expenses.

**Architecture:** Extend the `category` table with a `type` flag (`expense | income`), add a new `income` table mirroring the `expense` structure, add full CRUD API routes under `/bff/incomes`, Electric SQL sync proxy, and frontend components following existing patterns exactly (factory collections, live queries with FX conversion, haptic/toast/sound mutations via `apiClient`).

**Tech Stack:** Bun, Hono, Drizzle ORM, PostgreSQL 17, Electric SQL, TanStack DB, TanStack Router, TanStack Form, Jotai, Recharts, Zod v4

---

## Verified codebase facts (do not guess — these were confirmed)

- Route base path is `/bff` (not `/api`) — `apps/api/src/modules/api.ts` uses `.basePath("/bff")`
- Caddy maps `/api` → `/bff` for external access
- `generateId({ use: "uuid" })` — always called with this argument
- `c.get("user")` — not `c.get("session")` — for creator ID in route handlers
- `proxyElectricRequest` returns tuple `[data, headers]` — handler must call `c.json(data, HTTPStatus.codes.OK, headers.toJSON())`
- `repeatEnum` values: `"one-time" | "daily" | "weekly" | "monthly" | "yearly" | "custom"` — `"one-time"` is valid and is the DB default
- `apiClient` is a hand-written wrapper in `api-client.ts` around `honoClient.bff.*` — new resources need a new entry added to `apiClient`
- `expenseKeys` has only `.all(slug)` and `.withId(slug, id)` — no `.list()`
- `zeroDecimalCurrencies` is from `@hoalu/countries` (not `@hoalu/common/currencies`)
- `SyncedExpense` (singular) is exported from `use-expenses.ts` — `SyncedExpenses` (plural) is NOT exported
- `useLiveQueryCategories` groups by `id, name, description, color` — `type` must be added to this `groupBy` after the collection schema gains the field
- `creator_id` in expense collection schema is `z.uuidv7()` (not nullable) — income collection matches this pattern
- `useExpenseStats` reads date range from Jotai atoms internally (`selectDateRangeAtom`, `customDateRangeAtom`) — do not pass dates as props

---

## File Map

### New files

| Path | Responsibility |
|---|---|
| `apps/api/src/routes/incomes/index.ts` | Hono route handlers for income CRUD |
| `apps/api/src/routes/incomes/repository.ts` | `IncomeRepository` class — DB queries |
| `apps/api/src/routes/incomes/schema.ts` | Zod schemas for income validation |
| `apps/app/src/lib/collections/income.ts` | Electric SQL collection factory |
| `apps/app/src/atoms/income-filters.ts` | Jotai atoms for income filter state |
| `apps/app/src/components/incomes/use-incomes.ts` | Live query hook + stats |
| `apps/app/src/components/incomes/income-list.tsx` | Virtualized list with date grouping |
| `apps/app/src/components/incomes/income-content.tsx` | Individual list row component |
| `apps/app/src/components/incomes/income-details.tsx` | Right panel with edit form |
| `apps/app/src/components/incomes/income-actions.tsx` | Create / Edit / Delete dialogs |
| `apps/app/src/components/incomes/income-filter.tsx` | Filter popover |
| `apps/app/src/components/charts/income-expense-comparison.tsx` | Monthly grouped bar chart |
| `apps/app/src/routes/_dashboard/$slug/incomes.tsx` | Income page route |

### Modified files

| Path | What changes |
|---|---|
| `apps/api/src/db/schema.ts` | Add `categoryTypeEnum`, `type` to `category`, new `income` table |
| `apps/api/src/routes/categories/schema.ts` | Add `type` to all category schemas |
| `apps/api/src/routes/categories/repository.ts` | Accept optional `type` filter; total count uses both tables |
| `apps/api/src/routes/categories/index.ts` | Pass `?type` param; return `type` in responses |
| `apps/api/src/modules/sync.ts` | Add `/sync/incomes` proxy endpoint |
| `apps/api/src/modules/api.ts` | Register `/incomes` route in the `/bff` chain |
| `apps/app/src/lib/collections/category.ts` | Add `type` to collection schema |
| `apps/app/src/lib/collections/index.ts` | Export `clearIncomeCollection`; add to cleanup functions |
| `apps/app/src/lib/schema.ts` | Add `IncomeFormSchema`; `type` to `CategoryFormSchema`; `IncomeSchema`/`IncomePostSchema`/`IncomePatchSchema` (RPC-inferred) |
| `apps/app/src/lib/api-client.ts` | Add `incomes` wrapper object to `apiClient` |
| `apps/app/src/lib/query-key-factory.ts` | Add `incomeKeys` following `expenseKeys` pattern |
| `apps/app/src/components/categories/use-categories.ts` | Add `type` to `groupBy`/`select`; optional type filter in return |
| `apps/app/src/components/categories/category-table.tsx` | Type badge + tab UI |
| `apps/app/src/components/categories/category-actions.tsx` | `type` prop on `CreateCategoryForm` |
| `apps/app/src/components/forms/select-category.tsx` | Accept `type` prop; filter categories |
| `apps/app/src/components/expenses/expense-actions.tsx` | Add explicit `type="expense"` to `SelectCategoryField` |
| `apps/app/src/services/mutations.ts` | Add income mutations |
| `apps/app/src/services/query-options.ts` | Add `getIncomesQueryOptions` |
| `apps/app/src/components/layouts/nav-workspace.tsx` | Add Income nav item |
| `apps/app/src/routes/_dashboard/$slug/index.tsx` | Add net balance card + comparison chart |

---

## Task 1: Database Schema — Category Type Flag

**Files:**
- Modify: `apps/api/src/db/schema.ts`

### Steps

- [ ] **1.1** Open `apps/api/src/db/schema.ts`. Find the existing enum declarations. Add `categoryTypeEnum` after the existing enums:

```typescript
export const categoryTypeEnum = pgEnum("category_type_enum", ["expense", "income"]);
```

- [ ] **1.2** Find the `category` table definition. Add the `type` column and replace the old unique constraint with one that includes `type` (allowing the same name in different types):

```typescript
export const category = pgTable(
  "category",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    color: colorTypeEnum("color").default("gray").notNull(),
    type: categoryTypeEnum("type").default("expense").notNull(),  // ADD
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("category_workspace_id_idx").on(table.workspaceId),
    // Replace old unique(workspace_id, name) with this:
    unique("category_workspace_name_type_unique").on(table.workspaceId, table.name, table.type),
  ],
);
```

- [ ] **1.3** Generate the migration:

```bash
cd apps/api && bun run db:generate
```

Expected: new file in `apps/api/migrations/` adding the enum, column, and replacing the unique constraint.

- [ ] **1.4** Inspect the generated SQL. Verify it:
  - Creates `category_type_enum` with `('expense', 'income')`
  - Adds `type category_type_enum NOT NULL DEFAULT 'expense'`
  - Drops old unique and creates new `(workspace_id, name, type)` unique

- [ ] **1.5** Apply the migration:

```bash
bun run db:migrate
```

- [ ] **1.6** Commit:

```bash
git add apps/api/src/db/schema.ts apps/api/migrations/
git commit -m "feat(db): add category type flag (expense|income)"
```

---

## Task 2: Database Schema — Income Table

**Files:**
- Modify: `apps/api/src/db/schema.ts`

### Steps

- [ ] **2.1** Add the `income` table after the `expense` table definition. The `repeat` column is included now (value `"one-time"` is valid per the verified enum) to make the schema future-ready for recurring income without a later migration:

```typescript
export const income = pgTable(
  "income",
  {
    id: uuid("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    amount: numeric("amount", { precision: 20, scale: 6 }).notNull(),
    repeat: repeatEnum("repeat").default("one-time").notNull(),  // future-ready; UI always sends "one-time" for now
    creatorId: uuid("creator_id").references(() => user.id, { onDelete: "set null" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => wallet.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("income_workspace_id_idx").on(table.workspaceId),
    index("income_wallet_id_idx").on(table.walletId),
    index("income_date_idx").on(table.date),
  ],
);
```

- [ ] **2.2** Generate and apply the migration:

```bash
bun run db:generate && bun run db:migrate
```

- [ ] **2.3** Commit:

```bash
git add apps/api/src/db/schema.ts apps/api/migrations/
git commit -m "feat(db): add income table"
```

---

## Task 3: Income API Routes

**Files:**
- Create: `apps/api/src/routes/incomes/schema.ts`
- Create: `apps/api/src/routes/incomes/repository.ts`
- Create: `apps/api/src/routes/incomes/index.ts`
- Modify: `apps/api/src/modules/api.ts`

### Steps

- [ ] **3.1** Create `apps/api/src/routes/incomes/schema.ts`. Use `z.iso.datetime()` for dates (Zod v4). The `repeat` field is included as optional so the API can accept it in future (UI always sends `"one-time"` for now):

```typescript
import * as z from "zod";
import { CurrencySchema, RepeatSchema } from "@hoalu/common/schema";

export const InsertIncomeSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.iso.datetime(),
  currency: CurrencySchema,
  amount: z.coerce.number().positive(),
  repeat: RepeatSchema.optional().default("one-time"),
  walletId: z.uuidv7(),
  categoryId: z.uuidv7().optional(),
  workspaceId: z.uuidv7(),
});

export const UpdateIncomeSchema = InsertIncomeSchema.omit({ workspaceId: true }).partial();

export const IncomeSchema = z.object({
  id: z.uuidv7(),
  title: z.string(),
  description: z.string().nullable(),
  date: z.string(),
  currency: CurrencySchema,
  amount: z.coerce.number(),
  repeat: RepeatSchema,
  walletId: z.uuidv7(),
  categoryId: z.uuidv7().nullable(),
  workspaceId: z.uuidv7(),
  creatorId: z.uuidv7().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const IncomesSchema = z.array(IncomeSchema);

export const LiteIncomeSchema = z.object({
  id: z.uuidv7(),
  title: z.string(),
  amount: z.coerce.number(),
  currency: CurrencySchema,
});

export const DeleteIncomeSchema = z.object({
  id: z.uuidv7(),
});
```

- [ ] **3.2** Create `apps/api/src/routes/incomes/repository.ts` (mirror `expenses/repository.ts`):

```typescript
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "#api/db/index.ts";

type NewIncome = typeof schema.income.$inferInsert;

export class IncomeRepository {
  async findAllByWorkspaceId(param: { workspaceId: string }) {
    return db
      .select()
      .from(schema.income)
      .where(eq(schema.income.workspaceId, param.workspaceId))
      .orderBy(desc(schema.income.date));
  }

  async findOne(param: { id: string; workspaceId: string }) {
    const [result] = await db
      .select()
      .from(schema.income)
      .where(and(eq(schema.income.id, param.id), eq(schema.income.workspaceId, param.workspaceId)));
    return result ?? null;
  }

  async insert(param: NewIncome) {
    try {
      const [result] = await db.insert(schema.income).values(param).returning();
      return result;
    } catch (_error) {
      return null;
    }
  }

  async update<T>(param: { id: string; workspaceId: string; payload: T }) {
    try {
      const [result] = await db
        .update(schema.income)
        .set({ ...param.payload, updatedAt: new Date() })
        .where(and(eq(schema.income.id, param.id), eq(schema.income.workspaceId, param.workspaceId)))
        .returning();
      return result ?? null;
    } catch (_error) {
      return null;
    }
  }

  async delete(param: { id: string; workspaceId: string }) {
    await db
      .delete(schema.income)
      .where(and(eq(schema.income.id, param.id), eq(schema.income.workspaceId, param.workspaceId)));
    return { id: param.id };
  }
}
```

- [ ] **3.3** Read `apps/api/src/routes/expenses/index.ts` fully before writing income's `index.ts` — note the exact import paths for `createIssueMsg`, `createHonoInstance`, `idParamValidator`, `jsonBodyValidator`, `workspaceQueryValidator`. Then create `apps/api/src/routes/incomes/index.ts`:

  **Critical patterns verified from expenses route:**
  - Middleware order: `workspaceQueryValidator` → `workspaceMember` → `jsonBodyValidator` → handler
  - Creator: `const user = c.get("user")` (not `c.get("session")`)
  - ID generation: `generateId({ use: "uuid" })` (with argument)
  - All handlers `safeParse` the response before returning; on failure return `UNPROCESSABLE_ENTITY` with `createIssueMsg(parsed.error.issues)`

```typescript
import { HTTPException } from "hono/http-exception";
import { describeRoute } from "hono-openapi";

import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
// Copy exact createIssueMsg import path from expenses/index.ts

import { createHonoInstance } from "#api/lib/create-app.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import { IncomeRepository } from "#api/routes/incomes/repository.ts";
import {
  DeleteIncomeSchema,
  IncomesSchema,
  IncomeSchema,
  InsertIncomeSchema,
  LiteIncomeSchema,
  UpdateIncomeSchema,
} from "#api/routes/incomes/schema.ts";
import { idParamValidator } from "#api/validators/id-param.ts";
import { jsonBodyValidator } from "#api/validators/json-body.ts";
import { workspaceQueryValidator } from "#api/validators/workspace-query.ts";

const app = createHonoInstance();
const repository = new IncomeRepository();
const TAGS = ["Incomes"];

const route = app
  .get("/", describeRoute({ tags: TAGS, summary: "Get all incomes" }),
    workspaceQueryValidator, workspaceMember,
    async (c) => {
      const workspace = c.get("workspace");
      const data = await repository.findAllByWorkspaceId({ workspaceId: workspace.id });
      const parsed = IncomesSchema.safeParse(data);
      if (!parsed.success) return c.json({ message: createIssueMsg(parsed.error.issues) }, HTTPStatus.codes.UNPROCESSABLE_ENTITY);
      return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
    })
  .get("/:id", describeRoute({ tags: TAGS, summary: "Get income by ID" }),
    idParamValidator, workspaceQueryValidator, workspaceMember,
    async (c) => {
      const workspace = c.get("workspace");
      const { id } = c.req.valid("param");
      const data = await repository.findOne({ id, workspaceId: workspace.id });
      if (!data) throw new HTTPException(HTTPStatus.codes.NOT_FOUND, { message: "Income not found" });
      const parsed = IncomeSchema.safeParse(data);
      if (!parsed.success) return c.json({ message: createIssueMsg(parsed.error.issues) }, HTTPStatus.codes.UNPROCESSABLE_ENTITY);
      return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
    })
  .post("/", describeRoute({ tags: TAGS, summary: "Create income" }),
    workspaceQueryValidator, workspaceMember, jsonBodyValidator(InsertIncomeSchema),
    async (c) => {
      const user = c.get("user");
      if (!user) throw new HTTPException(HTTPStatus.codes.UNAUTHORIZED, { message: HTTPStatus.phrases.UNAUTHORIZED });
      const workspace = c.get("workspace");
      const body = c.req.valid("json");
      const income = await repository.insert({
        ...body,
        id: generateId({ use: "uuid" }),
        creatorId: user.id,
        workspaceId: workspace.id,
      });
      if (!income) throw new HTTPException(HTTPStatus.codes.INTERNAL_SERVER_ERROR, { message: "Failed to create income" });
      const parsed = LiteIncomeSchema.safeParse(income);
      if (!parsed.success) return c.json({ message: createIssueMsg(parsed.error.issues) }, HTTPStatus.codes.UNPROCESSABLE_ENTITY);
      return c.json({ data: parsed.data }, HTTPStatus.codes.CREATED);
    })
  .patch("/:id", describeRoute({ tags: TAGS, summary: "Update income" }),
    idParamValidator, workspaceQueryValidator, workspaceMember, jsonBodyValidator(UpdateIncomeSchema),
    async (c) => {
      const workspace = c.get("workspace");
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");
      const income = await repository.update({ id, workspaceId: workspace.id, payload: body });
      if (!income) throw new HTTPException(HTTPStatus.codes.NOT_FOUND, { message: "Income not found" });
      const parsed = LiteIncomeSchema.safeParse(income);
      if (!parsed.success) return c.json({ message: createIssueMsg(parsed.error.issues) }, HTTPStatus.codes.UNPROCESSABLE_ENTITY);
      return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
    })
  .delete("/:id", describeRoute({ tags: TAGS, summary: "Delete income" }),
    idParamValidator, workspaceQueryValidator, workspaceMember,
    async (c) => {
      const workspace = c.get("workspace");
      const { id } = c.req.valid("param");
      const existing = await repository.findOne({ id, workspaceId: workspace.id });
      if (!existing) throw new HTTPException(HTTPStatus.codes.NOT_FOUND, { message: "Income not found" });
      const data = await repository.delete({ id, workspaceId: workspace.id });
      const parsed = DeleteIncomeSchema.safeParse(data);
      if (!parsed.success) return c.json({ message: createIssueMsg(parsed.error.issues) }, HTTPStatus.codes.UNPROCESSABLE_ENTITY);
      return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
    });

export default route;
```

- [ ] **3.4** Open `apps/api/src/modules/api.ts`. The app uses `.basePath("/bff")`. Register the income route inside the same chain — use `.route("/incomes", incomeRoute)` (no `/api` prefix):

```typescript
import incomeRoute from "#api/routes/incomes/index.ts";
// Inside the createHonoInstance().basePath("/bff") chain:
.route("/incomes", incomeRoute)
```

- [ ] **3.5** Restart the dev server and test:

```bash
# from project root
bun run dev

# The Caddy proxy maps /api → /bff, so externally this is /api/incomes
curl "https://hoalu.localhost/api/incomes?workspaceIdOrSlug=<your-slug>" \
  -H "Cookie: <your session cookie>"
```

Expected: `{ "data": [] }` HTTP 200.

- [ ] **3.6** Commit:

```bash
git add apps/api/src/routes/incomes/ apps/api/src/modules/api.ts
git commit -m "feat(api): add income CRUD routes"
```

---

## Task 4: Update Category API for Type Flag

**Files:**
- Modify: `apps/api/src/routes/categories/schema.ts`
- Modify: `apps/api/src/routes/categories/repository.ts`
- Modify: `apps/api/src/routes/categories/index.ts`

### Steps

- [ ] **4.1** Read `apps/api/src/routes/categories/schema.ts` fully. Add `type` to all schemas:

```typescript
const CategoryTypeSchema = z.enum(["expense", "income"]);

// In InsertCategorySchema add:
type: CategoryTypeSchema.default("expense"),

// In CategorySchema (response) add:
type: CategoryTypeSchema,

// In LiteCategorySchema (returned on create/update) add:
type: CategoryTypeSchema,
```

- [ ] **4.2** Read `apps/api/src/routes/categories/repository.ts` fully. Update `findAllByWorkspaceId` to accept optional `type` filter. The `total` is a count of linked records — keep it as a combined count across both tables (a category can only be one type, so at most one subquery will return a non-zero count):

```typescript
async findAllByWorkspaceId(param: { workspaceId: string; type?: "expense" | "income" }) {
  return db
    .select({
      id: schema.category.id,
      name: schema.category.name,
      description: schema.category.description,
      color: schema.category.color,
      type: schema.category.type,
      workspaceId: schema.category.workspaceId,
      total: sql<number>`(
        SELECT COUNT(*)::int FROM expense
        WHERE expense.category_id = ${schema.category.id}
        AND expense.workspace_id = ${param.workspaceId}
      ) + (
        SELECT COUNT(*)::int FROM income
        WHERE income.category_id = ${schema.category.id}
        AND income.workspace_id = ${param.workspaceId}
      )`.as("total"),
    })
    .from(schema.category)
    .where(
      param.type
        ? and(
            eq(schema.category.workspaceId, param.workspaceId),
            eq(schema.category.type, param.type),
          )
        : eq(schema.category.workspaceId, param.workspaceId),
    )
    .orderBy(schema.category.name);
}
```

> Adapt to match the existing Drizzle query structure in the file — `sql` template tag is from `drizzle-orm`.

- [ ] **4.3** In `apps/api/src/routes/categories/index.ts`, update the `GET /` handler to pass the optional `type` query param, and ensure the `POST /` handler passes `body.type` to the insert:

```typescript
// GET / — add type param:
const typeParam = c.req.query("type") as "expense" | "income" | undefined;
const data = await repository.findAllByWorkspaceId({ workspaceId: workspace.id, type: typeParam });

// POST / — body.type is automatically included since InsertCategorySchema now has it
```

- [ ] **4.4** Verify:

```bash
curl "https://hoalu.localhost/api/categories?workspaceIdOrSlug=<slug>&type=income"
# Expected: [] (no income categories yet)

curl "https://hoalu.localhost/api/categories?workspaceIdOrSlug=<slug>&type=expense"
# Expected: existing categories, each with "type": "expense"
```

- [ ] **4.5** Commit:

```bash
git add apps/api/src/routes/categories/
git commit -m "feat(api): add type field to categories"
```

---

## Task 5: Electric SQL Sync for Income

**Files:**
- Modify: `apps/api/src/modules/sync.ts`

### Steps

- [ ] **5.1** Read `apps/api/src/modules/sync.ts` fully. `proxyElectricRequest` returns `[data, headers]` — the handler must call `c.json(data, HTTPStatus.codes.OK, headers.toJSON())`. Add the income endpoint following the exact expenses pattern:

```typescript
.get(
  "/incomes",
  workspaceQueryValidator,
  workspaceMember,
  async (c) => {
    const workspace = c.get("workspace");
    const shapeUrl = prepareElectricUrl(c.req.url);
    const whereClause = `workspace_id = '${workspace.id}'`;

    shapeUrl.searchParams.set("table", "income");
    shapeUrl.searchParams.set("where", whereClause);

    const [data, headers] = await proxyElectricRequest(shapeUrl);
    return c.json(data, HTTPStatus.codes.OK, headers.toJSON());
  },
)
```

- [ ] **5.2** Commit:

```bash
git add apps/api/src/modules/sync.ts
git commit -m "feat(sync): add income Electric SQL sync endpoint"
```

---

## Task 6: Frontend — Update Category Collection & Schemas

**Files:**
- Modify: `apps/app/src/lib/collections/category.ts`
- Modify: `apps/app/src/lib/schema.ts`

### Steps

- [ ] **6.1** Open `apps/app/src/lib/collections/category.ts`. Add `type` to the schema:

```typescript
// In CategoryCollectionSchema z.object({...}), add:
type: z.enum(["expense", "income"]),
```

- [ ] **6.2** Open `apps/app/src/lib/schema.ts`. Find `CategoryFormSchema` and add `type`:

```typescript
// In CategoryFormSchema add:
type: z.enum(["expense", "income"]).default("expense"),
```

Add `IncomeFormSchema` (standalone Zod — same pattern as `ExpenseFormSchema`, used by TanStack Form):

```typescript
export const IncomeFormSchema = z.object({
  title: z.string().min(1),
  description: z.optional(z.string()),
  transaction: z.object({
    value: z.number().positive(),
    currency: z.string(),
  }),
  date: z.iso.datetime(),
  walletId: z.uuidv7(),
  categoryId: z.uuidv7().optional(),
});
export type IncomeFormSchema = z.infer<typeof IncomeFormSchema>;
```

> **`IncomeSchema`, `IncomePostSchema`, `IncomePatchSchema`** — these are RPC-inferred types, NOT standalone Zod schemas. Add them AFTER Task 3 is complete and you've restarted the dev server to regenerate `api-client.ts`:

```typescript
// Add after api-client.ts regenerates (after Task 3 dev server restart):
export type IncomeSchema = InferResponseType<
  typeof honoClient.bff.incomes.$get,
  200
>["data"][number];

export type IncomePostSchema = InferRequestType<typeof honoClient.bff.incomes.$post>["json"];
export type IncomePatchSchema = InferRequestType<
  (typeof honoClient.bff.incomes)[":id"]["$patch"]
>["json"];
```

- [ ] **6.3** Commit:

```bash
git add apps/app/src/lib/collections/category.ts apps/app/src/lib/schema.ts
git commit -m "feat(frontend): add category type and income schemas"
```

---

## Task 7: Frontend — Income Collection

**Files:**
- Create: `apps/app/src/lib/collections/income.ts`
- Modify: `apps/app/src/lib/collections/index.ts`

### Steps

- [ ] **7.1** Read `apps/app/src/lib/collections/expense.ts` fully. Note that `creator_id` is `z.uuidv7()` (not nullable) — match that pattern. Create `apps/app/src/lib/collections/income.ts`:

```typescript
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

import { CurrencySchema, IsoDateSchema, RepeatSchema } from "@hoalu/common/schema";
import { createCollectionFactory } from "#app/lib/collections/create-collection-factory.ts";

const IncomeCollectionSchema = z.object({
  id: z.uuidv7(),
  title: z.string(),
  description: z.string().nullable(),
  amount: z.coerce.number(),
  currency: CurrencySchema,
  repeat: RepeatSchema,
  date: IsoDateSchema,
  wallet_id: z.uuidv7(),
  category_id: z.uuidv7().nullable(),
  creator_id: z.uuidv7(),   // matches expense collection pattern (not nullable)
  created_at: IsoDateSchema,
  updated_at: IsoDateSchema,
});

export type IncomeCollectionItem = z.infer<typeof IncomeCollectionSchema>;

const factory = createCollectionFactory("income", (slug: string) =>
  createCollection(
    electricCollectionOptions({
      id: `income-${slug}`,
      getKey: (item) => item.id,
      shapeOptions: {
        url: `${import.meta.env.PUBLIC_API_URL}/sync/incomes?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
      },
      schema: IncomeCollectionSchema,
    }),
  ),
);

export const incomeCollectionFactory = factory.get;
export const clearIncomeCollection = factory.clear;
```

- [ ] **7.2** Open `apps/app/src/lib/collections/index.ts`. Read the full file. Add income collection to exports and both cleanup functions:

```typescript
// Add export:
export { clearIncomeCollection } from "./income.ts";

// In clearWorkspaceCollections(slug: string), add:
clearIncomeCollection(slug);

// In clearAllWorkspaceCollections(), add:
clearIncomeCollection();
```

- [ ] **7.3** Commit:

```bash
git add apps/app/src/lib/collections/income.ts apps/app/src/lib/collections/index.ts
git commit -m "feat(frontend): add income Electric SQL collection"
```

---

## Task 8: Add `apiClient.incomes` and `incomeKeys`

**Files:**
- Modify: `apps/app/src/lib/api-client.ts`
- Modify: `apps/app/src/lib/query-key-factory.ts`

### Steps

- [ ] **8.1** Open `apps/app/src/lib/api-client.ts`. Read the full file. The `apiClient` object is a hand-written wrapper at the bottom of the file. Each resource (e.g., `expenses`) is a plain object of async functions that call `honoClient.bff.*`. Add an `incomes` object following the exact same pattern:

```typescript
// Add import at top of file (after api-client.ts regenerates and IncomePostSchema/IncomePatchSchema are available):
import type { IncomePostSchema, IncomePatchSchema } from "#app/lib/schema.ts";

// Add the incomes wrapper object (mirror the expenses object shape):
const incomes = {
  list: async (slug: string) => {
    const response = await honoClient.bff.incomes.$get({
      query: { workspaceIdOrSlug: slug },
    });
    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(message);
    }
    const { data } = await response.json();
    return data;
  },
  create: async (slug: string, payload: IncomePostSchema) => {
    const response = await honoClient.bff.incomes.$post({
      query: { workspaceIdOrSlug: slug },
      json: payload,
    });
    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(message);
    }
    const { data } = await response.json();
    return data;
  },
  edit: async (slug: string, id: string, payload: IncomePatchSchema) => {
    const response = await honoClient.bff.incomes[":id"].$patch({
      query: { workspaceIdOrSlug: slug },
      param: { id },
      json: payload,
    });
    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(message);
    }
    const { data } = await response.json();
    return data;
  },
  delete: async (slug: string, id: string) => {
    const response = await honoClient.bff.incomes[":id"].$delete({
      query: { workspaceIdOrSlug: slug },
      param: { id },
    });
    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(message);
    }
    const { data } = await response.json();
    return data;
  },
};

// Add `incomes` to the exported apiClient object:
export const apiClient = {
  tasks,
  wallets,
  categories,
  expenses,
  exchangeRates,
  files,
  workspaces,
  recurringBills,
  incomes,  // ADD
};
```

> **Note:** `honoClient.bff.incomes` will only be available after Task 3 is complete and the dev server has been restarted (which regenerates `api-client.ts`). Complete this task after that restart.

- [ ] **8.2** Open `apps/app/src/lib/query-key-factory.ts`. Read the `expenseKeys` definition. It has `.all(slug)` and `.withId(slug, id)`. Add `incomeKeys` following the exact same shape:

```typescript
export const incomeKeys = {
  all: (slug: string) => incomeKeys["~withWorkspace"](slug),
  withId: (slug: string, id: string) => [...incomeKeys.all(slug), "id", id] as const,
  "~withWorkspace": (slug: string) => [...workspaceKeys.withSlug(slug), "incomes"] as const,
};
```

- [ ] **8.3** Commit:

```bash
git add apps/app/src/lib/api-client.ts apps/app/src/lib/query-key-factory.ts
git commit -m "feat(frontend): add income API client wrapper and query keys"
```

---

## Task 9: Update Category Components for Type Flag

**Files:**
- Modify: `apps/app/src/components/categories/use-categories.ts`
- Modify: `apps/app/src/components/categories/category-actions.tsx`
- Modify: `apps/app/src/components/categories/category-table.tsx`
- Modify: `apps/app/src/components/forms/select-category.tsx`
- Modify: `apps/app/src/components/expenses/expense-actions.tsx`

### Steps

- [ ] **9.1** Open `apps/app/src/components/categories/use-categories.ts`. Read the full file. The live query groups by `[id, name, description, color]` and selects those 4 fields plus `total: count(category.id)`. Add `type` to BOTH the `groupBy` array AND the `select` object, then add the optional type filter in the return:

```typescript
export function useLiveQueryCategories(type?: "expense" | "income") {
  const workspace = useWorkspace();
  const expenseCollection = expenseCollectionFactory(workspace.slug);
  const categoryCollection = categoryCollectionFactory(workspace.slug);

  const { data } = useLiveQuery(
    (q) => {
      return q
        .from({ category: categoryCollection })
        .leftJoin({ expense: expenseCollection }, ({ category, expense }) =>
          eq(category.id, expense.category_id),
        )
        .groupBy(({ category }) => [
          category.id,
          category.name,
          category.description,
          category.color,
          category.type,  // ADD — must be in groupBy to be selectable
        ])
        .select(({ category }) => ({
          id: category.id,
          name: category.name,
          description: category.description,
          color: category.color,
          type: category.type,  // ADD
          total: count(category.id),
        }));
    },
    [workspace.slug],
  );

  // Apply type filter in the return value (not in the live query, to avoid resubscribing)
  if (!data) return data;
  return type ? data.filter((c) => c.type === type) : data;
}
```

- [ ] **9.2** Read `apps/app/src/components/forms/select-category.tsx` fully. Add a `type` prop (defaulting `"expense"`), pass to `useLiveQueryCategories`, and also to the inline `CreateCategoryForm`:

```typescript
interface SelectCategoryFieldProps {
  type?: "expense" | "income";
}

export function SelectCategoryField({ type = "expense" }: SelectCategoryFieldProps) {
  const categories = useLiveQueryCategories(type);
  // Pass type to inline CreateCategoryForm:
  // <CreateCategoryForm type={type} callback={...} />
  // rest unchanged
}
```

- [ ] **9.3** Read `apps/app/src/components/categories/category-actions.tsx` fully. Add `type` prop to `CreateCategoryForm` and include it in the form's default values and submission payload:

```typescript
interface CreateCategoryFormProps {
  type?: "expense" | "income";
  callback?: () => void;
}
export function CreateCategoryForm({ type = "expense", callback }: CreateCategoryFormProps) {
  // Set type as a default field value in TanStack Form
  // Ensure type is included in the mutation payload
}
```

- [ ] **9.4** Read `apps/app/src/components/categories/category-table.tsx` fully. Add a type badge to the name column and a tab switcher (Expenses / Income) at the top. Look at existing tab components used elsewhere in `apps/app/src/components/` for the correct component pattern.

- [ ] **9.5** Open `apps/app/src/components/expenses/expense-actions.tsx`. Find every `<SelectCategoryField />`. Add explicit `type="expense"`:

```tsx
<SelectCategoryField type="expense" />
```

- [ ] **9.6** Restart dev server. Navigate to Library → Categories. Verify Expenses tab shows existing categories, Income tab shows empty state, and the expense form still shows only expense categories.

- [ ] **9.7** Commit:

```bash
git add apps/app/src/components/categories/ apps/app/src/components/forms/select-category.tsx apps/app/src/components/expenses/expense-actions.tsx
git commit -m "feat(frontend): add type filter to category components"
```

---

## Task 10: Income Mutations & Query Options

**Files:**
- Modify: `apps/app/src/services/mutations.ts`
- Modify: `apps/app/src/services/query-options.ts`

### Steps

- [ ] **10.1** Read `apps/app/src/services/mutations.ts` fully. Study `useCreateExpense`, `useEditExpense`, `useDeleteExpense` for the exact haptics/toast/sound pattern. Add income mutations after the expense mutations, following the identical pattern:

```typescript
export function useCreateIncome() {
  const queryClient = useQueryClient();
  const { slug } = routeApi.useParams();
  return useMutation({
    mutationFn: async ({ payload }: { payload: IncomePostSchema }) => {
      return apiClient.incomes.create(slug, payload);
    },
    onSuccess: () => {
      haptics.trigger("success");
      playConfirmSound();
      toastManager.add({ title: "Income created.", type: "success" });
      queryClient.invalidateQueries({ queryKey: incomeKeys.all(slug) });
    },
    onError: (error) => {
      haptics.trigger("error");
      toastManager.add({ title: "Uh oh! Something went wrong.", description: error.message, type: "error" });
    },
  });
}

export function useEditIncome() {
  const queryClient = useQueryClient();
  const { slug } = routeApi.useParams();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: IncomePatchSchema }) => {
      return apiClient.incomes.edit(slug, id, payload);
    },
    onSuccess: () => {
      haptics.trigger("success");
      playConfirmSound();
      toastManager.add({ title: "Income updated.", type: "success" });
      queryClient.invalidateQueries({ queryKey: incomeKeys.all(slug) });
    },
    onError: (error) => {
      haptics.trigger("error");
      toastManager.add({ title: "Uh oh! Something went wrong.", description: error.message, type: "error" });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  const { slug } = routeApi.useParams();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return apiClient.incomes.delete(slug, id);
    },
    onSuccess: () => {
      haptics.trigger("success");
      toastManager.add({ title: "Income deleted.", type: "success" });
      queryClient.invalidateQueries({ queryKey: incomeKeys.all(slug) });
    },
    onError: (error) => {
      haptics.trigger("error");
      toastManager.add({ title: "Uh oh! Something went wrong.", description: error.message, type: "error" });
    },
  });
}
```

Add the missing imports at the top: `IncomePostSchema`, `IncomePatchSchema` from `#app/lib/schema.ts`, and `incomeKeys` from `#app/lib/query-key-factory.ts`.

- [ ] **10.2** Open `apps/app/src/services/query-options.ts`. Add `getIncomesQueryOptions` following the existing pattern. Note: `incomeKeys` uses `.all(slug)` (not `.list()`):

```typescript
export const getIncomesQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: incomeKeys.all(slug),
    queryFn: async () => {
      return apiClient.incomes.list(slug);
    },
  });
```

- [ ] **10.3** Commit:

```bash
git add apps/app/src/services/mutations.ts apps/app/src/services/query-options.ts
git commit -m "feat(frontend): add income mutations and query options"
```

---

## Task 11: Income Live Query Hook

**Files:**
- Create: `apps/app/src/components/incomes/use-incomes.ts`

### Steps

- [ ] **11.1** Read `apps/app/src/components/expenses/use-expenses.ts` lines 1–300 fully. Note:
  - `zeroDecimalCurrencies` is from `@hoalu/countries` (not `@hoalu/common/currencies`)
  - `exchangeRateCollection` export name — read from `collections/index.ts`
  - The FX `lookupExchangeRate` and `calculateCrossRate` imports — copy exactly from the expenses hook
  - `useExpenseStats` reads date range from Jotai atoms internally — `useIncomeStats` does the same

Create `apps/app/src/components/incomes/use-incomes.ts`. The hook includes the full FX conversion to produce `convertedAmount` (required for dashboard comparison chart):

```typescript
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

// Copy exact import paths from use-expenses.ts:
import { calculateCrossRate, lookupExchangeRate } from "@hoalu/common/exchange-rate";
import { datetime } from "@hoalu/common/datetime";
import { monetary } from "@hoalu/common/monetary";
import { zeroDecimalCurrencies } from "@hoalu/countries";  // verified import

import { selectDateRangeAtom, customDateRangeAtom } from "#app/atoms/filters.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { categoryCollectionFactory } from "#app/lib/collections/category.ts";
// Copy exchangeRateCollection import path from use-expenses.ts
import { incomeCollectionFactory } from "#app/lib/collections/income.ts";
import { walletCollectionFactory } from "#app/lib/collections/wallet.ts";

export function useLiveQueryIncomes() {
  const workspace = useWorkspace();

  const { data: incomesData } = useLiveQuery(
    (q) =>
      q
        .from({ income: incomeCollectionFactory(workspace.slug) })
        .innerJoin(
          { wallet: walletCollectionFactory(workspace.slug) },
          ({ income, wallet }) => eq(income.wallet_id, wallet.id),
        )
        .leftJoin(
          { category: categoryCollectionFactory(workspace.slug) },
          ({ income, category }) => eq(income.category_id, category.id),
        )
        .orderBy(({ income }) => income.date, "desc")
        .select(({ income, wallet, category }) => ({
          ...income,
          category: category
            ? { id: category.id, name: category.name, color: category.color }
            : null,
          wallet: { id: wallet.id, name: wallet.name, currency: wallet.currency, type: wallet.type },
        })),
    [workspace.slug],
  );

  // FX rate data — same live query as in use-expenses.ts (copy exact form)
  const { data: fxRateData } = useLiveQuery(/* ... copy from use-expenses.ts ... */);

  return useMemo(() => {
    if (!incomesData || !fxRateData) return [];

    return incomesData.map((income) => {
      // FX conversion — copy the exact lookupExchangeRate call from use-expenses.ts
      const exchangeRate = lookupExchangeRate(
        { /* findDirect, findCrossRate — copy exactly from use-expenses.ts */ },
        [income.currency, workspace.metadata.currency],
        income.created_at,
      );

      const isNoCent = zeroDecimalCurrencies.find((c) => c === income.currency);
      const factor = isNoCent ? 1 : 100;
      const convertedAmount = income.amount * ((exchangeRate ? Number(exchangeRate.exchangeRate) : 0) / factor);

      return {
        ...income,
        date: datetime.format(income.date, "yyyy-MM-dd"),
        amount: monetary.fromRealAmount(Number(income.amount), income.currency),
        realAmount: Number(income.amount),
        convertedAmount,  // required for dashboard comparison chart
      };
    });
  }, [incomesData, fxRateData, workspace.metadata.currency]);
}

export type IncomesClient = ReturnType<typeof useLiveQueryIncomes>;
export type IncomeClient = IncomesClient[number];
```

Also add `useIncomeStats` to the same file. This reads date range from atoms directly (same as `useExpenseStats`) to avoid unnecessary recomputation from new object references:

```typescript
export function useIncomeStats(incomes: IncomeClient[]) {
  const workspace = useWorkspace();
  const dateRange = useAtomValue(selectDateRangeAtom);
  const customRange = useAtomValue(customDateRangeAtom);

  return useMemo(() => {
    // Copy the date range resolution logic from useExpenseStats
    // Filter incomes to current period and previous period
    // Return { total, change } (same shape as useExpenseStats's amount field)
  }, [incomes, dateRange, customRange, workspace.metadata.currency]);
}
```

- [ ] **11.2** Commit:

```bash
git add apps/app/src/components/incomes/use-incomes.ts
git commit -m "feat(frontend): add income live query hook with FX conversion"
```

---

## Task 12: Income List Components

**Files:**
- Create: `apps/app/src/components/incomes/income-content.tsx`
- Create: `apps/app/src/components/incomes/income-list.tsx`

### Steps

- [ ] **12.1** Read `apps/app/src/components/expenses/expense-content.tsx` fully. Create `apps/app/src/components/incomes/income-content.tsx` mirroring it. The key visual difference: income amounts displayed in **green** (positive cash flow). Find the amount color class in the expense component and swap it for the green equivalent from the design system.

- [ ] **12.2** Read `apps/app/src/components/expenses/expense-list.tsx` fully. Create `apps/app/src/components/incomes/income-list.tsx` mirroring it exactly — same `useVirtualizer` setup, date grouping, keyboard navigation (`j`/`k`/`Esc`). Import `IncomeClient` and `income-content.tsx` instead of their expense equivalents. Group header totals in green.

- [ ] **12.3** Commit:

```bash
git add apps/app/src/components/incomes/income-content.tsx apps/app/src/components/incomes/income-list.tsx
git commit -m "feat(frontend): add income list components"
```

---

## Task 13: Income Actions (Create / Edit / Delete)

**Files:**
- Create: `apps/app/src/components/incomes/income-actions.tsx`

### Steps

- [ ] **13.1** Read `apps/app/src/components/expenses/expense-actions.tsx` fully. Create `apps/app/src/components/incomes/income-actions.tsx`. Key differences from expenses:

  - **No `recurringBillId` field** — income doesn't link to recurring bills
  - **No `repeat` field in UI** — always send `"one-time"` in the payload silently
  - **No file attachments** — remove `FilesCompactUpload`
  - **`<SelectCategoryField type="income" />`** — critical: must pass `type="income"`
  - Title, amount (`TransactionAmountField`), walletId, categoryId, description, date are identical to expenses

  Form fields:
  ```
  title (required)
  transaction { value, currency } (required) — TransactionAmountField
  walletId (required)
  categoryId (optional, income categories only via type="income")
  description (optional rich text — TiptapField)
  date (required — DatepickerInputField + DatepickerField)
  ```

- [ ] **13.2** Commit:

```bash
git add apps/app/src/components/incomes/income-actions.tsx
git commit -m "feat(frontend): add income create/edit/delete dialogs"
```

---

## Task 14: Income Details Panel, Filter Atoms & Filter Component

**Files:**
- Create: `apps/app/src/atoms/income-filters.ts`
- Create: `apps/app/src/components/incomes/income-details.tsx`
- Create: `apps/app/src/components/incomes/income-filter.tsx`

### Steps

- [ ] **14.1** Read `apps/app/src/atoms/filters.ts` fully. Create `apps/app/src/atoms/income-filters.ts` with income-specific filter atoms:

```typescript
import { atom } from "jotai";

export const selectedIncomeAtom = atom<{ id: string | null }>({ id: null });
export const incomeCategoryFilterAtom = atom<string[]>([]);
export const incomeWalletFilterAtom = atom<string[]>([]);
export const incomeAmountFilterAtom = atom<{ min: number | null; max: number | null }>({
  min: null,
  max: null,
});
export const incomeSearchKeywordsAtom = atom<string>("");
```

Date range is shared with the rest of the dashboard via `selectDateRangeAtom` / `customDateRangeAtom` from `filters.ts` — no need to duplicate.

- [ ] **14.2** Read `apps/app/src/components/expenses/expense-details.tsx` fully. Create `apps/app/src/components/incomes/income-details.tsx` mirroring it. The panel shows the selected income (from `selectedIncomeAtom`) with `EditIncomeForm` inline and a delete button.

- [ ] **14.3** Read `apps/app/src/components/expenses/expense-filter-dropdown.tsx` fully. Create `apps/app/src/components/incomes/income-filter.tsx` mirroring it. Filter dimensions:
  - Search → `incomeSearchKeywordsAtom`
  - Date range → shared atoms from `filters.ts` (same as expenses use)
  - Amount → `incomeAmountFilterAtom`
  - Category → `incomeCategoryFilterAtom` (pass `type="income"` to category combobox)
  - Wallet → `incomeWalletFilterAtom`

- [ ] **14.4** Commit:

```bash
git add apps/app/src/atoms/income-filters.ts apps/app/src/components/incomes/income-details.tsx apps/app/src/components/incomes/income-filter.tsx
git commit -m "feat(frontend): add income details panel and filter"
```

---

## Task 15: Income Page Route

**Files:**
- Create: `apps/app/src/routes/_dashboard/$slug/incomes.tsx`

### Steps

- [ ] **15.1** Read `apps/app/src/routes/_dashboard/$slug/expenses.tsx` fully for the route structure and how filter atoms are applied to live query data. Create `apps/app/src/routes/_dashboard/$slug/incomes.tsx` mirroring it exactly, substituting income imports and atoms.

- [ ] **15.2** Restart dev server. Navigate to `https://hoalu.localhost/<your-slug>/incomes`. Verify the page renders with an empty income list.

- [ ] **15.3** Commit:

```bash
git add "apps/app/src/routes/_dashboard/\$slug/incomes.tsx"
git commit -m "feat(frontend): add income page route"
```

---

## Task 16: Add Income to Navigation

**Files:**
- Modify: `apps/app/src/components/layouts/nav-workspace.tsx`

### Steps

- [ ] **16.1** Read `apps/app/src/components/layouts/nav-workspace.tsx` fully. Icons come from **`@hoalu/icons/tabler`** — pick `TrendingUpIcon` or another appropriate icon from that package. Insert the Income nav item between Expenses and Recurring Bills, matching the exact JSX structure of existing items:

```tsx
// Mirror the Expenses <SidebarMenuItem> block exactly, changing to/icon/label:
<SidebarMenuItem>
  <SidebarMenuButton
    isActive={pathname === `/${params.slug}/incomes`}
    render={
      <Link to="/$slug/incomes" params={{ slug: params.slug }}>
        <TrendingUpIcon />
        <span>Income</span>
      </Link>
    }
  />
</SidebarMenuItem>
```

> Adapt to the actual JSX props and component API — do not guess. Copy from the Expenses item.

- [ ] **16.2** Mobile nav: the 3-tab mobile bottom nav (Dashboard, Expenses, Settings) does **not** need to change — Income is accessible via the sidebar on mobile only.

- [ ] **16.3** Verify: Income appears in the sidebar between Expenses and Recurring Bills. Clicking navigates to `/incomes`.

- [ ] **16.4** Commit:

```bash
git add apps/app/src/components/layouts/nav-workspace.tsx
git commit -m "feat(frontend): add income to sidebar navigation"
```

---

## Task 17: Dashboard — Net Balance Stat Card

**Files:**
- Modify: `apps/app/src/components/incomes/use-incomes.ts`
- Modify: `apps/app/src/routes/_dashboard/$slug/index.tsx`

### Steps

- [ ] **17.1** Read `apps/app/src/components/charts/expense-stats-row.tsx` fully. Understand how stat cards are composed and how `PercentageChangeDisplay` is used.

Modify `expense-stats-row.tsx` to optionally accept income stats and render a Net Balance card. Alternatively, create a standalone `net-balance-card.tsx` — use whichever approach fits the existing component structure. The Net Balance card shows:
  - Label: "Net Balance"
  - Value: `incomeTotal − expenseTotal` formatted in workspace currency
  - Green text if positive, red if negative
  - `PercentageChangeDisplay` for the prior-period change

- [ ] **17.2** Open `apps/app/src/routes/_dashboard/$slug/index.tsx`. Add `useLiveQueryIncomes()` and `useIncomeStats()`. Pass income data to the stats row for the Net Balance card.

- [ ] **17.3** Verify in browser: dashboard shows Net Balance card with `0`. Create an income entry, verify the card updates.

- [ ] **17.4** Commit:

```bash
git add apps/app/src/components/charts/ apps/app/src/routes/_dashboard/$slug/index.tsx
git commit -m "feat(dashboard): add net balance stat card"
```

---

## Task 18: Dashboard — Income vs Expense Comparison Chart

**Files:**
- Create: `apps/app/src/components/charts/income-expense-comparison.tsx`
- Modify: `apps/app/src/routes/_dashboard/$slug/index.tsx`

### Steps

- [ ] **18.1** Read `apps/app/src/components/charts/expenses-overview.tsx` fully — study the Recharts `BarChart` setup, `ResponsiveContainer`, tooltip formatting, Card wrapper, and color tokens.

Create `apps/app/src/components/charts/income-expense-comparison.tsx`. Note that `SyncedExpenses` is NOT exported from `use-expenses.ts` — use `SyncedExpense[]` (the exported singular type) for the prop type:

```typescript
import type { SyncedExpense } from "#app/components/expenses/use-expenses.ts";  // singular, exported
import type { IncomeClient } from "#app/components/incomes/use-incomes.ts";

interface IncomeExpenseComparisonProps {
  incomes: IncomeClient[];
  expenses: SyncedExpense[];  // use SyncedExpense[], NOT SyncedExpenses
  // date range is read from atoms internally (same as other chart components)
}
```

Chart specification:
- Recharts `BarChart` with two `Bar` series: income (green) + expenses (existing chart color)
- X-axis: months (`"MMM yyyy"` format, e.g. `"Jan 2026"`) if date range ≥ 60 days; otherwise daily (`"MMM d"`)
- Y-axis: workspace currency amounts (use `convertedAmount` from both hooks)
- Tooltip: shows income total, expense total, and net for that period
- `ResponsiveContainer` wrapping — same as `expenses-overview.tsx`
- Use `date-fns` for date manipulation (`eachMonthOfInterval`, `eachDayOfInterval`, `differenceInDays`, `format`) — verify these are used in `expenses-overview.tsx` first

- [ ] **18.2** Open `apps/app/src/routes/_dashboard/$slug/index.tsx`. Add the comparison chart below `ExpenseOverview`. The chart reads the date range from atoms internally, so just pass income and expense data:

```tsx
<IncomeExpenseComparison incomes={incomes} expenses={expenses} />
```

- [ ] **18.3** Verify: comparison chart renders on dashboard. Create an income entry and verify the income bar appears for the correct period.

- [ ] **18.4** Commit:

```bash
git add apps/app/src/components/charts/income-expense-comparison.tsx apps/app/src/routes/_dashboard/$slug/index.tsx
git commit -m "feat(dashboard): add income vs expense comparison chart"
```

---

## Task 19: Final QA Checklist

### Steps

- [ ] **19.1** Create an income category: Library → Categories → Income tab → Create. Verify it appears only in the Income tab.

- [ ] **19.2** Create an expense category: Library → Categories → Expenses tab → Create. Verify it appears only in the Expenses tab.

- [ ] **19.3** Open expense create form. Verify category picker shows only expense categories (regression).

- [ ] **19.4** Open income create form. Verify category picker shows only income categories.

- [ ] **19.5** Create an income entry. Verify:
  - Appears in the income list with green amount
  - Correct wallet and category shown
  - Dashboard Net Balance card updates
  - Dashboard comparison chart shows income bar for the correct period

- [ ] **19.6** Edit the income entry. Verify changes persist.

- [ ] **19.7** Delete the income entry. Verify it disappears.

- [ ] **19.8** Filter incomes by search text, category, wallet. Verify each filter works.

- [ ] **19.9** Verify expense list is unchanged (no categories missing, no regressions).

- [ ] **19.10** Restart dev server cold (`bun run dev`). Verify Electric SQL sync resumes and data rehydrates correctly from PGlite.

- [ ] **19.11** Final commit:

```bash
git add .
git commit -m "feat: income tracking feature complete"
```

---

## Implementation Order Summary

```
Task 1  → DB: category type flag
Task 2  → DB: income table
Task 3  → API: income CRUD routes + register in api.ts
          ↳ RESTART DEV SERVER HERE to regenerate api-client.ts
Task 4  → API: category type filter
Task 5  → API: Electric sync for income
Task 6  → Frontend: category collection + schemas (add RPC-inferred types after Task 3 restart)
Task 7  → Frontend: income collection + cleanup exports
Task 8  → Frontend: apiClient.incomes wrapper + incomeKeys (requires Task 3 restart)
Task 9  → Frontend: category components (useLiveQueryCategories groupBy fix, SelectCategoryField)
Task 10 → Frontend: income mutations + query options
Task 11 → Frontend: income live query hook (FX conversion + useIncomeStats reads atoms)
Task 12 → Frontend: income list components
Task 13 → Frontend: income action dialogs (create/edit/delete)
Task 14 → Frontend: income filter atoms + details panel + filter popover
Task 15 → Frontend: income page route
Task 16 → Frontend: navigation
Task 17 → Dashboard: net balance stat card
Task 18 → Dashboard: comparison chart
Task 19 → QA
```

**Backend tasks (1–5) can be completed and tested before frontend tasks (6–19).**

**Critical:** After Task 3, restart the dev server before completing Tasks 6 (RPC type aliases) and 8 (`apiClient.incomes` — requires `honoClient.bff.incomes` to exist).
