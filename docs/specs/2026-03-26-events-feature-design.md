# Events Feature Design

**Date:** 2026-03-26  
**Status:** Draft  
**Tech Stack:** Bun, React 19, Hono, PostgreSQL 17, Electric SQL, TanStack ecosystem

---

## Overview

Add the ability to group expenses and recurring bills under a named **event** or occasion (e.g. "Japan Trip", "Wedding", "Home Renovation"). Each event is a one-time, bounded grouping scoped to a workspace. Users can set a budget, track spending progress, and navigate directly to an event's detail page.

---

## Goals

- Allow expenses and recurring bills to be associated with a named event.
- Provide per-event budget tracking (total spent vs. budget, remaining).
- Dedicated events list page and event detail page in the app.
- Assignment of an event is optional — existing expenses and bills are unaffected.

## Non-Goals

- Recurring events (a future concern).
- Multi-event assignment (one expense belongs to at most one event).
- Event-level member permissions (workspace membership is sufficient).
- Notifications or reminders tied to event dates.

---

## Data Model

### New table: `event`

```sql
CREATE TYPE event_status_enum AS ENUM ('open', 'closed');

CREATE TABLE event (
  id              uuid PRIMARY KEY,
  title           text NOT NULL,
  description     text,
  start_date      date,
  end_date        date,
  budget          numeric(20, 6),
  budget_currency varchar(3) NOT NULL DEFAULT 'USD',
  status          event_status_enum NOT NULL DEFAULT 'open',
  workspace_id    uuid NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  creator_id      uuid REFERENCES "user"(id) ON DELETE SET NULL,
  created_at      timestamp NOT NULL,
  updated_at      timestamp NOT NULL
);

CREATE INDEX event_workspace_id_idx ON event(workspace_id);
```

Notes on the DDL:
- `budget_currency` uses `varchar(3)` (ISO 4217 code) rather than a custom enum — consistent with how `currency` is stored elsewhere in the schema. The default `'USD'` is a fallback only; the application layer sets this from the workspace's default currency at creation time.
- `"user"` is quoted because `user` is a reserved keyword in PostgreSQL.

### Modified tables

**`expense`** — add column:
```sql
ALTER TABLE expense ADD COLUMN event_id uuid REFERENCES event(id) ON DELETE SET NULL;
CREATE INDEX expense_event_id_idx ON expense(event_id);
```

**`recurring_bill`** — add column:
```sql
ALTER TABLE recurring_bill ADD COLUMN event_id uuid REFERENCES event(id) ON DELETE SET NULL;
CREATE INDEX recurring_bill_event_id_idx ON recurring_bill(event_id);
```

Both columns are nullable and default to `null`. All existing rows are unaffected.

### Notes

- `budget` is stored in `budget_currency`. When displaying against multi-currency expenses, amounts are FX-converted using `exchangeRateCollection` in the frontend, same as the existing `useExpenseStats` pattern.
- Deleting an event sets `event_id = null` on linked expenses and bills (FK SET NULL) — no cascade delete of financial data.
- No soft-delete/archive on events — `status = 'closed'` serves that purpose.

---

## Backend (API)

### New route: `apps/api/src/routes/events/`

Three files following the standard pattern.

#### `schema.ts`

| Schema | Fields |
|--------|--------|
| `InsertEventSchema` | title (min 1), description?, start_date? (date string), end_date? (date string), budget? (coerce number), budget_currency? (CurrencySchema, defaults to workspace currency in handler), workspaceId (uuidv7). `.refine()` that `end_date >= start_date` when both are provided. |
| `UpdateEventSchema` | all `InsertEventSchema` fields omit(workspaceId) partial, plus status (`"open" \| "closed"`) |
| `EventSchema` | id, title, description\|null, start_date\|null, end_date\|null, budget (coerce)\|null, budget_currency, status, workspaceId, creatorId, createdAt, updatedAt + `.transform()` adding `realBudget: budget != null ? monetary.fromRealAmount(budget, budget_currency) : null` |
| `EventsSchema` | `z.array(EventSchema)` |
| `DeleteEventSchema` | `{ id: uuidv7 }` |

#### `repository.ts` — `EventRepository` class

| Method | Description |
|--------|-------------|
| `findAllByWorkspaceId({ workspaceId })` | All events for workspace, ordered by `created_at desc` |
| `findOne({ id, workspaceId })` | Single event |
| `insert(param)` | Create event, returns inserted row |
| `update({ id, workspaceId, payload })` | Update fields, sets `updated_at` |
| `delete({ id, workspaceId })` | Permanent delete; FK SET NULL handles expense/bill unlinking |

#### `index.ts` — HTTP handlers

| Method | Path | Middleware | Description |
|--------|------|-----------|-------------|
| `GET` | `/` | workspaceQueryValidator, workspaceMember | List all events |
| `GET` | `/:id` | workspaceQueryValidator, workspaceMember | Single event |
| `POST` | `/` | workspaceQueryValidator, jsonBodyValidator(InsertEventSchema), workspaceMember | Create event |
| `PATCH` | `/:id` | workspaceQueryValidator, jsonBodyValidator(UpdateEventSchema), workspaceMember | Update event |
| `DELETE` | `/:id` | workspaceQueryValidator, workspaceMember | Delete event (creator or owner role only) |

`workspaceQueryValidator` must precede `workspaceMember` on all routes — this is required so `c.var.workspace` is populated before the membership check runs.

All routes include OpenAPI documentation via `describeRoute`.

#### Route registration

Add to `apps/api/src/modules/api.ts`:
```typescript
import eventRoute from "#api/routes/events/index.ts";
app.route("/events", eventRoute);
```

(Existing routes use no `/api` prefix in `app.route()` — the `/api` base path is set upstream in the module chain.)

### Modified routes

**`apps/api/src/routes/expenses/schema.ts`**
- `InsertExpenseSchema`: add `eventId: z.uuidv7().optional()`
- `UpdateExpenseSchema`: add `eventId: z.uuidv7().nullable().optional()` (explicit null = unlink)

**`apps/api/src/routes/expenses/repository.ts`**
- `insert` and `update` pass through `eventId`

**`apps/api/src/routes/recurring-bills/schema.ts`**
- `InsertRecurringBillSchema`: add `eventId: z.uuidv7().optional()`
- `UpdateRecurringBillSchema`: add `eventId: z.uuidv7().nullable().optional()`

**`apps/api/src/routes/recurring-bills/repository.ts`**
- `insert` and `update` pass through `eventId`

---

## Frontend

### New collection: `apps/app/src/lib/collections/event.ts`

Schema fields: `id, title, description, start_date, end_date, budget(coerce), budget_currency, status, workspace_id, creator_id, created_at, updated_at`

Exports: `eventCollectionFactory`, `clearEventCollection`

Sync URL: `${PUBLIC_API_URL}/sync/events?workspaceIdOrSlug=${slug}`

Register in `apps/app/src/lib/collections/index.ts` cleanup functions.

**Sync proxy registration** — `apps/api/src/modules/sync.ts` must add a shape handler for the `event` table so Electric SQL proxies it through the authenticated sync endpoint. Follow the same pattern as the existing `expenses`, `wallets`, and `categories` shape handlers in that file.

### Updated collections

**`expense.ts`** collection schema: add `event_id: z.uuidv7().nullable()`  
**`recurring-bill.ts`** collection schema: add `event_id: z.uuidv7().nullable()`

### New atoms: `apps/app/src/atoms/events.ts`

```typescript
export const selectedEventAtom = atom<{ id: string | null }>({ id: null });
export const eventDialogAtom = atom(false);
```

### New hook: `apps/app/src/components/events/use-events.ts`

| Export | Description |
|--------|-------------|
| `useSelectedEvent()` | Jotai atom wrapper for selected event id |
| `useLiveQueryEvents()` | Live query over `eventCollection`, joins `expenseCollection` to compute `totalSpent` per event (FX-converted using exchange rates); orders by `start_date desc nulls last, created_at desc` |
| `useLiveQueryEventExpenses(eventId)` | Live query of expenses filtered by `event_id = eventId`, with wallet+category joins; same transform as `useLiveQueryExpenses` |
| `useLiveQueryEventRecurringBills(eventId)` | Live query of recurring bills filtered by `event_id = eventId` |

Exported types: `SyncedEvent`, `SyncedEvents`

### New components: `apps/app/src/components/events/`

| File | Responsibility |
|------|---------------|
| `event-list.tsx` | Virtualized list of events. Each row: title, date range, spent/budget progress bar, status badge (open/closed) |
| `event-details.tsx` | Detail view shown on `/events/:id`. Header: event title, date range, status. Stats row: total spent, budget, remaining amount, expense count. Below: tabbed or combined list of linked expenses and linked recurring bills |
| `event-actions.tsx` | Create dialog (title, description, date range, budget, budget_currency). Edit dialog (same fields + status toggle). Delete confirmation |
| `use-events.ts` | Hooks as described above |

### Updated forms

**Expense create/edit form** (`apps/app/src/components/expenses/expense-actions.tsx`):
- Add optional "Event" select field using `SelectWithSearch` pattern (same as category/wallet)
- Populated from `useLiveQueryEvents()`, filtered to `status = "open"`
- Passes `eventId` in the mutation payload

**Recurring bill create/edit form** (`apps/app/src/components/recurring-bills/`):
- Same optional "Event" select field
- Passes `eventId` in the mutation payload

### New routes

| File | Path | Description |
|------|------|-------------|
| `apps/app/src/routes/_dashboard/$slug/_normal/events.tsx` | `/$slug/events` | Events list page using `EventList` + `CreateEventDialogTrigger` |
| `apps/app/src/routes/_dashboard/$slug/_normal/events.$id.tsx` | `/$slug/events/$id` | Event detail page using `EventDetails` |

### Mutation hooks: `apps/app/src/services/mutations.ts`

Add the following mutation hooks (following existing patterns in that file):

| Hook | API call | On success |
|------|----------|------------|
| `useCreateEvent()` | `POST /api/events` | invalidate `["events", workspaceId]` |
| `useUpdateEvent()` | `PATCH /api/events/:id` | invalidate `["events", workspaceId]` |
| `useDeleteEvent()` | `DELETE /api/events/:id` | invalidate `["events", workspaceId]` |

Also update existing mutation hooks:
- `useCreateExpense()` / `useUpdateExpense()` — accept optional `eventId` in payload
- `useCreateRecurringBill()` / `useUpdateRecurringBill()` — accept optional `eventId` in payload

### API client

`apps/app/src/lib/api-client.ts` is **auto-generated** from the Hono RPC types. After adding the events route to the API, restart the dev server to regenerate types before writing frontend code that calls event endpoints.

### `totalSpent` computation note

`useLiveQueryEvents()` computes `totalSpent` per event by filtering `expenseCollection` in-process for each event and summing FX-converted amounts. This is O(events × expenses) but acceptable for typical workspace sizes. If performance becomes a concern in the future, this can be moved to a server-side aggregation endpoint.

When `budget` is `null` (no budget set), the event card/detail shows only `totalSpent` with no progress bar — the budget UI elements are hidden.

### Sidebar navigation

Add "Events" link to the workspace sidebar navigation, alongside Expenses, Recurring Bills, etc.

---

## Data Flow

```
Create event
  POST /api/events → row inserted → Electric syncs to browser → eventCollection updates → useLiveQueryEvents() re-renders list

Create expense with event
  POST /api/expenses { eventId } → expense.event_id set → Electric syncs
  → useLiveQueryEvents() recalculates totalSpent for that event reactively
  → useLiveQueryEventExpenses(eventId) adds expense to detail page list

View /$slug/events/:id
  → useLiveQueryEvents() filtered to single event → overview stats
  → useLiveQueryEventExpenses(eventId) → expense list
  → useLiveQueryEventRecurringBills(eventId) → recurring bills list
  → budget progress = totalSpent / realBudget (FX-converted)

Delete event
  DELETE /api/events/:id → event row removed → expense.event_id set to null via FK SET NULL
  → Electric syncs updated expenses/bills → no financial data lost
```

---

## Migrations

Two migration files:

1. **`XXXX_add_event_table.sql`** — create `event_status_enum`, create `event` table with index
2. **`XXXX_add_event_id_to_expense_and_bill.sql`** — add nullable `event_id` column + index to `expense` and `recurring_bill`

Run order: `bun run db:generate` then `bun run db:migrate`.

---

## Out of Scope (Future)

- Recurring events
- Event-level budgets per category
- Sharing/exporting event summaries
- Dashboard widget for active events
