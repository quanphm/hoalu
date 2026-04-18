# Plan: Optimistic Mutations for Expense CRUD

## Context

Expense create/update/delete is slow because the flow is:
**Submit -> HTTP API (~200-500ms) -> Electric sync back (~100-500ms) -> UI updates**

TanStack DB collections support `collection.insert()`/`update()`/`delete()` with instant optimistic state + `onInsert`/`onUpdate`/`onDelete` handlers for background persistence. We wire these up so UI updates **instantly** while the API call + Electric sync happen in the background.

**Strategy**: `return { txid }` -- API returns PostgreSQL `txid_current()`, Electric waits for that exact transaction to sync before dropping optimistic state. No flicker.

---

## Changes Overview

### Backend (3 files)

#### 1. `apps/api/src/routes/expenses/repository.ts` -- Return txid from mutations

Add `txid_current()` to the returning clause:

- **`insert()`** (line 50-57): Change to accept a `tx` parameter (Drizzle transaction) so it participates in the caller's transaction. The route handler already wraps in `db.transaction()`.
- **`update()`** (line 59-76): Same -- accept `tx` parameter.
- **`delete()`** (line 78-87): Wrap in transaction, add `txid_current()`.

For POST and PATCH, the route handlers already use `db.transaction(async (tx) => { ... })`. We add a final query inside that transaction:

```typescript
const [{ txid }] = await tx.execute(sql`SELECT txid_current()::bigint AS txid`);
```

For DELETE, add a transaction wrapper with the same pattern.

#### 2. `apps/api/src/routes/expenses/schema.ts` -- Add txid to response schemas

- Add `txid` field to `LiteExpenseSchema` response (used by POST/PATCH)
- Add `txid` field to `DeleteExpenseSchema` response (used by DELETE)

```typescript
export const LiteExpenseSchema = BaseExpenseSchema.pick({ ... }).extend({
  txid: z.coerce.number(),
}).transform(...)

export const DeleteExpenseSchema = z.object({
  id: z.uuidv7(),
  txid: z.coerce.number(),
});
```

#### 3. `apps/api/src/routes/expenses/index.ts` -- Pass txid through responses

- **POST** (line 140-254): Add `txid_current()` query at end of transaction, include `txid` in response object
- **PATCH** (line 313-408): Same pattern
- **DELETE** (line 430-444): Wrap in transaction, add `txid_current()`, include in response

---

### Frontend (3 files)

#### 4. `apps/app/src/lib/collections/expense.ts` -- Add mutation handlers

Add `onInsert`, `onUpdate`, `onDelete` handlers to `electricCollectionOptions`:

```typescript
import { apiClient } from "#app/lib/api-client.ts";
import { isChangeMessage } from "@tanstack/electric-db-collection";
import { monetary } from "@hoalu/common/monetary";

const factory = createCollectionFactory("expense", (slug: string) =>
	createCollection(
		electricCollectionOptions({
			// ...existing config...
			onInsert: async ({ transaction }) => {
				const item = transaction.mutations[0].modified;
				const result = await apiClient.expenses.create(slug, {
					title: item.title,
					description: item.description,
					amount: monetary.fromRealAmount(Number(item.amount), item.currency),
					currency: item.currency,
					date: item.date,
					walletId: item.wallet_id,
					categoryId: item.category_id,
					repeat: item.repeat,
					recurringBillId: item.recurring_bill_id || undefined,
					eventId: item.event_id || undefined,
				});
				return { txid: result.txid };
			},
			onUpdate: async ({ transaction }) => {
				const mutation = transaction.mutations[0];
				const merged = { ...mutation.original, ...mutation.changes };
				const result = await apiClient.expenses.edit(slug, mutation.original.id, {
					title: merged.title,
					description: merged.description,
					amount: monetary.fromRealAmount(Number(merged.amount), merged.currency),
					currency: merged.currency,
					date: merged.date,
					walletId: merged.wallet_id,
					categoryId: merged.category_id,
					repeat: merged.repeat,
					recurringBillId: merged.recurring_bill_id,
					eventId: merged.event_id,
				});
				return { txid: result.txid };
			},
			onDelete: async ({ transaction }) => {
				const item = transaction.mutations[0].original;
				const result = await apiClient.expenses.delete(slug, item.id);
				return { txid: result.txid };
			},
		}),
	),
);
```

**Key**: Amount in collection is minor units (cents). API expects display units. Convert via `monetary.fromRealAmount()` before sending.

#### 5. `apps/app/src/services/mutations.ts` -- Rewrite expense mutation hooks (lines 260-355)

Replace `useMutation` + `apiClient` with `collection.insert()`/`update()`/`delete()`:

**`useCreateExpense()`**:

- Get collection via `expenseCollectionFactory(slug)`
- Generate UUIDv7 `id` client-side
- Build optimistic row with `creator_id` from caller, `created_at` as `new Date().toISOString()`, amount converted to minor units via `monetary.toRealAmount()`
- Call `collection.insert(row)` -> returns `Transaction`
- Fire haptics/sound/toast immediately
- `tx.isPersisted.promise.catch()` for error toast
- Return `{ id, title, date, transaction }` so callers have `id` for file uploads
- Remove `queryClient.invalidateQueries(expenseKeys)` (Electric handles freshness)
- Keep `queryClient.invalidateQueries(unified-bills)` (non-Electric query)

**`useEditExpense()`**:

- `collection.update(id, (draft) => { ...apply changes in minor units... })`
- Immediate feedback, background error handling

**`useDeleteExpense()`**:

- `collection.delete(id)`
- Immediate feedback, background error handling

#### 6. `apps/app/src/components/expenses/expense-actions.tsx` -- Update form submission

**`CreateExpenseForm` (line 188 onSubmit)**:

- Currently: `const expense = await mutation.mutateAsync({ payload })` then uses `expense.id` for file upload
- Change: Call mutation which returns `{ id }` immediately (pre-generated), use that `id` for file upload
- Dialog closes immediately (optimistic), no await on the mutation

**`EditExpenseForm` (line 468 onSubmit)**:

- Currently: `await mutation.mutateAsync({ id, payload })`
- Change: Fire-and-forget mutation (no await), form updates optimistically

**`DeleteExpenseDialogContent` (line 352 onDelete)**:

- Currently: `await mutation.mutateAsync({ id })`
- Change: Fire mutation, close dialog immediately

---

## Error Handling

TanStack DB auto-rolls back on handler failure:

1. Optimistic update + success toast fires immediately
2. If `onInsert`/`onUpdate`/`onDelete` throws -> Transaction moves to `failed` state
3. Optimistic changes revert automatically, `useLiveQuery` re-renders
4. `tx.isPersisted.promise` rejection caught -> show error toast

---

## Amount Conversion

| Location                          | Unit                 | Direction                                  |
| --------------------------------- | -------------------- | ------------------------------------------ |
| Form input (user types)           | display (e.g. 10.50) | -                                          |
| Optimistic insert into collection | minor (e.g. 1050)    | `monetary.toRealAmount()`                  |
| `onInsert` handler -> API call    | display (e.g. 10.50) | `monetary.fromRealAmount()`                |
| `useLiveQueryExpenses` read       | display (e.g. 10.50) | `monetary.fromRealAmount()` (already done) |

---

## Verification

1. Create expense -> appears instantly in list, no flicker after sync
2. Edit expense -> changes reflect immediately
3. Delete expense -> disappears instantly
4. Network error -> optimistic state reverts + error toast
5. File upload after create -> works with pre-generated ID
6. Recurring bill link -> expense optimistic, bill status updates via normal Electric sync
