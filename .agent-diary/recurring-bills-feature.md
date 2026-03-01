# Recurring Bills Feature

**Date**: 2026-02-28
**Status**: Phase 1 complete — full backend + frontend CRUD, management page, log payment flow, set up prompt, linking UI

---

## Goal

Build a proper backend-driven recurring bills / upcoming payments feature. Replace the previous
frontend-only heuristic approach with a `recurring_bill` table, projection API, and UI wired to it.

---

## Architecture Decision

### Data model

`recurring_bill` is the **template / schedule**. `expense` is a **concrete past payment**.

```
recurring_bill (one row per subscription/schedule)
  id, title, description, amount, currency, repeat, anchor_date
  wallet_id, category_id, workspace_id, creator_id, is_active

expense (one row per actual payment)
  id, title, amount, date, repeat, recurring_bill_id → recurring_bill (nullable)
  wallet_id, category_id, workspace_id, creator_id
```

- Many expenses can point to the same `recurring_bill` (all past payments of a subscription)
- `recurring_bill.anchor_date` = the date of the last logged payment; controls future projections
- `recurring_bill.amount` = the expected going-forward amount (independent of past expense amounts)

### Why `expense → recurring_bill` (not the reverse)

- Bill exists independently of any specific expense — survives expense deletion
- `findUpcoming()` only needs the bill table to project future dates, no expense join required
- Avoids chicken-and-egg on creation (bill would need expense ID before expense exists)

### The duplicate `repeat` field

`expense.repeat` is kept for the expense list UI (repeat badge). It must stay in sync with
`recurring_bill.repeat` when the PATCH handler updates an expense. This is a known maintenance
burden.

---

## What Was Built

### Backend (`apps/api/`)

**Database schema** (`apps/api/src/db/schema.ts`):
- Added `recurringBill` table (lines 236–264)
- Added `recurringBillId` nullable FK on `expense` table (line 278)
- Migration `0003_closed_speed_demon.sql` generated and applied

**Route: `apps/api/src/routes/recurring-bills/`** (3-file pattern):
- `schema.ts` — `RecurringBillSchema`, `InsertRecurringBillSchema`, `UpdateRecurringBillSchema`, `UpcomingBillSchema`, `UpcomingBillsSchema`
- `repository.ts` — `findAllByWorkspaceId`, `findOne`, `findUpcoming`, `insert`, `update`, `archive`, `updateAnchorDate`
  - TZ bug fixed (use local date parts, not UTC)
  - Amount conversion bug fixed (monetary.fromRealAmount in findUpcoming)
- `index.ts` — `GET /`, `GET /upcoming`, `POST /`, `PATCH /:id`, `DELETE /:id`

**Registered** in `apps/api/src/modules/api.ts` at `/bff/recurring-bills`.

**Sync proxy** added in `apps/api/src/modules/sync.ts` at `/sync/recurring-bills`.

**Modified** `apps/api/src/routes/expenses/index.ts`:
- `POST /expenses`: does NOT auto-create a bill; when `recurringBillId` provided in payload, advances bill's `anchor_date` in same transaction
- `PATCH /expenses/:id`: extended to accept `recurringBillId: z.uuidv7().nullable().optional()` for linking/unlinking

**Modified** `apps/api/src/routes/expenses/schema.ts`:
- `InsertExpenseSchema` accepts optional `recurringBillId`
- `UpdateExpenseSchema` accepts `recurringBillId: z.uuidv7().nullable().optional()`

### Frontend (`apps/app/`)

**Collections:**
- `lib/collections/expense.ts` — added `recurring_bill_id: z.uuidv7().nullable()` field to `ExpenseCollectionSchema`
- `lib/collections/recurring-bill.ts` — NEW Electric SQL collection (snake_case schema, workspace-slug-keyed)
- `lib/collections/index.ts` — updated with `recurringBill` exports + clear functions

**State:**
- `atoms/expenses.ts` — added `logPaymentAtom` (`{ recurringBillId: string | null }`) used by "Log payment" flow
- `lib/schema.ts` — added `recurringBillId: z.string().optional()` to `ExpenseFormSchema`

**Query/mutation infrastructure:**
- `lib/query-key-factory.ts` — `recurringBillKeys.all`, `.upcoming`, `~withWorkspace`
- `lib/api-client.ts` — `recurringBills.create`, `.edit`, `.listUpcoming`, `.archive`
- `services/query-options.ts` — `upcomingBillsQueryOptions(slug)`
- `services/mutations.ts`:
  - `useCreateRecurringBill` — create standalone bill
  - `useEditRecurringBill` — update bill fields
  - `useArchiveRecurringBill` — soft-delete bill
  - `useSetUpRecurringBill` — NEW: creates bill from expense then links expense to it (two-step)
  - `useEditExpense` — invalidates `recurringBillKeys.upcoming` on success
  - `useCreateExpense` — reads `logPaymentAtom` to include `recurringBillId` and advances anchor

**Components:**
- `components/recurring-bills/use-recurring-bills.ts` — `useLiveQueryRecurringBills` (joins wallet + category), `useSelectedRecurringBill`, `selectedRecurringBillAtom`, `SyncedRecurringBill` type
- `components/recurring-bills/recurring-bill-actions.tsx` — `CreateRecurringBillDialogContent`, `EditRecurringBillForm`, `ArchiveRecurringBillDialogContent`, `ArchiveRecurringBillButton`
- `components/recurring-bills/recurring-bill-list.tsx` — NEW: list with color stripe, category badge, amount, row selection
- `components/recurring-bills/recurring-bill-details.tsx` — NEW: detail panel with edit form + archive button
- `components/calendar/calendar-widget.tsx` — backend query, no props
- `components/calendar/upcoming-bills-list.tsx` — BillRow with always-visible **`...` dropdown menu** (DropdownMenu from `@hoalu/ui`) containing "Log payment" and "Remove" items; removed hover-only Tooltip icon pattern; date label shows year when different from current year
- `components/command-palette/` — upcoming bills injected (≤2), `recurring-bill-item.tsx`
- `components/expenses/expense-actions.tsx`:
  - `CreateExpenseForm`: reads `logPaymentAtom`, includes `recurringBillId` in POST, resets atom after submit/unmount
  - `EditExpenseForm`: reads `useLiveQueryRecurringBills`, shows **"Recurring bill" select field** when `repeat !== "one-time"` and bills exist; sends `recurringBillId` change in PATCH
- `components/expenses/expense-details.tsx`: shows **"Set up recurring bill"** amber prompt above `EditExpenseForm` when `repeat !== "one-time"` and `recurring_bill_id == null`
- `components/layouts/nav-workspace.tsx` — added "Recurring Bills" sidebar link with `CalendarIcon`

**Route:**
- `routes/_dashboard/$slug/recurring-bills.tsx` — NEW: two-panel layout (bill list + detail panel), "Create bill" dialog trigger

---

## Lifecycle Summary

### Expense with repeat, no bill yet
1. User creates expense with `repeat = monthly` → `recurring_bill_id = NULL`
2. Expense detail panel shows amber prompt "Track future payments?" → "Set up recurring bill"
3. Clicking triggers `useSetUpRecurringBill`: `POST /recurring-bills` → `PATCH /expenses/:id { recurringBillId: newBillId }`
4. Prompt disappears (Electric SQL updates `recurring_bill_id` on the expense collection row)

### Log payment from upcoming bills widget
1. Upcoming bills widget shows next due date with "Log payment" (+) button
2. Click pre-fills create expense dialog (title/amount/wallet/category/date from bill) + sets `logPaymentAtom`
3. User submits → `POST /expenses` includes `recurringBillId` → backend advances `anchor_date` in transaction

### Linking/unlinking via expense edit form
1. Edit expense with `repeat !== "one-time"` → "Recurring bill" select field appears
2. Choose a bill → on Update, `PATCH /expenses/:id { recurringBillId: id }` sent
3. Choose "None" → `PATCH /expenses/:id { recurringBillId: null }` sent (unlinks)

---

## Bugs Fixed

### 1. UTC vs local timezone mismatch in `findUpcoming()`
`new Date('yyyy-MM-dd')` parses as UTC midnight. In UTC+7, dates were off by one day.
**Fix**: Use local date parts (`getFullYear/getMonth/getDate`) and `new Date(\`${s}T00:00:00\`)` for parsing.

### 2. Amount shown in minor units
DB stores amounts in minor units (cents). `findUpcoming()` was returning raw cents.
**Fix**: Wrap with `monetary.fromRealAmount()` before returning.

### 3. Date label missing year for yearly bills
**Fix**: Compare `getFullYear()` vs today, use `"EEE, MMM d, yyyy"` when year differs.

### 4. Unused `realAmount` variable in `recurring-bill-actions.tsx`
**Fix**: Removed the unused `const realAmount = monetary.toRealAmount(...)` line (and the `monetary` import).

---

## Design Decisions

- `POST /expenses` NEVER auto-creates a bill. Bill creation is always explicit.
- `logPaymentAtom` is a Jotai atom that survives the dialog open/close cycle (not stored in localStorage).
- `ExpenseFormSchema.recurringBillId` is optional string (not UUIDv7 validated) to allow empty string for "None" select value.
- `useLiveQueryRecurringBills` joins wallet + category collections for display names; the filter `b.is_active` excludes archived bills.

---

## Relevant Files

```
apps/api/src/
├── db/
│   └── schema.ts                                  modified (recurringBill table + expense.recurringBillId)
├── migrations/
│   └── 0003_closed_speed_demon.sql                applied
├── routes/
│   ├── expenses/
│   │   ├── index.ts                               modified (POST no auto-create; PATCH accepts recurringBillId)
│   │   └── schema.ts                              modified (recurringBillId in Insert+Update)
│   └── recurring-bills/
│       ├── schema.ts                              created (full CRUD schemas + upcoming)
│       ├── repository.ts                          created (TZ+amount bugs fixed, update() added)
│       └── index.ts                               created (GET, GET /upcoming, POST, PATCH, DELETE)
└── modules/
    ├── api.ts                                     modified (registered /recurring-bills)
    └── sync.ts                                    modified (added /sync/recurring-bills)

apps/app/src/
├── atoms/
│   └── expenses.ts                                modified (logPaymentAtom added)
├── lib/
│   ├── schema.ts                                  modified (recurringBillId in ExpenseFormSchema)
│   ├── query-key-factory.ts                       modified (recurringBillKeys)
│   ├── api-client.ts                              modified (create, edit, archive, listUpcoming)
│   └── collections/
│       ├── index.ts                               modified (recurringBill added)
│       ├── expense.ts                             modified (recurring_bill_id field)
│       └── recurring-bill.ts                      NEW
├── services/
│   ├── mutations.ts                               modified (useCreateRecurringBill, useEditRecurringBill, useSetUpRecurringBill, useArchiveRecurringBill, useCreateExpense reads logPaymentAtom)
│   └── query-options.ts                           modified (upcomingBillsQueryOptions)
└── components/
    ├── recurring-bills/
    │   ├── use-recurring-bills.ts                 NEW (joins wallet+category, selectedRecurringBillAtom)
    │   ├── recurring-bill-actions.tsx             NEW (create/edit/archive dialogs)
    │   ├── recurring-bill-list.tsx                NEW (list component)
    │   └── recurring-bill-details.tsx             NEW (detail panel)
    ├── calendar/
    │   ├── calendar-widget.tsx                    rewritten (backend query)
    │   └── upcoming-bills-list.tsx                modified (Log payment button, year in label)
    ├── command-palette/
    │   ├── types.ts                               modified (UpcomingBillItem types)
    │   ├── recurring-bill-item.tsx                NEW
    │   ├── virtualized-list.tsx                   modified (upcoming-bill type)
    │   └── command-palette.tsx                    modified (≤2 upcoming bills injected)
    ├── expenses/
    │   ├── expense-actions.tsx                    modified (logPaymentAtom in CreateExpenseForm; recurring bill select in EditExpenseForm)
    │   └── expense-details.tsx                    modified (SetUpRecurringBillPrompt shown conditionally)
    └── layouts/
        └── nav-workspace.tsx                      modified (Recurring Bills sidebar link)

apps/app/src/routes/_dashboard/$slug/
└── recurring-bills.tsx                            NEW
```

---

## Phase 2 (future)

- Linked expenses tab in bill detail panel
- Aggregations: total paid, average amount, monthly-normalized cost
- "Active subscriptions" total in widget header
- Mobile drawer for recurring bill details
