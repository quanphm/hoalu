---
AI_CONTEXT: true
VERSION: 0.19.0
LAST_UPDATED: 2026-01-24
TECH_STACK: Bun, React 19, Hono, PostgreSQL 17, Electric SQL, TanStack ecosystem
---

# AGENTS.md

Hoalu frontend react app.

## Tech Stack

- **Framework**: React 19 with React DOM 19
- **Routing**: TanStack Router v1.139+ with file-based routing
- **Data Fetching**: TanStack Query v5.90+ with TanStack React DB v0.1+
- **Forms**: TanStack Form v1.26+ with Zod v4 validation
- **State Management**: Jotai v2.15+ atoms for local state
- **Real-time Sync**:
  - Electric SQL with `@electric-sql/pglite` v0.3.14+
  - `@tanstack/electric-db-collection` v0.2.9+ for reactive collections
  - PGlite Sync v0.4.0+ for offline-first PostgreSQL in browser
- **Styling**:
  - TailwindCSS v4.1.17+ with `@tailwindcss/vite`
  - shadcn/ui and base-ui components via `@hoalu/ui`
  - `class-variance-authority` v0.7+ for component variants
- **UI Components**:
  - TipTap v3.11+ for rich text editing
  - Recharts v3.5+ for data visualization
  - TanStack Table v8.21+ and Virtual v3.13+ for lists
- **PWA**: Vite PWA plugin with workbox strategies
- **Dev Tools**: React Query DevTools, Router DevTools, Form DevTools
- **Build Tool**: Vite with SWC for fast compilation
- **Hotkeys**: react-hotkeys-hook v5.2+

## Component Registry

- **Path Alias**: `#app/*` maps to `./src/*`
- **Build**: Vite with React SWC plugin
- **Main Entry**: `src/main.tsx`
- **Key Files**:
  - `src/lib/api-client.ts` - Hono RPC client (8105 lines)
  - `src/lib/schema.ts` - Frontend type definitions (3127 lines)
  - `src/hooks/use-db.ts` - TanStack DB live queries
  - `src/services/query-options.ts` - Reusable query configs
  - `src/services/mutations.ts` - Mutation configurations

### Frontend Components (`apps/app/src/components/`)

**Expenses (6 files):**

- `expense-list.tsx` - Virtualized list with TanStack Virtual
- `expense-content.tsx` - Individual list item component
- `expense-details.tsx` - Detail panel with edit/delete actions
- `expense-actions.tsx` - Create/Edit dialog triggers
- `expense-filter.tsx` - Filter controls (search, category, wallet, repeat)
- `use-expenses.ts` (255 lines) - Live queries, stats calculations, filtering logic

**Categories (3 files):**

- `category-table.tsx` - Table view with sorting
- `category-actions.tsx` - CRUD actions
- `use-categories.ts` - Live queries and transformations

**Wallets (2 files):**

- `wallet-actions.tsx` - CRUD operations
- `wallet-badge.tsx` - Display component

**Forms (19 files):**

- `form.tsx` - TanStack Form wrapper with validation
- `input.tsx`, `select.tsx`, `switch.tsx` - Basic form inputs
- `datepicker.tsx`, `datepicker-input.tsx` - Date selection
- `transaction-amount.tsx` - Currency input with formatting
- `select-category.tsx`, `select-with-search.tsx` - Enhanced select components
- `tiptap.tsx` - Rich text editor (TipTap v3.11+)
- `files.tsx` - File upload with drag-drop
- `color.tsx` - Color picker for categories

**Charts (5 files):**

- `expense-stats-row.tsx` - Summary cards with percentage changes
- `expenses-overview.tsx` - Line/area chart with Recharts
- `category-breakdown.tsx` - Pie/donut chart for categories
- `date-range-picker.tsx` - Date range selector component
- `dashboard-date-filter.tsx` - Quick date filters (today, week, month, year)

**Providers (5 files):**

- `local-postgres-provider.tsx` - PGlite setup with IndexedDB (idb://hoalu-db)
- `dialog-provider.tsx` - Global dialog state management
- `ui-provider.tsx` - Theme provider and toast notifications
- `workspace-action-provider.tsx` - Workspace context menu actions
- `dashboard-action-provider.tsx` - Dashboard-level actions

**Layouts (14 files):**

- Responsive layouts, sidebars, navigation, page content wrappers

## Architecture Patterns

Frontend Architecture (`apps/app/src/`)

### Path Aliases

```typescript
// Use #app/* for all imports
import { useAuth } from "#app/hooks/use-auth.ts";
import { apiClient } from "#app/lib/api-client.ts";
import { ExpenseFormSchema } from "#app/lib/schema.ts";
```

### State Management with Jotai

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

### Data Layer - TanStack Query + DB

**Collections** (`lib/collections/`):

Collections use a **factory pattern** for workspace-scoped data with automatic cleanup support. The factory memoizes collection instances per workspace slug and provides cleanup methods for memory management.

**Collection Factory Helper** (`lib/collections/create-collection-factory.ts`):

```typescript
type CollectionWithCleanup = { cleanup: () => void };

export function createCollectionFactory<T extends CollectionWithCleanup>(
  name: string,
  createFn: (slug: string) => T,
) {
  const instances = new Map<string, T>();

  return {
    get(slug: string): T {
      const existing = instances.get(slug);
      if (existing) return existing;

      const collection = createFn(slug);
      instances.set(slug, collection);
      return collection;
    },

    clear(slug?: string) {
      if (slug) {
        const collection = instances.get(slug);
        if (collection) {
          collection.cleanup();
          instances.delete(slug);
        }
      } else {
        for (const collection of instances.values()) {
          collection.cleanup();
        }
        instances.clear();
      }
    },
  };
}
```

**Example Collection** (`lib/collections/expense.ts`):

```typescript
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

import {
  CurrencySchema,
  IsoDateSchema,
  RepeatSchema,
} from "@hoalu/common/schema";
import { createCollectionFactory } from "#app/lib/collections/create-collection-factory.ts";

const ExpenseCollectionSchema = z.object({
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

const factory = createCollectionFactory("expense", (slug: string) =>
  createCollection(
    electricCollectionOptions({
      id: `expense-${slug}`,
      getKey: (item) => item.id,
      shapeOptions: {
        url: `${import.meta.env.PUBLIC_API_URL}/sync/expenses?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
      },
      schema: ExpenseCollectionSchema,
    }),
  ),
);

export const expenseCollectionFactory = factory.get;
export const clearExpenseCollection = factory.clear;
```

**Centralized Cleanup** (`lib/collections/index.ts`):

```typescript
import { clearCategoryCollection } from "./category.ts";
import { clearExpenseCollection } from "./expense.ts";
import { clearWalletCollection } from "./wallet.ts";
import { exchangeRateCollection } from "./exchange-rate.ts";

export function clearWorkspaceCollections(slug: string) {
  clearExpenseCollection(slug);
  clearCategoryCollection(slug);
  clearWalletCollection(slug);
  exchangeRateCollection.cleanup();
}

export function clearAllWorkspaceCollections() {
  clearExpenseCollection();
  clearCategoryCollection();
  clearWalletCollection();
  exchangeRateCollection.cleanup();
}
```

**Note:** Since the app and API are served through Caddy on the same `.localhost` domain, cookies are automatically shared. No `fetchClient` with `credentials: "include"` is needed for Electric SQL sync requests.

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
        ({ expense, wallet }) => eq(expense.wallet_id, wallet.id),
      )
      .leftJoin(
        { category: categoryCollection(workspace.id) },
        ({ expense, category }) => eq(expense.category_id, category.id),
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
      })),
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

### Real-time Synchronization / Electric SQL Architecture

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
  }),
);

// Live queries subscribe to changes
const { data } = useLiveQuery((q) =>
  q.from({ expense: expenseCollection(workspaceId) }),
);
// Data updates automatically when DB changes!
```

## Task Templates

Use this template when adding a new feature to the frontend (e.g., notes, tags, budgets).

**Steps:**

1. **Create Electric SQL collection**: `apps/app/src/lib/collections/[resource].ts`

   ```typescript
   import { electricCollectionOptions } from "@tanstack/electric-db-collection";
   import { createCollection } from "@tanstack/react-db";
   import * as z from "zod";

   import { IsoDateSchema } from "@hoalu/common/schema";
   import { createCollectionFactory } from "#app/lib/collections/create-collection-factory.ts";

   const [Resource]CollectionSchema = z.object({
     id: z.uuidv7(),
     title: z.string(),
     description: z.string().nullable(),
     workspace_id: z.uuidv7(),
     created_at: IsoDateSchema,
     updated_at: IsoDateSchema,
   });

   const factory = createCollectionFactory("[resource]", (slug: string) =>
     createCollection(
       electricCollectionOptions({
         id: `[resource]-${slug}`,
         getKey: (item) => item.id,
         shapeOptions: {
           url: `${import.meta.env.PUBLIC_API_URL}/sync/[resource]s?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
         },
         schema: [Resource]CollectionSchema,
       }),
     ),
   );

   export const [resource]CollectionFactory = factory.get;
   export const clear[Resource]Collection = factory.clear;
   ```

2. **Create custom hook**: `apps/app/src/components/[resource]/use-[resource].ts`

   ```typescript
   import { eq, useLiveQuery } from "@tanstack/react-db";
   import { useAtom } from "jotai";
   import { useMemo } from "react";

   import { datetime } from "@hoalu/common/datetime";

   import { selected[Resource]Atom } from "#app/atoms/[resource].ts";
   import { useWorkspace } from "#app/hooks/use-workspace.ts";
   import { [resource]Collection } from "#app/lib/collections/[resource].ts";

   export function useSelected[Resource]() {
     const [[resource], setSelected[Resource]] = useAtom(selected[Resource]Atom);
     const onSelect[Resource] = (id: string | null) => {
       setSelected[Resource]({ id });
     };
     return { [resource], onSelect[Resource] };
   }

   export function useLiveQuery[Resource]s() {
     const workspace = useWorkspace();

     const { data } = useLiveQuery(
       (q) => {
         return q
           .from({ [resource]: [resource]Collection(workspace.id) })
           .orderBy(({ [resource] }) => [resource].created_at, "desc")
           .select(({ [resource] }) => ({ ...[resource] }));
       },
       [workspace.id]
     );

     const transformed = useMemo(() => {
       if (!data) return [];
       return data.map(([resource]) => ({
         ...[resource],
         createdAt: datetime.format([resource].created_at, "yyyy-MM-dd HH:mm"),
       }));
     }, [data]);

     return transformed;
   }

   export type Synced[Resource]s = ReturnType<typeof useLiveQuery[Resource]s>;
   export type Synced[Resource] = Synced[Resource]s[number];
   ```

3. **Create components**:
   - `[resource]-list.tsx` - List view with virtualization
   - `[resource]-details.tsx` - Detail panel
   - `[resource]-actions.tsx` - CRUD dialogs/buttons
   - `[resource]-filter.tsx` (optional) - Filter controls

4. **Create atoms**: `apps/app/src/atoms/[resource].ts`

   ```typescript
   import { atom } from "jotai";

   export const selected[Resource]Atom = atom<{ id: string | null }>({ id: null });
   export const [resource]DialogAtom = atom(false);
   ```

5. **Create route**: `apps/app/src/routes/_dashboard/$slug/[resource]s.tsx`

   ```typescript
   import { createFileRoute } from "@tanstack/react-router";

   import { useLiveQuery[Resource]s } from "#app/components/[resource]/use-[resource].ts";
   import { [Resource]List } from "#app/components/[resource]/[resource]-list.tsx";
   import { [Resource]Details } from "#app/components/[resource]/[resource]-details.tsx";
   import { Create[Resource]DialogTrigger } from "#app/components/[resource]/[resource]-actions.tsx";
   import { Section, SectionContent, SectionHeader, SectionTitle } from "#app/components/layouts/section.tsx";

   export const Route = createFileRoute("/_dashboard/$slug/[resource]s")({
     component: RouteComponent,
   });

   function RouteComponent() {
     const [resource]s = useLiveQuery[Resource]s();

     return (
       <Section>
         <SectionHeader>
           <SectionTitle>[Resource]s</SectionTitle>
           <Create[Resource]DialogTrigger />
         </SectionHeader>
         <SectionContent columns={12}>
           <[Resource]List [resource]s={[resource]s} />
           <[Resource]Details />
         </SectionContent>
       </Section>
     );
   }
   ```

6. **Add mutations**: `apps/app/src/services/mutations.ts`

   ```typescript
   export function useCreate[Resource]() {
     const queryClient = useQueryClient();

     return useMutation({
       mutationFn: async (data: Insert[Resource]Schema) => {
         const res = await apiClient.api.[resource]s.$post({ json: data });
         if (!res.ok) throw new Error("Failed to create [resource]");
         return res.json();
       },
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["[resource]s"] });
       },
     });
   }
   ```

**Example:** See `apps/app/src/components/expenses/` for complete reference implementation.

## Development

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
        old?.filter((e) => e.id !== id),
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
