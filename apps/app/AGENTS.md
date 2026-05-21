---
AI_CONTEXT: true
LAST_UPDATED: 2026-05-10
TECH_STACK: Bun 1.3.9, React 19, Hono, PostgreSQL 17, Electric SQL, TanStack ecosystem
---

# AGENTS.md

Hoalu frontend react app.

## Tech Stack

- **Framework**: React 19 with React DOM 19
- **Runtime**: Bun (1.3.9)
- **Routing**: TanStack Router v1.139+ with file-based routing
- **Data Fetching**: TanStack Query v5.90+ with TanStack React DB v0.1+
- **Forms**: TanStack Form v1.29+ with Zod v4 validation
- **State Management**: Jotai v2.15+ atoms for local state
- **Real-time Sync**:
  - Electric SQL with `@electric-sql/pglite` v0.4.4
  - `@tanstack/electric-db-collection` v0.3.3 for reactive collections
  - PGlite Sync v0.5.4 for offline-first PostgreSQL in browser
- **Styling**:
  - TailwindCSS v4.2+ with `@tailwindcss/vite`
  - shadcn/ui components via `@hoalu/ui` (~42 components)
- **UI Components**:
  - TipTap v3.11+ for rich text editing
  - Recharts for data visualization
  - TanStack Table v8+ and Virtual v3+ for lists
- **PWA**: Vite PWA plugin with workbox strategies
- **Dev Tools**: TanStack Query DevTools, Router DevTools, Form DevTools, React Query DevTools
- **Build Tool**: Vite v8+ with SWC for fast compilation
- **Hotkeys**: react-hotkeys-hook v5.2+
- **Sound Effects**: Web Audio API sound effects (`lib/sound-effects.ts`)
- **Haptics**: `web-haptics` library + custom `haptics-provider.tsx`
- **Fuzzy Search**: `@leeoniya/ufuzzy` for client-side search
- **Linting**: oxlint (no ESLint)

## Component Registry

- **Path Alias**: `#app/*` maps to `./src/*`
- **Build**: `vite build` / `vite` (dev)
- **Main Entry**: `src/main.tsx`
- **Key Files**:
  - `src/lib/api-client.ts` - Hono RPC client (634 lines)
  - `src/lib/schema.ts` - Frontend type definitions & Zod schemas (170 lines)
  - `src/lib/auth-client.ts` - Better Auth client setup (workspaceClient plugin)
  - `src/lib/query-client.ts` - TanStack Query client setup
  - `src/lib/query-key-factory.ts` - Query key factory for all resources
  - `src/lib/sound-effects.ts` - Sound effect utilities
  - `src/hooks/use-db.ts` - TanStack DB live queries
  - `src/hooks/use-workspace.ts` - Workspace context hook (slug-based)
  - `src/hooks/use-receipt-scan.ts` - Receipt scanning hook
  - `src/services/query-options.ts` - Reusable query configs (370 lines)
  - `src/services/mutations.ts` - Mutation configurations (1082 lines)

### Frontend Components (`apps/app/src/components/`)

**Expenses (7 files):**

- `expense-list.tsx` - Virtualized list with TanStack Virtual
- `expense-content.tsx` - Individual list item component
- `expense-details.tsx` - Detail panel with edit/delete actions
- `expense-actions.tsx` - Create/Edit dialog triggers
- `expense-filter-dropdown.tsx` - Filter controls (search, category, wallet, repeat, date)
- `recent-transactions.tsx` - Recent transactions widget
- `use-expenses.ts` (430 lines) - Live queries, stats calculations, filtering logic (exports SyncedExpense type)

**Categories (3 files):**

- `category-table.tsx` - Table view with sorting
- `category-actions.tsx` - CRUD actions
- `use-categories.ts` - Live queries and transformations

**Wallets (4 files):**

- `wallet-actions.tsx` - CRUD operations
- `wallet-badge.tsx` - Display component
- `wallet-table.tsx` - Table view with balances
- `use-wallets.ts` - Live queries

**Recurring Bills (5 files):**

- `recurring-bill-list.tsx` - List view
- `recurring-bill-details.tsx` - Individual bill detail
- `recurring-bill-actions.tsx` - Create/Edit/Delete
- `use-recurring-bills.ts` - Live queries
- `use-recurring-bill-navigation.ts` - Navigation helpers

**Upcoming Bills (3 files):**

- `upcoming-bills-list.tsx` - Upcoming bills list
- `upcoming-bills-widget.tsx` - Dashboard widget
- `use-upcoming-bills.ts` - Query helpers

**Incomes (6 files):**

- `income-list.tsx` - Virtualized list
- `income-content.tsx` - Individual item component
- `income-details.tsx` - Detail panel
- `income-actions.tsx` - CRUD dialog triggers
- `use-incomes.ts` - Live queries (exports SyncedIncome type)
- `use-income-navigation.ts` - Navigation helpers

**Events (5 files):**

- `event-list.tsx` - Event list
- `event-details.tsx` - Event detail panel
- `event-actions.tsx` - CRUD actions
- `event-date-range.tsx` - Date range selector
- `use-events.ts` - Live queries

**Transactions (2 files):**

- `income-details-panel.tsx` - Income detail in transaction view
- `use-transactions.ts` - Combined expense/income transactions

**Forms (19 files):**

- `form.tsx` - TanStack Form wrapper with Zod validation
- `input.tsx`, `select.tsx`, `switch.tsx` - Basic form inputs
- `datepicker.tsx`, `datepicker-input.tsx` - Date selection
- `transaction-amount.tsx` - Currency input with formatting
- `select-category.tsx`, `select-with-search.tsx` - Enhanced select components
- `files.tsx` - File upload with drag-drop
- `color.tsx` - Color picker for categories
- Plus: receipt scanner, number-field, autocomplete, combobox, etc.

**Charts:**

- `expense-stats-row.tsx` - Summary cards with percentage changes
- `expenses-overview.tsx` - Line/area chart with Recharts
- `category-breakdown.tsx` - Pie/donut chart for categories
- `date-range-picker.tsx` - Date range selector component
- `dashboard-date-filter.tsx` - Quick date filters (today, week, month, year)

**Providers (6 files):**

- `local-postgres-provider.tsx` - PGlite setup with IndexedDB (idb://hoalu-db)
- `dialog-provider.tsx` - Global dialog state management
- `ui-provider.tsx` - Theme provider and toast notifications
- `workspace-action-provider.tsx` - Workspace context menu actions
- `dashboard-action-provider.tsx` - Dashboard-level actions
- `haptics-provider.tsx` - WebHaptics haptic feedback provider

**Other:**

- `command-palette/` - Command palette with fuzzy search
- `layouts/` - Responsive layouts, sidebars, navigation (14 files)
- `data-table/` - Generic data table component
- `virtual-table/` - Virtualized table
- `quick-expenses/` - Quick expense entry
- `receipt/` - Receipt scanning components
- `charts/` - Chart components

## Architecture Patterns

### State Management with Jotai

**Location**: `apps/app/src/atoms/` (8 files)

```
atoms/
  categories.ts   - Category dialog state
  command-palette.ts - Command palette state
  dialogs.ts      - Global dialog state
  expenses.ts     - Draft, selected expense atoms
  filters.ts      - Date range filters
  incomes.ts      - Draft income atoms
  redacted.ts     - Amount redaction toggle
  index.ts        - Re-exports
```

### Data Layer

**Query Key Factory** (`lib/query-key-factory.ts`):
Uses structured query keys for all resources: workspaceKeys, expenseKeys, incomeKeys, categoryKeys, walletKeys, eventKeys, recurringBillKeys, taskKeys, fileKeys, exchangeRateKeys, memberKeys, authKeys

**Collections** (`lib/collections/` - 9 files):

| File                           | Entity                    |
| ------------------------------ | ------------------------- |
| `expense.ts`                   | Expenses                  |
| `income.ts`                    | Incomes                   |
| `category.ts`                  | Categories                |
| `wallet.ts`                    | Wallets                   |
| `event.ts`                     | Events                    |
| `exchange-rate.ts`             | Exchange rates            |
| `recurring-bill.ts`            | Recurring bills           |
| `index.ts`                     | Centralized cleanup       |
| `create-collection-factory.ts` | Factory helper (63 lines) |

All collections use `@tanstack/electric-db-collection` with `@tanstack/react-db` and Zod validation schemas that coerce numeric fields.

**API Client** (`lib/api-client.ts`):
Uses `hono/client` `hc()` to create a typed RPC client:

- `baseURL: import.meta.env.PUBLIC_API_URL`
- `credentials: "include"` for cookie-based auth
- Uses `ApiRoutes` type from `@hoalu/api/types`
- Exports `honoClient` with BFF-prefixed routes (e.g. `honoClient.bff.expenses.$get`, `honoClient.bff.tasks.$get`)

### Zod Schema Patterns (actual ExpenseFormSchema)

```typescript
export const ExpenseFormSchema = z.object({
	title: z.string().min(1),
	description: z.optional(z.string()),
	transaction: z.object({
		value: z.number(),
		currency: z.string(),
	}),
	date: z.iso.datetime({ offset: true }),
	walletId: z.uuidv7(),
	categoryId: z.uuidv7(),
	repeat: RepeatSchema,
	recurringBillId: z.string().optional(),
	eventId: z.string().optional(),
	attachments: z.array(z.file()),
});
```

Note: `z.iso.datetime({ offset: true })` is used instead of `z.iso.datetime()`. The `transaction` field is a nested object with `value` + `currency`, not flat `amount` + `currency`.

### Hono RPC Client Types (BFF pattern)

```typescript
import type { InferRequestType, InferResponseType } from "hono/client";
import type { honoClient } from "#app/lib/api-client.ts";

export type ExpenseSchema = InferResponseType<
	typeof honoClient.bff.expenses.$get,
	200
>["data"][number];

export type ExpensePostSchema = InferRequestType<typeof honoClient.bff.expenses.$post>["json"];
```

### Workspace Hook

```typescript
import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/_dashboard/$slug");

export function useWorkspace() {
	const { slug } = routeApi.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));
	return workspace;
}
```
