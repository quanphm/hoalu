# Income Feature Design Spec

**Date:** 2026-03-22  
**Status:** Approved

---

## Overview

Add income tracking to the Hoalu app as a **distinct concept** from expenses. Income has its own categories, its own list page, and is compared against expenses on the dashboard to enable cash flow visibility and future trend/savings planning.

Income is **not** a tagged expense. It is a separate entity that shares wallets with expenses (money flows in and out of the same wallet) but has a fully independent category system and UI.

---

## Goals

1. **Log income entries** — title, amount, currency, date, wallet, income-specific category, description
2. **Search / browse income** — dedicated Income page with list, filters, detail panel
3. **Compare with expenses** — dashboard shows income vs. expenses as monthly grouped bar chart + net balance stat card
4. **Prepare for future recurring income** — schema includes `repeat` column, UI defers it

---

## Out of Scope

- Recurring income UI (data model is ready, feature deferred)
- Wallet balance tracking (derived from income − expenses per wallet, future feature)
- Transfers between wallets

---

## Data Model

### New enum: `category_type_enum`

```sql
CREATE TYPE category_type_enum AS ENUM ('expense', 'income');
```

### Modified table: `category`

Add column:

```sql
ALTER TABLE category ADD COLUMN type category_type_enum NOT NULL DEFAULT 'expense';
```

All existing categories are backfilled as `'expense'`. The existing unique constraint `(workspace_id, name)` is **replaced** with `(workspace_id, name, type)` to allow the same name to exist in both income and expense categories (e.g. "Other" in both).

### New table: `income`

```sql
CREATE TABLE income (
  id             uuid PRIMARY KEY,
  title          text NOT NULL,
  description    text,
  date           timestamptz NOT NULL DEFAULT now(),
  currency       varchar(3) NOT NULL,
  amount         numeric(20,6) NOT NULL,
  repeat         repeat_enum NOT NULL DEFAULT 'one-time',
  creator_id     uuid REFERENCES "user"(id) ON DELETE SET NULL,
  workspace_id   uuid NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  wallet_id      uuid NOT NULL REFERENCES wallet(id) ON DELETE CASCADE,
  category_id    uuid REFERENCES category(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX income_workspace_id_idx ON income(workspace_id);
CREATE INDEX income_wallet_id_idx ON income(wallet_id);
CREATE INDEX income_date_idx ON income(date);
```

**Key design decisions:**
- `repeat` column included now (always `'one-time'` from UI), ready for future recurring income feature without a migration
- `category_id` references the same `category` table — but only income-type categories should be used (enforced at application layer)
- `wallet_id` is required — income flows into a wallet, matching how expenses flow out

---

## Backend Architecture

### New files

```
apps/api/src/routes/incomes/
  index.ts       — CRUD route handlers with OpenAPI docs
  repository.ts  — IncomeRepository class
  schema.ts      — Zod validation schemas
```

### Modified files

| File | Change |
|---|---|
| `apps/api/src/db/schema.ts` | Add `categoryTypeEnum`, `type` to `category` table, new `income` table |
| `apps/api/src/routes/categories/schema.ts` | Add `type` field to `InsertCategorySchema`, `UpdateCategorySchema`, `CategorySchema`, `LiteCategorySchema` |
| `apps/api/src/routes/categories/repository.ts` | Accept optional `type` filter in `findAllByWorkspaceId`; the `total` count join dynamically targets `income` or `expense` table based on category type |
| `apps/api/src/routes/categories/index.ts` | Pass `type` query param to repository; return `type` in responses |
| `apps/api/src/modules/sync.ts` | Add `GET /sync/incomes` shape proxy (workspace-scoped) |
| `apps/api/src/modules/api.ts` | Register `/api/incomes` route |

### API Endpoints: `/api/incomes`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/incomes?workspaceId=` | List all income entries for workspace |
| `GET` | `/api/incomes/:id?workspaceId=` | Get single income entry |
| `POST` | `/api/incomes` | Create income entry |
| `PATCH` | `/api/incomes/:id` | Update income entry |
| `DELETE` | `/api/incomes/:id` | Delete income entry |

Middleware chain: `workspaceQueryValidator` → `workspaceMember` → handler (identical to expenses pattern).

### Category type filtering

`GET /api/categories?workspaceId=&type=expense|income` — optional `type` param filters returned categories. If omitted, all categories are returned (for management UI).

---

## Frontend Architecture

### New collections

```
apps/app/src/lib/collections/income.ts
```

Electric SQL collection factory — mirrors `expense.ts` shape, connects to `/sync/incomes?workspaceIdOrSlug=`.

Schema:
```typescript
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
  creator_id: z.uuidv7(),
  created_at: IsoDateSchema,
});
```

### Modified collections

| File | Change |
|---|---|
| `apps/app/src/lib/collections/category.ts` | Add `type: z.enum(['expense', 'income'])` to `CategoryCollectionSchema` |
| `apps/app/src/lib/collections/index.ts` | Add `clearIncomeCollection` to cleanup exports |

### New income components

```
apps/app/src/components/incomes/
  use-incomes.ts       — live query hook + stats (total, by category, by wallet, by date)
  income-list.tsx      — virtualized list with date grouping (mirrors expense-list)
  income-content.tsx   — individual row (title, category badge, wallet badge, amount in green)
  income-details.tsx   — right panel with edit form
  income-actions.tsx   — Create / Edit / Delete dialogs
  income-filter.tsx    — filter popover (search, date, amount, category, wallet)
```

### Modified frontend components

| File | Change |
|---|---|
| `apps/app/src/components/forms/select-category.tsx` | Accept `type: 'expense' \| 'income'` prop; filter live query to matching type |
| `apps/app/src/components/categories/use-categories.ts` | Accept optional `type` filter in `useLiveQueryCategories()` |
| `apps/app/src/components/categories/category-table.tsx` | Show type badge; add tabs or filter toggle for expense vs income categories |
| `apps/app/src/components/categories/category-actions.tsx` | `CreateCategoryForm` accepts optional `type` prop (defaults `'expense'`) |
| `apps/app/src/lib/schema.ts` | Add `IncomeFormSchema`, `IncomePostSchema`, `IncomePatchSchema` |
| `apps/app/src/services/mutations.ts` | Add `useCreateIncome`, `useEditIncome`, `useDeleteIncome` |
| `apps/app/src/services/query-options.ts` | Add `getIncomesQueryOptions` |

### New route

```
apps/app/src/routes/_dashboard/$slug/incomes.tsx
```

Page layout: same structure as expenses page — `SectionHeader` with create button, `SectionContent` with list (col 1–7) + details panel (col 8–12).

### Navigation

Add "Income" to `apps/app/src/components/layouts/nav-workspace.tsx`:

```
Dashboard
Expenses
Income        ← new (ArrowDownIcon or TrendingUpIcon)
Recurring Bills
Library
Files
```

Mobile bottom nav: stays as 3 tabs (Dashboard, Expenses, Settings) — Income accessible via sidebar/menu only on mobile.

### Dashboard changes

**Modified:** `apps/app/src/routes/_dashboard/$slug/index.tsx`

Two additions to the overview section:

1. **Net balance stat card** — "Net Balance" card showing `totalIncome − totalExpenses` for the selected period, added to the stats row alongside existing cards. Positive = green, negative = red.

2. **Income vs Expense comparison chart** — new `<IncomeExpenseComparison>` component:
   - Monthly grouped bar chart (Recharts `BarChart`)
   - Two bar series: income (green) + expenses (red/default color) per month
   - Collapses daily frequency into monthly totals — solves the sparse/dense mismatch
   - Date range controlled by the existing `DashboardDateFilter`
   - Placed below the existing `ExpenseOverview` chart

**New chart component:**
```
apps/app/src/components/charts/income-expense-comparison.tsx
```

---

## Category Type Flag — Full Impact List

Every place in the codebase that touches categories and needs updating:

### Backend
- `apps/api/src/db/schema.ts` — add enum + column
- `apps/api/src/routes/categories/schema.ts` — add `type` to all schemas
- `apps/api/src/routes/categories/repository.ts` — filter + count join by type
- `apps/api/src/routes/categories/index.ts` — pass type param

### Frontend
- `apps/app/src/lib/collections/category.ts` — add `type` to collection schema
- `apps/app/src/components/categories/use-categories.ts` — optional type filter
- `apps/app/src/components/categories/category-table.tsx` — type badge + tab UI
- `apps/app/src/components/categories/category-actions.tsx` — type prop on create form
- `apps/app/src/components/forms/select-category.tsx` — type filter prop
- `apps/app/src/lib/schema.ts` — add `type` to `CategoryFormSchema`

### Expense forms (no change needed)
The expense form's `SelectCategoryField` will pass `type="expense"` — this is additive, existing behavior is preserved.

---

## Comparison Chart Design

The key design insight: income happens sparsely (a few times per month), expenses happen daily. Comparing them on the same daily timeline is visually misleading.

**Solution:** Aggregate both to **monthly totals** before comparing.

```
Monthly Grouped Bar Chart:
  X-axis: months (Jan, Feb, Mar, ...)
  Y-axis: amount in workspace currency (FX-converted)
  Bar series 1: Total income that month (green)
  Bar series 2: Total expenses that month (gray/red)
  Tooltip: shows both values + net for that month
```

Date range for the chart is driven by the existing `DashboardDateFilter`. If the selected range is less than 2 months, show daily grouped bars instead.

---

## Electric SQL Sync

New sync endpoint added to `apps/api/src/modules/sync.ts`:

```typescript
app.get(
  "/sync/incomes",
  workspaceQueryValidator,
  workspaceMember,
  async (c) => {
    const workspace = c.get("workspace");
    const shapeUrl = prepareElectricUrl(c.req.url);
    shapeUrl.searchParams.set("table", "income");
    shapeUrl.searchParams.set("where", `workspace_id = '${workspace.id}'`);
    return proxyElectricRequest(shapeUrl);
  }
);
```

Categories sync endpoint does **not** need a type filter in the where clause — all workspace categories (both types) sync to the client. Type-based filtering happens in the live query layer on the client.

---

## Migration Strategy

Two migration files:

**Migration 1:** `XXXX_add_category_type.sql`
- Create `category_type_enum`
- Add `type` column to `category` (default `'expense'`)
- Drop old unique constraint `(workspace_id, name)`
- Add new unique constraint `(workspace_id, name, type)`

**Migration 2:** `XXXX_add_income_table.sql`
- Create `income` table with all indexes

No backfill migration needed — all existing categories are already `'expense'` by default.

---

## Testing Approach

- API route tests: create/read/update/delete income entries, verify workspace scoping
- Category type filter tests: verify expense form only sees expense categories, income form only sees income categories
- Dashboard stats tests: verify net balance calculation, monthly aggregation logic
- No E2E tests in scope for this feature
