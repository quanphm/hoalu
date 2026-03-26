# Events Feature Implementation Plan

**Goal:** Add the ability to group expenses and recurring bills under a named event/occasion with budget tracking.

**Architecture:** New `event` table workspace-scoped with `event_id` nullable FK added to `expense` and `recurring_bill`. Backend follows the existing 3-file route pattern. Frontend uses the collection factory + `useLiveQuery` pattern for real-time sync, new routes under `_normal` layout, and dialog atoms for CRUD actions.

**Tech Stack:** Bun, Hono, Drizzle ORM, PostgreSQL 17, Electric SQL, React 19, TanStack Router/Query/DB, Jotai, TailwindCSS v4, shadcn/ui

---

## File Map

### Backend — Create

| File | Purpose |
|------|---------|
| `apps/api/src/routes/events/schema.ts` | Zod schemas: Insert/Update/Delete/EventSchema |
| `apps/api/src/routes/events/repository.ts` | `EventRepository` class: findAllByWorkspaceId, findOne, insert, update, delete |
| `apps/api/src/routes/events/index.ts` | HTTP handlers: GET /, GET /:id, POST /, PATCH /:id, DELETE /:id |

### Backend — Modify

| File | Change |
|------|--------|
| `apps/api/src/db/schema.ts` | Add `eventStatusEnum`, `event` table, `eventId` FK to `expense` and `recurringBill` |
| `apps/api/src/modules/api.ts` | Register `.route("/events", eventsRoute)` |
| `apps/api/src/modules/sync.ts` | Add `/events` Electric SQL shape handler |
| `apps/api/src/routes/expenses/schema.ts` | Add `eventId` optional/nullable to Insert/Update schemas |
| `apps/api/src/routes/expenses/repository.ts` | Pass `eventId` through in insert/update |
| `apps/api/src/routes/expenses/index.ts` | Destructure + pass `eventId` in POST and PATCH handlers |
| `apps/api/src/routes/recurring-bills/schema.ts` | Add `eventId` optional/nullable to Insert/Update schemas |
| `apps/api/src/routes/recurring-bills/repository.ts` | Pass `eventId` through in insert/update |
| `apps/api/src/routes/recurring-bills/index.ts` | Destructure + pass `eventId` in POST and PATCH handlers |

### Frontend — Create

| File | Purpose |
|------|---------|
| `apps/app/src/lib/collections/event.ts` | Electric SQL collection factory for `event` table |
| `apps/app/src/components/events/use-events.ts` | `selectedEventAtom` defined inline (same pattern as `use-recurring-bills.ts`) |
| `apps/app/src/components/events/use-events.ts` | `useLiveQueryEvents`, `useLiveQueryEventExpenses`, `useLiveQueryEventRecurringBills`, `useSelectedEvent` hooks |
| `apps/app/src/components/events/event-list.tsx` | Virtualized event list component |
| `apps/app/src/components/events/event-actions.tsx` | Create/Edit/Delete dialogs |
| `apps/app/src/components/events/event-details.tsx` | Detail panel: stats + expenses/bills list |
| `apps/app/src/routes/_dashboard/$slug/_normal/events.tsx` | Events list route |
| `apps/app/src/components/providers/dialog-provider.tsx` | Add event dialog cases to `Content` switch + import event dialog components |

### Frontend — Modify

| File | Change |
|------|--------|
| `apps/app/src/lib/collections/index.ts` | Add event collection to cleanup functions + re-export |
| `apps/app/src/lib/collections/expense.ts` | Add `event_id` field to collection schema |
| `apps/app/src/lib/collections/recurring-bill.ts` | Add `event_id` field to collection schema |
| `apps/app/src/lib/query-key-factory.ts` | Add `eventKeys` factory |
| `apps/app/src/lib/schema.ts` | Add `EventFormSchema`, `EventPostSchema`, `EventPatchSchema` types |
| `apps/app/src/lib/api-client.ts` | Add `events` API client namespace |
| `apps/app/src/atoms/dialogs.ts` | Add `"create-event"`, `"edit-event"`, `"delete-event"` dialog IDs + atoms |
| `apps/app/src/services/mutations.ts` | Add `useCreateEvent`, `useEditEvent`, `useDeleteEvent` hooks; update expense/bill mutations to pass `eventId` |
| `apps/app/src/components/expenses/expense-actions.tsx` | Add optional "Event" select field to create/edit forms |
| `apps/app/src/components/recurring-bills/recurring-bill-actions.tsx` | Add optional "Event" select field to create/edit forms |
| `apps/app/src/components/layouts/nav-workspace.tsx` | Add Events nav link in sidebar |

---

## Tasks

---

### Task 1: Database schema — add `event` table and FKs

**Files:**
- Modify: `apps/api/src/db/schema.ts:172-177` (after existing enums)

- [ ] **Step 1: Add enum and table to schema**

In `apps/api/src/db/schema.ts`, after the existing enum declarations (line ~177), add:

```typescript
export const eventStatusEnum = pgEnum("event_status_enum", ["open", "closed"]);
```

Then after the `recurringBillOccurrence` table (before `expense`), add:

```typescript
export const event = pgTable(
  "event",
  {
    id: uuid("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    startDate: date("start_date", { mode: "string" }),
    endDate: date("end_date", { mode: "string" }),
    budget: numeric("budget", { precision: 20, scale: 6 }),
    budgetCurrency: varchar("budget_currency", { length: 3 }).notNull().default("USD"),
    status: eventStatusEnum().default("open").notNull(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [index("event_workspace_id_idx").on(table.workspaceId)],
);
```

- [ ] **Step 2: Add `eventId` FK to `expense` table**

In the `expense` table definition in `apps/api/src/db/schema.ts`, add `eventId` after `recurringBillId`:

```typescript
eventId: uuid("event_id").references(() => event.id, { onDelete: "set null" }),
```

Also add an index in the table's index array:

```typescript
index("expense_event_id_idx").on(table.eventId),
```

- [ ] **Step 3: Add `eventId` FK to `recurringBill` table**

In the `recurringBill` table definition, add `eventId` after `categoryId`:

```typescript
eventId: uuid("event_id").references(() => event.id, { onDelete: "set null" }),
```

Also add an index:

```typescript
index("recurring_bill_event_id_idx").on(table.eventId),
```

- [ ] **Step 4: Generate migration**

```bash
cd apps/api && bun run db:generate
```

Expected: new file created in `apps/api/migrations/` — open it and verify it contains `CREATE TYPE event_status_enum`, `CREATE TABLE event`, and two `ALTER TABLE ... ADD COLUMN event_id` statements.

- [ ] **Step 5: Apply migration**

```bash
bun run db:migrate
```

Expected: "Migration applied successfully" (no errors).

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/db/schema.ts apps/api/migrations/
git commit -m "feat(db): add event table and event_id FK to expense and recurring_bill"
```

---

### Task 2: API — events route (schema + repository + handlers)

**Files:**
- Create: `apps/api/src/routes/events/schema.ts`
- Create: `apps/api/src/routes/events/repository.ts`
- Create: `apps/api/src/routes/events/index.ts`

- [ ] **Step 1: Create `schema.ts`**

```typescript
// apps/api/src/routes/events/schema.ts
import { monetary } from "@hoalu/common/monetary";
import { CurrencySchema, IsoDateSchema } from "@hoalu/common/schema";
import * as z from "zod";

export const InsertEventSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    startDate: z.string().optional(), // "yyyy-MM-dd"
    endDate: z.string().optional(),   // "yyyy-MM-dd"
    budget: z.coerce.number().optional(),
    budgetCurrency: CurrencySchema.optional(),
    workspaceId: z.uuidv7(),
  })
  .refine(
    (val) => {
      if (val.startDate && val.endDate) {
        return val.endDate >= val.startDate;
      }
      return true;
    },
    { message: "end_date must be >= start_date", path: ["endDate"] },
  );

// Note: Do NOT use InsertEventSchema.omit() — InsertEventSchema has .refine() which returns
// a ZodPipe in Zod v4 and does not support .omit(). Define UpdateEventSchema independently.
export const UpdateEventSchema = z
  .object({
    title: z.string().min(1),
    description: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    budget: z.coerce.number().nullable(),
    budgetCurrency: CurrencySchema,
    status: z.enum(["open", "closed"]),
  })
  .partial()
  .refine(
    (val) => {
      if (val.startDate && val.endDate) {
        return val.endDate >= val.startDate;
      }
      return true;
    },
    { message: "end_date must be >= start_date", path: ["endDate"] },
  );

export const EventSchema = z
  .object({
    id: z.uuidv7(),
    title: z.string(),
    description: z.string().nullable(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    budget: z.coerce.number().nullable(),
    budgetCurrency: CurrencySchema,
    status: z.enum(["open", "closed"]),
    workspaceId: z.uuidv7(),
    creatorId: z.uuidv7().nullable(),
    createdAt: IsoDateSchema,
    updatedAt: IsoDateSchema,
  })
  .transform((val) => ({
    ...val,
    realBudget: val.budget != null ? monetary.fromRealAmount(val.budget, val.budgetCurrency) : null,
  }));

export const EventsSchema = z.array(EventSchema);

export const DeleteEventSchema = z.object({
  id: z.uuidv7(),
});
```

- [ ] **Step 2: Create `repository.ts`**

```typescript
// apps/api/src/routes/events/repository.ts
import { db, schema } from "#api/db/index.ts";
import { and, desc, eq, sql } from "drizzle-orm";

type NewEvent = typeof schema.event.$inferInsert;

export class EventRepository {
  async findAllByWorkspaceId(param: { workspaceId: string }) {
    return db
      .select()
      .from(schema.event)
      .where(eq(schema.event.workspaceId, param.workspaceId))
      .orderBy(desc(schema.event.createdAt));
  }

  async findOne(param: { id: string; workspaceId: string }) {
    const [result] = await db
      .select()
      .from(schema.event)
      .where(
        and(
          eq(schema.event.id, param.id),
          eq(schema.event.workspaceId, param.workspaceId),
        ),
      );
    return result ?? null;
  }

  async insert(param: NewEvent) {
    try {
      const [result] = await db.insert(schema.event).values(param).returning();
      return result;
    } catch (_error) {
      return null;
    }
  }

  async update<T>(param: { id: string; workspaceId: string; payload: T }) {
    try {
      const [result] = await db
        .update(schema.event)
        .set({ ...param.payload, updatedAt: sql`now()` })
        .where(
          and(
            eq(schema.event.id, param.id),
            eq(schema.event.workspaceId, param.workspaceId),
          ),
        )
        .returning();
      return result ?? null;
    } catch (_error) {
      return null;
    }
  }

  async delete(param: { id: string; workspaceId: string }) {
    await db
      .delete(schema.event)
      .where(
        and(
          eq(schema.event.id, param.id),
          eq(schema.event.workspaceId, param.workspaceId),
        ),
      );
    return { id: param.id };
  }
}
```

- [ ] **Step 3: Create `index.ts`**

```typescript
// apps/api/src/routes/events/index.ts
import { createHonoInstance } from "#api/lib/create-app.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import { EventRepository } from "#api/routes/events/repository.ts";
import {
  DeleteEventSchema,
  EventSchema,
  EventsSchema,
  InsertEventSchema,
  UpdateEventSchema,
} from "#api/routes/events/schema.ts";
import { idParamValidator } from "#api/validators/id-param.ts";
import { jsonBodyValidator } from "#api/validators/json-body.ts";
import { workspaceQueryValidator } from "#api/validators/workspace-query.ts";
import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import * as z from "zod";

const app = createHonoInstance();
const repository = new EventRepository();
const TAGS = ["Events"];

const route = app
  .get(
    "/",
    describeRoute({
      tags: TAGS,
      summary: "Get all events",
      responses: {
        ...OpenAPI.unauthorized(),
        ...OpenAPI.bad_request(),
        ...OpenAPI.server_parse_error(),
        ...OpenAPI.response(z.object({ data: EventsSchema }), HTTPStatus.codes.OK),
      },
    }),
    workspaceQueryValidator,
    workspaceMember,
    async (c) => {
      const workspace = c.get("workspace");
      const events = await repository.findAllByWorkspaceId({ workspaceId: workspace.id });
      const parsed = EventsSchema.safeParse(events);
      if (!parsed.success) {
        return c.json(
          { message: createIssueMsg(parsed.error.issues) },
          HTTPStatus.codes.UNPROCESSABLE_ENTITY,
        );
      }
      return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
    },
  )
  .get(
    "/:id",
    describeRoute({
      tags: TAGS,
      summary: "Get a single event",
      responses: {
        ...OpenAPI.unauthorized(),
        ...OpenAPI.bad_request(),
        ...OpenAPI.not_found(),
        ...OpenAPI.server_parse_error(),
        ...OpenAPI.response(z.object({ data: EventSchema }), HTTPStatus.codes.OK),
      },
    }),
    idParamValidator,
    workspaceQueryValidator,
    workspaceMember,
    async (c) => {
      const workspace = c.get("workspace");
      const { id } = c.req.valid("param");
      const event = await repository.findOne({ id, workspaceId: workspace.id });
      if (!event) {
        return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
      }
      const parsed = EventSchema.safeParse(event);
      if (!parsed.success) {
        return c.json(
          { message: createIssueMsg(parsed.error.issues) },
          HTTPStatus.codes.UNPROCESSABLE_ENTITY,
        );
      }
      return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
    },
  )
  .post(
    "/",
    describeRoute({
      tags: TAGS,
      summary: "Create a new event",
      responses: {
        ...OpenAPI.unauthorized(),
        ...OpenAPI.bad_request(),
        ...OpenAPI.server_parse_error(),
        ...OpenAPI.response(z.object({ data: EventSchema }), HTTPStatus.codes.CREATED),
      },
    }),
    workspaceQueryValidator,
    workspaceMember,
    jsonBodyValidator(InsertEventSchema),
    async (c) => {
      const user = c.get("user");
      if (!user) {
        throw new HTTPException(HTTPStatus.codes.UNAUTHORIZED, {
          message: HTTPStatus.phrases.UNAUTHORIZED,
        });
      }
      const workspace = c.get("workspace");
      const payload = c.req.valid("json");

      // Default budgetCurrency to workspace currency if not provided
      const workspaceCurrency = (workspace.metadata?.currency as string) ?? "USD";

      const event = await repository.insert({
        id: generateId({ use: "uuid" }),
        title: payload.title,
        description: payload.description ?? null,
        startDate: payload.startDate ?? null,
        endDate: payload.endDate ?? null,
        budget: payload.budget != null ? `${payload.budget}` : null,
        budgetCurrency: payload.budgetCurrency ?? workspaceCurrency,
        workspaceId: workspace.id,
        creatorId: user.id,
      });

      if (!event) {
        return c.json({ message: "Create failed" }, HTTPStatus.codes.BAD_REQUEST);
      }

      const parsed = EventSchema.safeParse(event);
      if (!parsed.success) {
        return c.json(
          { message: createIssueMsg(parsed.error.issues) },
          HTTPStatus.codes.UNPROCESSABLE_ENTITY,
        );
      }
      return c.json({ data: parsed.data }, HTTPStatus.codes.CREATED);
    },
  )
  .patch(
    "/:id",
    describeRoute({
      tags: TAGS,
      summary: "Update an event",
      responses: {
        ...OpenAPI.unauthorized(),
        ...OpenAPI.bad_request(),
        ...OpenAPI.not_found(),
        ...OpenAPI.server_parse_error(),
        ...OpenAPI.response(z.object({ data: EventSchema }), HTTPStatus.codes.OK),
      },
    }),
    idParamValidator,
    workspaceQueryValidator,
    workspaceMember,
    jsonBodyValidator(UpdateEventSchema),
    async (c) => {
      const workspace = c.get("workspace");
      const { id } = c.req.valid("param");
      const payload = c.req.valid("json");

      const existing = await repository.findOne({ id, workspaceId: workspace.id });
      if (!existing) {
        return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
      }

      const updatePayload: Record<string, unknown> = {};
      if (payload.title !== undefined) updatePayload.title = payload.title;
      if (payload.description !== undefined) updatePayload.description = payload.description;
      if (payload.startDate !== undefined) updatePayload.startDate = payload.startDate;
      if (payload.endDate !== undefined) updatePayload.endDate = payload.endDate;
      if (payload.budget !== undefined)
        updatePayload.budget = payload.budget != null ? `${payload.budget}` : null;
      if (payload.budgetCurrency !== undefined) updatePayload.budgetCurrency = payload.budgetCurrency;
      if (payload.status !== undefined) updatePayload.status = payload.status;

      const event = await repository.update({ id, workspaceId: workspace.id, payload: updatePayload });
      if (!event) {
        return c.json({ message: "Update failed" }, HTTPStatus.codes.BAD_REQUEST);
      }

      const parsed = EventSchema.safeParse(event);
      if (!parsed.success) {
        return c.json(
          { message: createIssueMsg(parsed.error.issues) },
          HTTPStatus.codes.UNPROCESSABLE_ENTITY,
        );
      }
      return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
    },
  )
  .delete(
    "/:id",
    describeRoute({
      tags: TAGS,
      summary: "Delete an event",
      responses: {
        ...OpenAPI.unauthorized(),
        ...OpenAPI.bad_request(),
        ...OpenAPI.not_found(),
        ...OpenAPI.server_parse_error(),
        ...OpenAPI.response(z.object({ data: DeleteEventSchema }), HTTPStatus.codes.OK),
      },
    }),
    idParamValidator,
    workspaceQueryValidator,
    workspaceMember,
    async (c) => {
      const workspace = c.get("workspace");
      const { id } = c.req.valid("param");

      const existing = await repository.findOne({ id, workspaceId: workspace.id });
      if (!existing) {
        return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
      }

      const result = await repository.delete({ id, workspaceId: workspace.id });
      const parsed = DeleteEventSchema.safeParse(result);
      if (!parsed.success) {
        return c.json(
          { message: createIssueMsg(parsed.error.issues) },
          HTTPStatus.codes.UNPROCESSABLE_ENTITY,
        );
      }
      return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
    },
  );

export default route;
```

- [ ] **Step 4: Register route in api.ts**

In `apps/api/src/modules/api.ts`, add after existing imports:

```typescript
import eventsRoute from "#api/routes/events/index.ts";
```

And add to the app chain:

```typescript
.route("/events", eventsRoute)
```

- [ ] **Step 5: Register events shape in sync.ts**

In `apps/api/src/modules/sync.ts`, add after the `/incomes` handler (before `/exchange-rates`):

```typescript
.get("/events", workspaceQueryValidator, workspaceMember, async (c) => {
  const workspace = c.get("workspace");
  const shapeUrl = prepareElectricUrl(c.req.url);
  const whereClause = `workspace_id = '${workspace.id}'`;

  shapeUrl.searchParams.set("table", "event");
  shapeUrl.searchParams.set("where", whereClause);

  const [data, headers] = await proxyElectricRequest(shapeUrl);
  return c.json(data, HTTPStatus.codes.OK, headers.toJSON());
})
```

- [ ] **Step 6: Restart API dev server**

```bash
# Stop the running dev server (Ctrl+C), then:
bun run dev
```

Note: `apps/app/src/lib/api-client.ts` is a **manually maintained** file, not auto-generated. After the API is running, proceed to Task 5 to hand-write the `events` client namespace.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/routes/events/ apps/api/src/modules/api.ts apps/api/src/modules/sync.ts
git commit -m "feat(api): add events CRUD routes and Electric sync shape"
```

---

### Task 3: API — extend expense and recurring-bill routes with `eventId`

**Files:**
- Modify: `apps/api/src/routes/expenses/schema.ts`
- Modify: `apps/api/src/routes/expenses/repository.ts`
- Modify: `apps/api/src/routes/expenses/index.ts`
- Modify: `apps/api/src/routes/recurring-bills/schema.ts`
- Modify: `apps/api/src/routes/recurring-bills/repository.ts`
- Modify: `apps/api/src/routes/recurring-bills/index.ts`

- [ ] **Step 1: Extend expense schemas**

In `apps/api/src/routes/expenses/schema.ts`:

Add to `InsertExpenseSchema` (after `recurringBillId`):
```typescript
eventId: z.uuidv7().optional(),
```

Add to `UpdateExpenseSchema` (after `recurringBillId`):
```typescript
eventId: z.uuidv7().nullable(),
```

- [ ] **Step 2: Extend expense repository**

`ExpenseRepository.insert` in `apps/api/src/routes/expenses/repository.ts` already accepts `NewExpense` which is `typeof schema.expense.$inferInsert` — since we added `eventId` to the Drizzle schema, it will now be included automatically. No code change needed here.

Verify by checking that `schema.expense.$inferInsert` now includes `eventId?: string | null`.

- [ ] **Step 3: Extend expense POST handler**

In `apps/api/src/routes/expenses/index.ts`, in the `POST /` handler, the line:

```typescript
const { amount, currency, date, recurringBillId, ...rest } = payload;
```

already spreads `...rest` into the `expenseRepository.insert()` call. Since `eventId` is now in the schema and in `InsertExpenseSchema`, it will be included in `rest` automatically. No change needed in the destructure.

Verify by checking the `expenseRepository.insert({ ...rest, ... })` call includes any `eventId` from `rest`.

- [ ] **Step 4: Extend expense PATCH handler**

In `apps/api/src/routes/expenses/index.ts`, in the `PATCH /:id` handler, find the section that builds `expenseSet` (around line 372). Add after the existing `if` blocks:

```typescript
if (payload.eventId !== undefined) expenseSet.eventId = payload.eventId;
```

- [ ] **Step 5: Extend recurring-bill schemas**

In `apps/api/src/routes/recurring-bills/schema.ts`:

Add to `InsertRecurringBillSchema`:
```typescript
eventId: z.uuidv7().optional(),
```

Add to `UpdateRecurringBillSchema` (find where it's defined and add):
```typescript
eventId: z.uuidv7().nullable().optional(),
```

- [ ] **Step 6: Extend recurring-bill repository and handlers**

Open `apps/api/src/routes/recurring-bills/repository.ts`. The `insert` method accepts `typeof schema.recurringBill.$inferInsert` which now includes `eventId`. Verify the `insert` method passes through the full payload object — no change required if it spreads `param` directly.

Open `apps/api/src/routes/recurring-bills/index.ts`. In the `POST /` handler, find where the bill is inserted and ensure `eventId` from the payload is passed. Add `eventId: payload.eventId ?? null` to the insert call if not already spread.

In the `PATCH /:id` handler, add `eventId` to the update payload construction similarly to how expense handles it.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/routes/expenses/ apps/api/src/routes/recurring-bills/
git commit -m "feat(api): add eventId field to expense and recurring-bill routes"
```

---

### Task 4: Frontend — Electric SQL collection for events

**Files:**
- Create: `apps/app/src/lib/collections/event.ts`
- Modify: `apps/app/src/lib/collections/expense.ts`
- Modify: `apps/app/src/lib/collections/recurring-bill.ts`
- Modify: `apps/app/src/lib/collections/index.ts`

- [ ] **Step 1: Create `event.ts` collection**

```typescript
// apps/app/src/lib/collections/event.ts
import { createCollectionFactory } from "#app/lib/collections/create-collection-factory.ts";
import { CurrencySchema, IsoDateSchema } from "@hoalu/common/schema";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

const EventCollectionSchema = z.object({
  id: z.uuidv7(),
  title: z.string(),
  description: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  budget: z.coerce.number().nullable(),
  budget_currency: CurrencySchema,
  status: z.enum(["open", "closed"]),
  workspace_id: z.uuidv7(),
  creator_id: z.uuidv7().nullable(),
  created_at: IsoDateSchema,
  updated_at: IsoDateSchema,
});

const factory = createCollectionFactory("event", (slug: string) =>
  createCollection(
    electricCollectionOptions({
      id: `event-${slug}`,
      getKey: (item) => item.id,
      shapeOptions: {
        url: `${import.meta.env.PUBLIC_API_URL}/sync/events?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
      },
      schema: EventCollectionSchema,
    }),
  ),
);

export const eventCollectionFactory = factory.get;
export const clearEventCollection = factory.clear;
```

- [ ] **Step 2: Add `event_id` to expense collection schema**

In `apps/app/src/lib/collections/expense.ts`, add to `ExpenseCollectionSchema`:

```typescript
event_id: z.uuidv7().nullable(),
```

- [ ] **Step 3: Add `event_id` to recurring-bill collection schema**

In `apps/app/src/lib/collections/recurring-bill.ts`, add to the schema:

```typescript
event_id: z.uuidv7().nullable(),
```

- [ ] **Step 4: Register in collections index**

In `apps/app/src/lib/collections/index.ts`:

Add import:
```typescript
import { clearEventCollection } from "./event.ts";
```

Add to `clearWorkspaceCollections`:
```typescript
clearEventCollection(slug);
```

Add to `clearAllWorkspaceCollections`:
```typescript
clearEventCollection();
```

Add re-export:
```typescript
export * from "./event.ts";
```

- [ ] **Step 5: Commit**

```bash
git add apps/app/src/lib/collections/
git commit -m "feat(frontend): add event Electric SQL collection and extend expense/bill schemas"
```

---

### Task 5: Frontend — query keys, schema types, API client, dialog atoms

**Files:**
- Modify: `apps/app/src/lib/query-key-factory.ts`
- Modify: `apps/app/src/lib/schema.ts`
- Modify: `apps/app/src/lib/api-client.ts`
- Modify: `apps/app/src/atoms/dialogs.ts`

- [ ] **Step 1: Add `eventKeys` to query key factory**

In `apps/app/src/lib/query-key-factory.ts`, add after `recurringBillKeys`:

```typescript
export const eventKeys = {
  all: (slug: string) => eventKeys["~withWorkspace"](slug),
  withId: (slug: string, id: string) => [...eventKeys.all(slug), "id", id] as const,
  "~withWorkspace": (slug: string) => [...workspaceKeys.withSlug(slug), "events"] as const,
};
```

- [ ] **Step 2: Add event types to schema.ts**

In `apps/app/src/lib/schema.ts`, add after the existing `recurringBillKeys` or at the end of the file:

```typescript
/**
 * events
 */
export const EventFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.coerce.number().optional(),
  budgetCurrency: z.string().length(3).optional(),
  status: z.enum(["open", "closed"]).optional(),
});
export type EventFormSchema = z.infer<typeof EventFormSchema>;
export type EventPostSchema = InferRequestType<typeof honoClient.bff.events.$post>["json"];
export type EventPatchSchema = InferRequestType<
  (typeof honoClient.bff.events)[":id"]["$patch"]
>["json"];
export type EventSchema = InferResponseType<typeof honoClient.bff.events.$get, 200>["data"][number];
```

Note: `honoClient.bff.events` is available after restarting the API dev server in Task 2.

- [ ] **Step 3: Add `events` namespace to api-client.ts**

In `apps/app/src/lib/api-client.ts`, add an `events` section following the exact same pattern as `wallets` or `categories`. Add after the `recurringBills` block:

```typescript
const events = {
  list: async (slug: string) => {
    const response = await honoClient.bff.events.$get({
      query: { workspaceIdOrSlug: slug },
    });
    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(message);
    }
    const { data } = await response.json();
    return data;
  },
  get: async (slug: string, id: string) => {
    const response = await honoClient.bff.events[":id"].$get({
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
  create: async (slug: string, payload: EventPostSchema) => {
    const response = await honoClient.bff.events.$post({
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
  edit: async (slug: string, id: string, payload: EventPatchSchema) => {
    const response = await honoClient.bff.events[":id"].$patch({
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
    const response = await honoClient.bff.events[":id"].$delete({
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
```

Then add `events` to the `export const apiClient` object at the bottom of the file.

- [ ] **Step 4: Add event dialog IDs and atoms**

In `apps/app/src/atoms/dialogs.ts`:

Add to the `DIALOG_ID` array:
```typescript
// event
"create-event",
"edit-event",
"delete-event",
```

Add at the bottom of the file:
```typescript
export const createEventDialogAtom = createDialogAtom("create-event");
export const editEventDialogAtom = createDialogAtom("edit-event");
export const deleteEventDialogAtom = createDialogAtom("delete-event");
```

- [ ] **Step 5: Commit**

```bash
git add apps/app/src/lib/query-key-factory.ts apps/app/src/lib/schema.ts apps/app/src/lib/api-client.ts apps/app/src/atoms/dialogs.ts
git commit -m "feat(frontend): add event query keys, schema types, API client, and dialog atoms"
```

---

### Task 6: Frontend — event mutations

**Files:**
- Modify: `apps/app/src/services/mutations.ts`

- [ ] **Step 1: Add imports**

In `apps/app/src/services/mutations.ts`, add to the existing import block:

```typescript
import { eventKeys } from "#app/lib/query-key-factory.ts";
import type { EventPostSchema, EventPatchSchema } from "#app/lib/schema.ts";
import { createEventDialogAtom, editEventDialogAtom, deleteEventDialogAtom } from "#app/atoms/dialogs.ts";
```

- [ ] **Step 2: Add `useCreateEvent`**

Add after `useDeleteRecurringBill` (before `useDuplicateExpense`):

```typescript
/**
 * events
 */

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { slug } = routeApi.useParams();
  const mutation = useMutation({
    mutationFn: async ({ payload }: { payload: EventPostSchema }) => {
      const result = await apiClient.events.create(slug, payload);
      return result;
    },
    onSuccess: () => {
      haptics.trigger("success");
      playConfirmSound();
      toastManager.add({ title: "Event created.", type: "success" });
      queryClient.invalidateQueries({ queryKey: eventKeys.all(slug) });
    },
    onError: (error) => {
      haptics.trigger("error");
      toastManager.add({ title: "Uh oh! Something went wrong.", description: error.message, type: "error" });
    },
  });
  return mutation;
}

export function useEditEvent() {
  const queryClient = useQueryClient();
  const { slug } = routeApi.useParams();
  const mutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: EventPatchSchema }) => {
      const result = await apiClient.events.edit(slug, id, payload);
      return result;
    },
    onSuccess: () => {
      haptics.trigger("success");
      playConfirmSound();
      toastManager.add({ title: "Event updated.", type: "success" });
      queryClient.invalidateQueries({ queryKey: eventKeys.all(slug) });
    },
    onError: (error) => {
      haptics.trigger("error");
      toastManager.add({ title: "Uh oh! Something went wrong.", description: error.message, type: "error" });
    },
  });
  return mutation;
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { slug } = routeApi.useParams();
  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const result = await apiClient.events.delete(slug, id);
      return result;
    },
    onSuccess: (rs) => {
      haptics.trigger("warning");
      playDropSound();
      toastManager.add({ title: "Event deleted.", type: "success" });
      queryClient.removeQueries({ queryKey: eventKeys.withId(slug, rs.id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.all(slug) });
    },
    onError: (error) => {
      haptics.trigger("error");
      toastManager.add({ title: "Uh oh! Something went wrong.", description: error.message, type: "error" });
    },
  });
  return mutation;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/app/src/services/mutations.ts
git commit -m "feat(frontend): add event mutation hooks"
```

---

### Task 7: Frontend — live query hooks for events

**Files:**
- Create: `apps/app/src/components/events/use-events.ts`

- [ ] **Step 1: Create the hooks file**

```typescript
// apps/app/src/components/events/use-events.ts
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
  eventCollectionFactory,
  expenseCollectionFactory,
  recurringBillCollectionFactory,
  walletCollectionFactory,
  categoryCollectionFactory,
  exchangeRateCollection,
} from "#app/lib/collections/index.ts";
import { calculateCrossRate, lookupExchangeRate } from "@hoalu/common/exchange-rate";
import { monetary } from "@hoalu/common/monetary";
import { zeroDecimalCurrencies } from "@hoalu/countries";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { atom, useAtom } from "jotai";
import { useMemo } from "react";

export const selectedEventAtom = atom<{ id: string | null }>({ id: null });

export function useSelectedEvent() {
  const [event, setSelectedEvent] = useAtom(selectedEventAtom);
  const onSelectEvent = (id: string | null) => setSelectedEvent({ id });
  return { event, onSelectEvent };
}

// Helper to build FX rate lookup data (same pattern as use-recurring-bills.ts)
function useFxRateData() {
  const { data: fxRateData } = useLiveQuery((q) =>
    q.from({ fxRate: exchangeRateCollection }).fn.select(({ fxRate }) => ({
      from: fxRate.from_currency,
      to: fxRate.to_currency,
      exchangeRate: `${fxRate.exchange_rate}`,
      inverseRate: `${fxRate.inverse_rate}`,
      validFrom: fxRate.valid_from,
      validTo: fxRate.valid_to,
    })),
  );
  return fxRateData;
}

/**
 * Main list hook — all events for the workspace, with totalSpent computed
 * by summing FX-converted expense amounts per event.
 *
 * Performance note: O(events × expenses) — acceptable for typical workspace sizes.
 */
export function useLiveQueryEvents() {
  const workspace = useWorkspace();
  const collection = eventCollectionFactory(workspace.slug);
  const expenseCollection = expenseCollectionFactory(workspace.slug);
  const fxRateData = useFxRateData();

  const { data: events } = useLiveQuery(
    (q) =>
      q
        .from({ event: collection })
        .orderBy(({ event }) => event.created_at, "desc")
        .select(({ event }) => ({ ...event })),
    [workspace.slug],
  );

  const { data: expenses } = useLiveQuery(
    (q) =>
      q
        .from({ expense: expenseCollection })
        .select(({ expense }) => ({
          id: expense.id,
          event_id: expense.event_id,
          amount: expense.amount,
          currency: expense.currency,
          date: expense.date,
        })),
    [workspace.slug],
  );

  return useMemo(() => {
    if (!events) return [];
    const workspaceCurrency = workspace.metadata.currency as string;

    // Build a map of event_id → totalSpent (FX-converted, display units)
    const totalSpentMap = new Map<string, number>();
    for (const exp of expenses ?? []) {
      if (!exp.event_id) continue;
      const existing = totalSpentMap.get(exp.event_id) ?? 0;

      let convertedAmount = monetary.fromRealAmount(Number(exp.amount), exp.currency);
      if (exp.currency !== workspaceCurrency) {
        const date = exp.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
        const exchangeRate = lookupExchangeRate(
          {
            findDirect: ([from, to], d) => {
              const match = fxRateData.find((rate) => {
                const inRange =
                  new Date(rate.validFrom) <= new Date(d) &&
                  new Date(d) <= new Date(rate.validTo);
                const correctPair =
                  (rate.from === from && rate.to === to) ||
                  (rate.from === to && rate.to === from);
                return inRange && correctPair;
              });
              if (!match) return null;
              return {
                fromCurrency: match.from,
                toCurrency: match.to,
                exchangeRate: `${match.exchangeRate}`,
                inverseRate: `${match.inverseRate}`,
              };
            },
            findCrossRate: ([from, to], d) => {
              const usdRates = fxRateData.filter((rate) => {
                const inRange =
                  new Date(rate.validFrom) <= new Date(d) &&
                  new Date(d) <= new Date(rate.validTo);
                return inRange && (rate.to === from || rate.to === to);
              });
              return calculateCrossRate({
                pair: [from, to],
                usdToFrom: usdRates.find((r) => r.to === from),
                usdToTo: usdRates.find((r) => r.to === to),
              });
            },
          },
          [exp.currency, workspaceCurrency],
          date,
        );
        const isNoCent = zeroDecimalCurrencies.find((c) => c === exp.currency);
        const factor = isNoCent ? 1 : 100;
        convertedAmount =
          Number(exp.amount) * ((exchangeRate ? Number(exchangeRate.exchangeRate) : 0) / factor);
      }

      totalSpentMap.set(exp.event_id, existing + convertedAmount);
    }

    return events.map((e) => ({
      ...e,
      totalSpent: totalSpentMap.get(e.id) ?? 0,
      realBudget: e.budget != null ? monetary.fromRealAmount(Number(e.budget), e.budget_currency) : null,
    }));
  }, [events, expenses, fxRateData, workspace.metadata.currency]);
}

export type SyncedEvent = ReturnType<typeof useLiveQueryEvents>[number];
export type SyncedEvents = ReturnType<typeof useLiveQueryEvents>;

/**
 * Expenses filtered by event_id — for the event detail page.
 * Same join/transform pattern as useLiveQueryExpenses.
 */
export function useLiveQueryEventExpenses(eventId: string) {
  const workspace = useWorkspace();
  const expenseCollection = expenseCollectionFactory(workspace.slug);
  const walletCollection = walletCollectionFactory(workspace.slug);
  const categoryCollection = categoryCollectionFactory(workspace.slug);
  const fxRateData = useFxRateData();

  const { data } = useLiveQuery(
    (q) =>
      q
        .from({ expense: expenseCollection })
        .innerJoin({ wallet: walletCollection }, ({ expense, wallet }) =>
          eq(expense.wallet_id, wallet.id),
        )
        .leftJoin({ category: categoryCollection }, ({ expense, category }) =>
          eq(expense.category_id, category.id),
        )
        .where(({ expense }) => eq(expense.event_id, eventId))
        .orderBy(({ expense }) => expense.date, "desc")
        .select(({ expense, wallet, category }) => ({
          ...expense,
          wallet: {
            id: wallet.id,
            name: wallet.name,
            description: wallet.description,
            currency: wallet.currency,
            type: wallet.type,
            isActive: wallet.is_active,
          },
          category: category
            ? {
                id: category.id,
                name: category.name,
                description: category.description,
                color: category.color,
              }
            : null,
        })),
    [workspace.slug, eventId],
  );

  return useMemo(() => {
    if (!data) return [];
    const workspaceCurrency = workspace.metadata.currency as string;
    return data.map((exp) => {
      const amount = monetary.fromRealAmount(Number(exp.amount), exp.currency);
      return {
        ...exp,
        amount,
        realAmount: Number(exp.amount),
        convertedAmount: amount, // simplified — full FX conversion can be added if needed
      };
    });
  }, [data, workspace.metadata.currency]);
}

export type SyncedEventExpense = ReturnType<typeof useLiveQueryEventExpenses>[number];

/**
 * Recurring bills filtered by event_id — for the event detail page.
 */
export function useLiveQueryEventRecurringBills(eventId: string) {
  const workspace = useWorkspace();
  const collection = recurringBillCollectionFactory(workspace.slug);
  const walletCollection = walletCollectionFactory(workspace.slug);
  const categoryCollection = categoryCollectionFactory(workspace.slug);

  const { data } = useLiveQuery(
    (q) =>
      q
        .from({ bill: collection })
        .innerJoin({ wallet: walletCollection }, ({ bill, wallet }) =>
          eq(bill.wallet_id, wallet.id),
        )
        .leftJoin({ category: categoryCollection }, ({ bill, category }) =>
          eq(bill.category_id, category.id),
        )
        .where(({ bill }) => eq(bill.event_id, eventId))
        .orderBy(({ bill }) => bill.created_at, "desc")
        .select(({ bill, wallet, category }) => ({
          ...bill,
          wallet_name: wallet.name,
          category_name: category?.name ?? null,
          category_color: category?.color ?? null,
        })),
    [workspace.slug, eventId],
  );

  return useMemo(() => {
    if (!data) return [];
    return data.map((b) => ({
      ...b,
      amount: monetary.fromRealAmount(Number(b.amount), b.currency),
      realAmount: Number(b.amount),
    }));
  }, [data]);
}

export type SyncedEventBill = ReturnType<typeof useLiveQueryEventRecurringBills>[number];
```

- [ ] **Step 2: Commit**

```bash
git add apps/app/src/components/events/use-events.ts
git commit -m "feat(frontend): add event live query hooks"
```

---

### Task 8: Frontend — event list, actions, and detail components

**Files:**
- Create: `apps/app/src/components/events/event-list.tsx`
- Create: `apps/app/src/components/events/event-actions.tsx`
- Create: `apps/app/src/components/events/event-details.tsx`

- [ ] **Step 1: Create `event-list.tsx`**

```typescript
// apps/app/src/components/events/event-list.tsx
import { type SyncedEvent, useSelectedEvent } from "#app/components/events/use-events.ts";
import { cn } from "@hoalu/ui/utils";

interface EventListProps {
  events: SyncedEvent[];
}

export function EventList({ events }: EventListProps) {
  const { event: selected, onSelectEvent } = useSelectedEvent();

  if (!events.length) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
        No events yet. Create one to start grouping expenses.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {events.map((e) => (
        <EventListItem
          key={e.id}
          event={e}
          isSelected={selected.id === e.id}
          onSelect={() => onSelectEvent(e.id)}
        />
      ))}
    </div>
  );
}

function EventListItem({
  event,
  isSelected,
  onSelect,
}: {
  event: SyncedEvent;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const progress =
    event.realBudget && event.realBudget > 0
      ? Math.min((event.totalSpent / event.realBudget) * 100, 100)
      : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "hover:bg-muted/50 flex w-full flex-col gap-1.5 rounded-md px-3 py-2.5 text-left transition-colors",
        isSelected && "bg-muted",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium truncate">{event.title}</span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
            event.status === "open"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
          )}
        >
          {event.status}
        </span>
      </div>

      {(event.start_date || event.end_date) && (
        <span className="text-muted-foreground text-xs">
          {event.start_date ?? "?"} – {event.end_date ?? "ongoing"}
        </span>
      )}

      <div className="flex items-center justify-between gap-2 text-xs">
        <span>
          {event.budget_currency} {event.totalSpent.toFixed(2)} spent
        </span>
        {event.realBudget != null && (
          <span className="text-muted-foreground">
            / {event.budget_currency} {event.realBudget.toFixed(2)}
          </span>
        )}
      </div>

      {progress != null && (
        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              progress >= 100 ? "bg-destructive" : progress >= 80 ? "bg-orange-400" : "bg-primary",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Create `event-actions.tsx`**

This file contains the Create, Edit, and Delete dialog components. Follow the exact same pattern as `recurring-bill-actions.tsx` — use `useAppForm`, `DialogPopup`, `DialogHeader`, `DialogFooter`, `DialogClose`, `WarningMessage`.

```typescript
// apps/app/src/components/events/event-actions.tsx
import {
  createEventDialogAtom,
  deleteEventDialogAtom,
  editEventDialogAtom,
} from "#app/atoms/dialogs.ts";
import { type SyncedEvent, useSelectedEvent } from "#app/components/events/use-events.ts";
import { useAppForm } from "#app/components/forms/index.tsx";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { useCreateEvent, useDeleteEvent, useEditEvent } from "#app/services/mutations.ts";
import { Button, type ButtonProps } from "@hoalu/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogHeaderAction,
  DialogPopup,
  DialogTitle,
} from "@hoalu/ui/dialog";
import { Field, FieldGroup } from "@hoalu/ui/field";
import { useAtom, useSetAtom } from "jotai";
import * as z from "zod";

const EventFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.coerce.number().optional(),
  budgetCurrency: z.string().length(3).optional(),
});
type EventFormSchema = z.infer<typeof EventFormSchema>;

export function CreateEventDialogTrigger({ ...props }: ButtonProps) {
  const setDialog = useSetAtom(createEventDialogAtom);
  return (
    <Button variant="outline" {...props} onClick={() => setDialog({ state: true })}>
      Create event
    </Button>
  );
}

export function CreateEventDialogContent() {
  return (
    <DialogPopup className="sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>Create event</DialogTitle>
        <DialogDescription>Group expenses and bills under a named occasion.</DialogDescription>
        <DialogHeaderAction />
      </DialogHeader>
      <CreateEventForm />
    </DialogPopup>
  );
}

function CreateEventForm() {
  const workspace = useWorkspace();
  const mutation = useCreateEvent();
  const setDialog = useSetAtom(createEventDialogAtom);

  const form = useAppForm({
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      budget: undefined,
      budgetCurrency: (workspace.metadata?.currency as string) ?? "USD",
    } as EventFormSchema,
    validators: { onSubmit: EventFormSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        payload: {
          title: value.title,
          description: value.description,
          startDate: value.startDate || undefined,
          endDate: value.endDate || undefined,
          budget: value.budget,
          budgetCurrency: value.budgetCurrency,
          workspaceId: workspace.id,
        },
      });
      setDialog({ state: false });
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <FieldGroup className="p-4">
          <form.AppField name="title" children={(f) => <f.InputField label="Title" required autoFocus />} />
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="startDate" children={(f) => <f.InputField label="Start date" placeholder="yyyy-MM-dd" />} />
            <form.AppField name="endDate" children={(f) => <f.InputField label="End date" placeholder="yyyy-MM-dd" />} />
          </div>
          <form.AppField name="budget" children={(f) => <f.InputField label="Budget (optional)" type="number" />} />
          <form.AppField name="description" children={(f) => <f.TiptapField label="Notes" />} />
        </FieldGroup>
        <DialogFooter>
          <Field orientation="horizontal" className="justify-end px-4 pb-4">
            <form.SubscribeButton>Create event</form.SubscribeButton>
          </Field>
        </DialogFooter>
      </form.Form>
    </form.AppForm>
  );
}

export function EditEventDialogContent({ event }: { event: SyncedEvent }) {
  return (
    <DialogPopup className="sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>Edit event</DialogTitle>
        <DialogHeaderAction />
      </DialogHeader>
      <EditEventForm event={event} />
    </DialogPopup>
  );
}

function EditEventForm({ event }: { event: SyncedEvent }) {
  const mutation = useEditEvent();
  const setDialog = useSetAtom(editEventDialogAtom);

  const form = useAppForm({
    defaultValues: {
      title: event.title,
      description: event.description ?? "",
      startDate: event.start_date ?? "",
      endDate: event.end_date ?? "",
      budget: event.budget ?? undefined,
      budgetCurrency: event.budget_currency,
    } as EventFormSchema,
    validators: { onSubmit: EventFormSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        id: event.id,
        payload: {
          title: value.title,
          description: value.description,
          startDate: value.startDate || undefined,
          endDate: value.endDate || undefined,
          budget: value.budget,
          budgetCurrency: value.budgetCurrency,
        },
      });
      setDialog({ state: false });
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <FieldGroup className="p-4">
          <form.AppField name="title" children={(f) => <f.InputField label="Title" required />} />
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="startDate" children={(f) => <f.InputField label="Start date" placeholder="yyyy-MM-dd" />} />
            <form.AppField name="endDate" children={(f) => <f.InputField label="End date" placeholder="yyyy-MM-dd" />} />
          </div>
          <form.AppField name="budget" children={(f) => <f.InputField label="Budget (optional)" type="number" />} />
          <form.AppField name="description" children={(f) => <f.TiptapField label="Notes" defaultValue={event.description ?? ""} />} />
        </FieldGroup>
        <DialogFooter>
          <Field orientation="horizontal" className="justify-end px-4 pb-4">
            <form.SubscribeButton>Update event</form.SubscribeButton>
          </Field>
        </DialogFooter>
      </form.Form>
    </form.AppForm>
  );
}

export function DeleteEventDialogContent() {
  const { onSelectEvent } = useSelectedEvent();
  const mutation = useDeleteEvent();
  const [dialog, setDialog] = useAtom(deleteEventDialogAtom);

  const onDelete = async () => {
    if (!dialog?.data?.id) {
      setDialog({ state: false });
      return;
    }
    await mutation.mutateAsync({ id: dialog.data.id });
    onSelectEvent(null);
    setDialog({ state: false });
  };

  return (
    <DialogPopup className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>Delete this event?</DialogTitle>
        <DialogHeaderAction />
      </DialogHeader>
      <WarningMessage>
        The event will be deleted. Expenses and bills linked to it will be unlinked but not deleted.
        This action cannot be undone.
      </WarningMessage>
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </DialogFooter>
    </DialogPopup>
  );
}
```

- [ ] **Step 3: Create `event-details.tsx`**

IMPORTANT: Do NOT render dialog components directly inside the detail panel.
Dialogs in this codebase are rendered by `DialogProvider` (in the layout).
The detail panel only sets the dialog atom — the modal itself appears through the provider.

```typescript
// apps/app/src/components/events/event-details.tsx
import {
  type SyncedEvent,
  useLiveQueryEventExpenses,
  useLiveQueryEventRecurringBills,
  useLiveQueryEvents,
  useSelectedEvent,
} from "#app/components/events/use-events.ts";
import {
  deleteEventDialogAtom,
  editEventDialogAtom,
} from "#app/atoms/dialogs.ts";
import { cn } from "@hoalu/ui/utils";
import { Button } from "@hoalu/ui/button";
import { useSetAtom } from "jotai";
import { PencilIcon, Trash2Icon } from "@hoalu/icons/lucide";

export function EventDetails() {
  const { event: selected } = useSelectedEvent();
  const events = useLiveQueryEvents();
  const selectedEvent = events.find((e) => e.id === selected.id) ?? null;

  if (!selectedEvent) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
        Select an event to view details.
      </div>
    );
  }

  return <EventDetailPanel event={selectedEvent} />;
}

function EventDetailPanel({ event }: { event: SyncedEvent }) {
  const expenses = useLiveQueryEventExpenses(event.id);
  const bills = useLiveQueryEventRecurringBills(event.id);
  const setEditDialog = useSetAtom(editEventDialogAtom);
  const setDeleteDialog = useSetAtom(deleteEventDialogAtom);

  const remaining =
    event.realBudget != null ? event.realBudget - event.totalSpent : null;
  const progress =
    event.realBudget && event.realBudget > 0
      ? Math.min((event.totalSpent / event.realBudget) * 100, 100)
      : null;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{event.title}</h2>
          {(event.start_date || event.end_date) && (
            <p className="text-muted-foreground text-sm">
              {event.start_date ?? "?"} – {event.end_date ?? "ongoing"}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setEditDialog({ state: true, data: { id: event.id } })}
            aria-label="Edit event"
          >
            <PencilIcon className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDeleteDialog({ state: true, data: { id: event.id } })}
            aria-label="Delete event"
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Spent" value={`${event.budget_currency} ${event.totalSpent.toFixed(2)}`} />
        <StatCard
          label="Budget"
          value={event.realBudget != null ? `${event.budget_currency} ${event.realBudget.toFixed(2)}` : "—"}
        />
        <StatCard
          label="Remaining"
          value={remaining != null ? `${event.budget_currency} ${remaining.toFixed(2)}` : "—"}
          className={remaining != null && remaining < 0 ? "text-destructive" : ""}
        />
      </div>

      {/* Progress bar */}
      {progress != null && (
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              progress >= 100 ? "bg-destructive" : progress >= 80 ? "bg-orange-400" : "bg-primary",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Expenses list */}
      <section>
        <h3 className="mb-2 text-sm font-medium">
          Expenses ({expenses.length})
        </h3>
        {expenses.length === 0 ? (
          <p className="text-muted-foreground text-sm">No expenses linked to this event.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
                <span className="truncate">{exp.title}</span>
                <span className="shrink-0 font-medium">
                  {exp.currency} {exp.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recurring bills list */}
      {bills.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-medium">
            Recurring bills ({bills.length})
          </h3>
          <div className="flex flex-col gap-1">
            {bills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
                <span className="truncate">{bill.title}</span>
                <span className="shrink-0 font-medium">
                  {bill.currency} {bill.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NOTE: Dialogs are NOT rendered here. They are rendered by DialogProvider
           in the layout. The buttons above set dialog atoms; the provider handles
           showing the actual modal overlay. */}
    </div>
  );
}

function StatCard({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <p className="text-muted-foreground mb-1 text-xs">{label}</p>
      <p className={cn("text-sm font-semibold", className)}>{value}</p>
    </div>
  );
}
```

- [ ] **Step 4: Register event dialogs in `dialog-provider.tsx`**

In `apps/app/src/components/providers/dialog-provider.tsx`:

1. Add imports at the top of the file:
```typescript
import {
  CreateEventDialogContent,
  DeleteEventDialogContent,
  EditEventDialogContent,
} from "#app/components/events/event-actions.tsx";
```

2. In the `Content` function's `switch` block, add event cases before `default`:
```typescript
case "create-event":
  return <CreateEventDialogContent />;
case "edit-event":
  // The edit dialog needs the event data; it reads it from the editEventDialogAtom
  return <EditEventDialogContent />;
case "delete-event":
  return <DeleteEventDialogContent />;
```

Note: `EditEventDialogContent` must read the event id from the `editEventDialogAtom` (via `props.data.id`), look up the event from the live query, and render the form. Update the `EditEventDialogContent` component in `event-actions.tsx` to accept no props and instead read from the atom:

```typescript
export function EditEventDialogContent() {
  const [dialog] = useAtom(editEventDialogAtom);
  const events = useLiveQueryEvents();
  const event = events.find((e) => e.id === dialog?.data?.id) ?? null;
  if (!event) return null;
  return (
    <DialogPopup className="sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>Edit event</DialogTitle>
        <DialogHeaderAction />
      </DialogHeader>
      <EditEventForm event={event} />
    </DialogPopup>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/app/src/components/events/ apps/app/src/components/providers/dialog-provider.tsx
git commit -m "feat(frontend): add event list, actions, detail components, and register dialog provider"
```

---

### Task 9: Frontend — event routes

**Files:**
- Create: `apps/app/src/routes/_dashboard/$slug/_normal/events.tsx`
- Create: `apps/app/src/routes/_dashboard/$slug/_normal/events.$id.tsx`

- [ ] **Step 1: Create the list route**

```typescript
// apps/app/src/routes/_dashboard/$slug/_normal/events.tsx
import { CreateEventDialogContent, CreateEventDialogTrigger } from "#app/components/events/event-actions.tsx";
import { EventDetails } from "#app/components/events/event-details.tsx";
import { EventList } from "#app/components/events/event-list.tsx";
import { useLiveQueryEvents } from "#app/components/events/use-events.ts";
import {
  Section,
  SectionAction,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "#app/components/layouts/section.tsx";
import { createEventDialogAtom } from "#app/atoms/dialogs.ts";
import { DialogProvider } from "#app/components/providers/dialog-provider.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";

export const Route = createFileRoute("/_dashboard/$slug/_normal/events")({
  component: RouteComponent,
});

function RouteComponent() {
  const events = useLiveQueryEvents();
  const dialog = useAtomValue(createEventDialogAtom);

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Events</SectionTitle>
        <SectionAction>
          <CreateEventDialogTrigger />
        </SectionAction>
      </SectionHeader>
      <SectionContent columns={12}>
        <div className="col-span-12 md:col-span-5 lg:col-span-4">
          <EventList events={events} />
        </div>
        <div className="col-span-12 md:col-span-7 lg:col-span-8">
          <EventDetails />
        </div>
      </SectionContent>

      {dialog && <CreateEventDialogContent />}
    </Section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "apps/app/src/routes/_dashboard/\$slug/_normal/events.tsx"
git commit -m "feat(frontend): add events list route"
```

---

### Task 10: Frontend — add Event select field to expense and recurring-bill forms

**Files:**
- Modify: `apps/app/src/components/expenses/expense-actions.tsx`
- Modify: `apps/app/src/components/recurring-bills/recurring-bill-actions.tsx`
- Modify: `apps/app/src/lib/schema.ts`

- [ ] **Step 1: Add `eventId` to ExpenseFormSchema**

In `apps/app/src/lib/schema.ts`, add to `ExpenseFormSchema`:

```typescript
eventId: z.string().optional(),
```

- [ ] **Step 2: Add Event select to expense create form**

In `apps/app/src/components/expenses/expense-actions.tsx`, inside `CreateExpenseForm`:

1. Import `useLiveQueryEvents`:
```typescript
import { useLiveQueryEvents } from "#app/components/events/use-events.ts";
```

2. Add inside the component:
```typescript
const events = useLiveQueryEvents().filter((e) => e.status === "open");
const eventOptions = events.map((e) => ({ label: e.title, value: e.id }));
```

3. Add `eventId: undefined` to `defaultValues`.

4. Add the field inside `FieldGroup` after `categoryId`:
```tsx
<form.AppField
  name="eventId"
  children={(field) => (
    <field.SelectField label="Event (optional)" options={[{ label: "None", value: "" }, ...eventOptions]} />
  )}
/>
```

5. In `onSubmit`, pass `eventId` to the mutation payload:
```typescript
...(value.eventId ? { eventId: value.eventId } : {}),
```

- [ ] **Step 3: Add Event select to expense edit form**

In `EditExpenseForm` inside the same file:

1. Add `eventId: props.data.event_id ?? ""` to `defaultValues`.
2. Add the same Event select field as above, after `categoryId`.
3. In `onSubmit`, pass `eventId` (with null for unlink, similar to how `recurringBillId` handles it):
```typescript
...(value.eventId !== (props.data.event_id ?? "")
  ? { eventId: value.eventId || null }
  : {}),
```

- [ ] **Step 4: Add Event select to recurring bill create/edit forms**

In `apps/app/src/components/recurring-bills/recurring-bill-actions.tsx`:

1. Import `useLiveQueryEvents`.
2. Add `eventId: z.string().optional()` to `BillFormSchema`.
3. Add `eventId` to `defaultValues` in both create and edit forms.
4. Add the Event select field after `categoryId` in both forms.
5. Pass `eventId` in the mutation payloads.

- [ ] **Step 5: Commit**

```bash
git add apps/app/src/components/expenses/expense-actions.tsx apps/app/src/components/recurring-bills/recurring-bill-actions.tsx apps/app/src/lib/schema.ts
git commit -m "feat(frontend): add event select field to expense and recurring bill forms"
```

---

### Task 11: Frontend — sidebar navigation link

**Files:**
- Modify: `apps/app/src/components/layouts/nav-workspace.tsx`

- [ ] **Step 1: Add Events nav link**

Open `apps/app/src/components/layouts/nav-workspace.tsx`. Find where the existing nav items are defined (look for `expenses`, `recurring-bills`). Add an Events link in the same format:

```typescript
{
  title: "Events",
  url: "/$slug/events",
  icon: CalendarRangeIcon, // from @hoalu/icons/lucide
},
```

Import the icon at the top of the file:
```typescript
import { CalendarRangeIcon } from "@hoalu/icons/lucide";
```

- [ ] **Step 2: Verify navigation renders correctly**

Start the dev server and navigate to any workspace. Confirm "Events" appears in the sidebar and clicking it navigates to `/$slug/events`.

- [ ] **Step 3: Commit**

```bash
git add apps/app/src/components/layouts/nav-workspace.tsx
git commit -m "feat(frontend): add Events link to workspace sidebar"
```

---

### Task 12: End-to-end verification

- [ ] **Step 1: Start full dev environment**

```bash
bun run dev
```

Open `https://hoalu.localhost` in the browser.

- [ ] **Step 2: Smoke test — create event**

1. Navigate to `/$slug/events`
2. Click "Create event"
3. Fill in title "Japan Trip", start date "2026-04-01", end date "2026-04-15", budget "2000"
4. Submit — event should appear in the list

- [ ] **Step 3: Smoke test — link expense to event**

1. Navigate to `/$slug/expenses`
2. Create a new expense, select "Japan Trip" in the Event field
3. Submit — navigate back to events, confirm "Japan Trip" shows updated `totalSpent`

- [ ] **Step 4: Smoke test — link recurring bill to event**

1. Navigate to `/$slug/recurring-bills`
2. Edit an existing bill, select "Japan Trip" in the Event field
3. Navigate back to events — confirm the bill appears in the event detail

- [ ] **Step 5: Smoke test — delete event (unlinks, not deletes)**

1. Delete "Japan Trip" event
2. Navigate to expenses — linked expenses should still exist, `event_id` should be null (no longer shown as linked)

- [ ] **Step 6: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: post-integration fixes for events feature"
```

---

## Summary of Files

| # | Action | File |
|---|--------|------|
| 1 | Modify | `apps/api/src/db/schema.ts` |
| 2 | Create | `apps/api/src/routes/events/schema.ts` |
| 3 | Create | `apps/api/src/routes/events/repository.ts` |
| 4 | Create | `apps/api/src/routes/events/index.ts` |
| 5 | Modify | `apps/api/src/modules/api.ts` |
| 6 | Modify | `apps/api/src/modules/sync.ts` |
| 7 | Modify | `apps/api/src/routes/expenses/schema.ts` |
| 8 | Modify | `apps/api/src/routes/expenses/index.ts` |
| 9 | Modify | `apps/api/src/routes/recurring-bills/schema.ts` |
| 10 | Modify | `apps/api/src/routes/recurring-bills/index.ts` |
| 11 | Create | `apps/app/src/lib/collections/event.ts` |
| 12 | Modify | `apps/app/src/lib/collections/expense.ts` |
| 13 | Modify | `apps/app/src/lib/collections/recurring-bill.ts` |
| 14 | Modify | `apps/app/src/lib/collections/index.ts` |
| 15 | Modify | `apps/app/src/lib/query-key-factory.ts` |
| 16 | Modify | `apps/app/src/lib/schema.ts` |
| 17 | Modify | `apps/app/src/lib/api-client.ts` |
| 18 | Modify | `apps/app/src/atoms/dialogs.ts` |
| 19 | Modify | `apps/app/src/services/mutations.ts` |
| 20 | Create | `apps/app/src/components/events/use-events.ts` |
| 21 | Create | `apps/app/src/components/events/event-list.tsx` |
| 22 | Create | `apps/app/src/components/events/event-actions.tsx` |
| 23 | Create | `apps/app/src/components/events/event-details.tsx` |
| 24 | Create | `apps/app/src/routes/_dashboard/$slug/_normal/events.tsx` |
| 25 | Modify | `apps/app/src/components/expenses/expense-actions.tsx` |
| 26 | Modify | `apps/app/src/components/recurring-bills/recurring-bill-actions.tsx` |
| 27 | Modify | `apps/app/src/components/layouts/nav-workspace.tsx` |
