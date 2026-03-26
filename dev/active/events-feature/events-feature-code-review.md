# Events Feature Implementation Plan — Code Review

**Last Updated:** 2026-03-26  
**Reviewer:** Code Architecture Reviewer  
**Plan:** `docs/plans/2026-03-26-events-feature.md`  
**Spec:** `docs/specs/2026-03-26-events-feature-design.md`  
**Status:** Plan review — identifying issues that would cause failures if followed literally

---

## Executive Summary

The plan is thorough and well-structured across 12 tasks. However, I found **5 blocking issues** that would cause build failures or runtime errors if followed literally, **4 important issues** that would cause incorrect behavior or violate codebase patterns, and **5 minor issues** that are cosmetic or could cause confusion. The plan cannot be implemented as-is — the blocking issues must be fixed first.

---

## Critical Issues (BLOCKING — must fix before implementation)

### B1. `UpdateEventSchema` calls `.omit()` on a refined schema — Zod v4 TypeError

**Severity:** BLOCKING  
**Location:** Task 2, Step 1 (plan line 196)  
**Evidence:** The project uses Zod v4.3.6+ (`package.json` catalog: `"zod": "^4.3.6"`). In Zod v4, `.refine()` returns a `ZodPipe`, not a `ZodObject`. The `.omit()` method only exists on `ZodObject`.

The plan writes:
```typescript
export const UpdateEventSchema = InsertEventSchema.omit({ workspaceId: true })
  .extend({ status: z.enum(["open", "closed"]) })
  .partial();
```

But `InsertEventSchema` has `.refine()` at the end, so it's a `ZodPipe`. Calling `.omit()` on it will throw a TypeError at import time.

**Fix:** Define a base object schema without `.refine()`, then derive both schemas from it:
```typescript
const BaseInsertEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.coerce.number().optional(),
  budgetCurrency: CurrencySchema.optional(),
  workspaceId: z.uuidv7(),
});

export const InsertEventSchema = BaseInsertEventSchema.refine(
  (val) => {
    if (val.startDate && val.endDate) return val.endDate >= val.startDate;
    return true;
  },
  { message: "end_date must be >= start_date", path: ["endDate"] },
);

export const UpdateEventSchema = BaseInsertEventSchema
  .omit({ workspaceId: true })
  .extend({ status: z.enum(["open", "closed"]) })
  .partial()
  .refine(
    (val) => {
      if (val.startDate && val.endDate) return val.endDate >= val.startDate;
      return true;
    },
    { message: "end_date must be >= start_date", path: ["endDate"] },
  );
```

This matches the existing pattern in `recurring-bills/schema.ts` (line 66) where `UpdateRecurringBillSchema` calls `.omit()` on the base `InsertRecurringBillSchema` which has no `.refine()`.

---

### B2. `api-client.ts` is NOT auto-generated — plan gives wrong instructions

**Severity:** BLOCKING  
**Location:** Task 2, Step 6 (plan line 567–574) and Task 5, Step 3 (plan line 814)  
**Evidence:** The plan states (line 574): *"This regenerates `apps/app/src/lib/api-client.ts` types from the Hono RPC."* and the spec (line 232) says: *"`apps/app/src/lib/api-client.ts` is **auto-generated** from the Hono RPC types."*

This is **factually wrong**. `api-client.ts` is a **manually maintained** 577-line file. It contains a `honoClient` (Hono RPC, which gets types automatically) plus a hand-written `apiClient` object with method implementations for each resource (`tasks`, `wallets`, `categories`, `expenses`, `incomes`, `exchangeRates`, `files`, `workspaces`, `recurringBills`).

The Hono RPC types (`honoClient.bff.events.*`) will be available after restarting the dev server (because `ApiRoutes` is re-exported from the API package). But the `apiClient.events` wrapper object must be **manually written** — which Task 5 Step 3 does correctly. The misleading comment in Task 2 Step 6 could cause an implementer to skip Task 5 Step 3 thinking it's automatic.

**Fix:** 
- Task 2, Step 6: Change the description to: *"Restart the API dev server so the Hono RPC type (`honoClient.bff.events`) becomes available for the frontend. Note: `api-client.ts` is manually maintained — the `apiClient.events` wrapper must be added by hand in Task 5."*
- Spec line 232: Correct to: *"`apps/app/src/lib/api-client.ts` is **manually maintained**. The `honoClient` gets types automatically from Hono RPC (available after dev server restart), but the `apiClient` wrapper methods must be added by hand."*

---

### B3. Dialog rendering pattern is wrong — dialogs rendered inline instead of via `DialogProvider`

**Severity:** BLOCKING  
**Location:** Task 8, Step 3 (plan lines 1758–1759) and Task 9, Step 1 (plan line 1834)  
**Evidence:** The plan renders dialog content components directly inside `event-details.tsx`:
```tsx
{/* Dialogs */}
<EditEventDialogContent event={event} />
<DeleteEventDialogContent />
```

And in the route file `events.tsx`:
```tsx
{dialog && <CreateEventDialogContent />}
```

This violates the codebase's centralized dialog pattern. In this codebase, **all CRUD dialogs are rendered by `DialogProvider`** (`apps/app/src/components/providers/dialog-provider.tsx`), which uses a `switch` on `DialogId` to render the correct content. Dialog components are never rendered inline in detail panels or route components.

The `DialogProvider` wraps the entire app layout and manages a single `Dialog` instance with `dialogStateAtom`. When a dialog atom is set to `{ state: true }`, the `DialogProvider` opens and renders the matching `Content` component.

If dialogs are rendered inline as the plan suggests, they will:
1. Not be wrapped in the `Dialog` + `DialogPortal` + `DialogBackdrop` + `DialogViewport` structure
2. Not integrate with the `dialogStateAtom` open/close lifecycle
3. Render as raw content without the modal overlay

**Fix:** Three changes needed:

1. **Add event dialog cases to `DialogProvider`** (missing step entirely):
```typescript
// In dialog-provider.tsx Content switch:
case "create-event":
  return <CreateEventDialogContent />;
case "edit-event":
  return <EditEventDialogContent />;  // needs event data from dialog.data
case "delete-event":
  return <DeleteEventDialogContent />;
```

2. **Remove inline dialog rendering** from `event-details.tsx` (delete lines 1758–1759) and from `events.tsx` (delete line 1834).

3. **Pass event data through dialog atom** for `EditEventDialogContent`: The edit dialog needs the event object. In the existing pattern, dialog atoms carry `data` (e.g., `setEditDialog({ state: true, data: { id: event.id } })`). The `EditEventDialogContent` should look up the event from the live query using the ID from `dialog.data`, rather than receiving it as a prop.

Note: The expense detail panel renders `EditExpenseForm` inline (not as a dialog) — it's an inline form, not a dialog. The plan's `EditEventDialogContent` is a dialog, so it must go through `DialogProvider`.

---

### B4. Icon import `@hoalu/icons/radix` does not exist

**Severity:** BLOCKING  
**Location:** Task 8, Step 3 (plan line 1627)  
**Evidence:** The plan imports:
```typescript
import { Pencil1Icon, TrashIcon } from "@hoalu/icons/radix";
```

The `@hoalu/icons` package (`packages/icons/package.json`) only exports these subpaths:
- `@hoalu/icons/lucide`
- `@hoalu/icons/meteocons`
- `@hoalu/icons/nucleo`
- `@hoalu/icons/social`
- `@hoalu/icons/tabler`

There is **no `@hoalu/icons/radix` export**. `Pencil1Icon` and `TrashIcon` are Radix icon names, not used anywhere in the codebase.

The codebase uses `@hoalu/icons/lucide` for most icons. Looking at similar detail panels:
- `expense-details.tsx` uses `ChevronDownIcon, ChevronUpIcon` from `@hoalu/icons/lucide` and `XIcon` from `@hoalu/icons/tabler`
- `recurring-bill-details.tsx` uses `ArchiveIcon` from `@hoalu/icons/lucide`
- Delete actions use `Trash2Icon` from `@hoalu/icons/lucide` (see `expense-actions.tsx`, `income-actions.tsx`, `category-actions.tsx`)

**Fix:** Replace with:
```typescript
import { PencilIcon, Trash2Icon } from "@hoalu/icons/lucide";
```
(Or `PenIcon` / `EditIcon` — check `lucide-react` exports for the exact name. `Pencil` is exported by lucide-react.)

---

### B5. `events.$id.tsx` route file listed but never created

**Severity:** BLOCKING  
**Location:** Task 9 (plan lines 1786–1787)  
**Evidence:** Task 9 lists two files to create:
```
- Create: apps/app/src/routes/_dashboard/$slug/_normal/events.tsx
- Create: apps/app/src/routes/_dashboard/$slug/_normal/events.$id.tsx
```

But the task only has Step 1 (create `events.tsx`) and Step 2 (commit). There is **no step to create `events.$id.tsx`** and no code is provided for it. The spec (line 214) describes this as the event detail page route.

Without this file, navigating to `/$slug/events/$id` will show a 404 or fall through to the parent route. The `EventDetails` component in the plan is designed as a side panel (rendered alongside the list in `events.tsx`), so the `events.$id.tsx` route may actually be unnecessary if the detail view is always shown as a side panel. But the plan explicitly lists it as a deliverable.

**Fix:** Either:
1. **Create the route file** with code similar to:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { EventDetails } from "#app/components/events/event-details.tsx";

export const Route = createFileRoute("/_dashboard/$slug/_normal/events/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  // Set selected event and render detail view
  return <EventDetails eventId={id} />;
}
```

2. **Or remove it from the file map** if the detail view is only a side panel (no dedicated route). Update the spec accordingly.

---

## Important Issues (should fix — incorrect behavior or pattern violations)

### I1. POST middleware ordering differs from codebase convention

**Severity:** Important (consistency)  
**Location:** Task 2, Step 3 (plan lines 401–403)  
**Evidence:** The plan's POST handler uses:
```typescript
workspaceQueryValidator, workspaceMember, jsonBodyValidator(InsertEventSchema)
```

But the spec's middleware table (line 116) shows:
```
POST / → workspaceQueryValidator, jsonBodyValidator(InsertEventSchema), workspaceMember
```

The plan code (line 401–403) actually follows the **correct** codebase pattern (`workspaceMember` before `jsonBodyValidator`), matching the existing expense POST (line 122–124 of `expenses/index.ts`). However, the spec contradicts this. The plan code is correct; the spec is wrong.

**Fix:** No code change needed — the plan code is correct. But note the spec inconsistency for documentation cleanup.

---

### I2. `useLiveQueryEventExpenses` filters by nullable `event_id` using `eq()` — potential issue with null values

**Severity:** Important (correctness)  
**Location:** Task 7, Step 1 (plan line 1186)  
**Evidence:** The plan writes:
```typescript
.where(({ expense }) => eq(expense.event_id, eventId))
```

The `event_id` field is nullable (`z.uuidv7().nullable()`). When `event_id` is `null` in the collection, `eq(null, "some-uuid")` should correctly return `false` in TanStack DB's `eq` implementation. However, this depends on the specific behavior of `@tanstack/react-db`'s `eq` function with nullable fields.

The existing codebase uses `eq` with nullable fields (e.g., `eq(expense.category_id, category.id)` in left joins), but those are join conditions, not `where` filters. A `where` clause filtering `eq(nullable_field, non_null_value)` should work correctly (null !== "uuid" → excluded), but this is worth verifying during implementation.

**Fix:** Verify during implementation that expenses with `event_id = null` are correctly excluded. If not, add an explicit null check:
```typescript
.where(({ expense }) => expense.event_id !== null && eq(expense.event_id, eventId))
```

---

### I3. `selectedEventAtom` defined in two places

**Severity:** Important (duplication)  
**Location:** Task 5, Step 4 mentions `apps/app/src/atoms/events.ts` (plan line 40), but Task 7 Step 1 defines `selectedEventAtom` inside `use-events.ts` (plan line 1037)  
**Evidence:** The file map (line 40) says:
```
apps/app/src/atoms/events.ts — selectedEventAtom, dialog IDs registered in dialogs.ts
```

But the actual code in Task 7 (line 1037) defines:
```typescript
export const selectedEventAtom = atom<{ id: string | null }>({ id: null });
```

directly inside `use-events.ts`. The `atoms/events.ts` file is never actually created in any task step.

The codebase convention is to define atoms in `apps/app/src/atoms/` and import them in hooks/components. See `selectedExpenseAtom` defined in `atoms/index.ts` and imported in `use-expenses.ts`.

**Fix:** Either:
1. Create `apps/app/src/atoms/events.ts` with the atom definition and import it in `use-events.ts` (matches codebase convention), OR
2. Remove `atoms/events.ts` from the file map since the atom is defined inline in `use-events.ts` (simpler but inconsistent)

---

### I4. Expense `UpdateExpenseSchema` needs `eventId` as `.nullable().optional()`, not just `.nullable()`

**Severity:** Important (type correctness)  
**Location:** Task 3, Step 1 (plan lines 604–607)  
**Evidence:** The plan says to add to `UpdateExpenseSchema`:
```typescript
eventId: z.uuidv7().nullable(),
```

But `UpdateExpenseSchema` is defined as `z.object({...}).partial()` (line 67–80 of `expenses/schema.ts`). The `.partial()` already makes all fields optional. However, the plan adds `eventId` **after** the `.partial()` call, which means it needs to be added to the base object **before** `.partial()`.

Looking at the existing pattern, `recurringBillId` is defined as `z.uuidv7().nullable()` inside the base object (before `.partial()`), so `.partial()` makes it `z.uuidv7().nullable().optional()`. The plan should add `eventId` to the base object of `UpdateExpenseSchema`, not after `.partial()`.

**Fix:** Add `eventId: z.uuidv7().nullable()` inside the `z.object({...})` block of `UpdateExpenseSchema` (before `.partial()`), matching how `recurringBillId` is handled.

---

## Minor Issues (nice to have — cosmetic or could cause confusion)

### M1. Sidebar nav icon `CalendarRangeIcon` may not exist in lucide-react

**Severity:** Minor  
**Location:** Task 11, Step 1 (plan line 1941)  
**Evidence:** The plan uses `CalendarRangeIcon` from `@hoalu/icons/lucide`. The `@hoalu/icons/lucide` package re-exports everything from `lucide-react`. `CalendarRange` does exist in lucide-react, so this should work. However, the existing sidebar uses icons from `@hoalu/icons/tabler` (e.g., `CashBanknoteMoveIcon`, `CalendarDollarIcon`, `LayoutDashboardIcon`). Using a lucide icon would be visually inconsistent.

**Fix:** Consider using a tabler icon instead for visual consistency with the sidebar. The existing `CalendarDollarIcon` is from tabler — a similar event-themed tabler icon would be more consistent.

---

### M2. Route file `events.tsx` imports `DialogProvider` but doesn't use it

**Severity:** Minor  
**Location:** Task 9, Step 1 (plan line 1805)  
**Evidence:** The route file imports:
```typescript
import { DialogProvider } from "#app/components/providers/dialog-provider.tsx";
```
But never uses `DialogProvider` in the component. This is a dead import.

**Fix:** Remove the unused import.

---

### M3. `event-actions.tsx` defines a local `EventFormSchema` that duplicates `schema.ts`

**Severity:** Minor (duplication)  
**Location:** Task 8, Step 2 (plan lines 1422–1430) vs Task 5, Step 2 (plan lines 793–801)  
**Evidence:** `EventFormSchema` is defined in both `apps/app/src/lib/schema.ts` (Task 5) and locally in `event-actions.tsx` (Task 8). The codebase convention is to define form schemas in `lib/schema.ts` and import them in action components.

**Fix:** Remove the local definition in `event-actions.tsx` and import from `#app/lib/schema.ts`.

---

### M4. `event-details.tsx` uses `useSetAtom(editEventDialogAtom)` but edit dialog needs event data

**Severity:** Minor (UX gap)  
**Location:** Task 8, Step 3 (plan line 1674)  
**Evidence:** The edit button calls:
```typescript
setEditDialog({ state: true, data: { id: event.id } })
```

But `EditEventDialogContent` (plan line 1507) takes `{ event: SyncedEvent }` as a prop. When rendered via `DialogProvider`, the component only receives `dialog.data` (which is `{ id: string }`), not the full `SyncedEvent` object. The `EditEventDialogContent` would need to look up the event from the live query using the ID.

**Fix:** Refactor `EditEventDialogContent` to accept `{ data?: Record<string, any> }` and look up the event internally using `useLiveQueryEvents()` + `data.id`, matching how other dialog content components work in the `DialogProvider` pattern.

---

### M5. `event-list.tsx` uses `SelectField` pattern inconsistently with spec

**Severity:** Minor  
**Location:** Task 10, Step 2 (plan line 1886)  
**Evidence:** The plan uses `field.SelectField` for the event dropdown in expense forms:
```tsx
<field.SelectField label="Event (optional)" options={[{ label: "None", value: "" }, ...eventOptions]} />
```

The `SelectField` component (`apps/app/src/components/forms/select.tsx`) accepts `{ value: string; label: string }[]` and works with string values. Using `""` (empty string) for "None" is a valid pattern. However, the `SelectWithSearchField` would be more appropriate for events (searchable dropdown, consistent with how category/wallet selects work). The spec (line 201) says to use the "SelectWithSearch pattern."

**Fix:** Use `field.SelectWithSearchField` instead of `field.SelectField` to match the spec and provide a better UX for workspaces with many events.

---

## Architecture Considerations

1. **Electric SQL sync latency:** The plan correctly identifies that `totalSpent` is computed client-side from the expense collection. After creating an expense with an `eventId`, the Electric SQL sync must propagate the change before the event's `totalSpent` updates. This is inherent to the architecture and acceptable.

2. **No server-side closed-event validation:** The spec explicitly chose frontend-only filtering (open events in dropdown). This is documented and acceptable for MVP.

3. **FX conversion in `useLiveQueryEvents`:** The plan includes a full FX conversion implementation (plan lines 1100–1151) that duplicates logic from `use-expenses.ts`. Consider extracting this into a shared utility to avoid drift.

---

## Summary Table

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| B1 | **BLOCKING** | `.omit()` on refined Zod schema — TypeError | Task 2, Step 1 |
| B2 | **BLOCKING** | `api-client.ts` described as auto-generated (it's manual) | Task 2, Step 6 |
| B3 | **BLOCKING** | Dialogs rendered inline instead of via `DialogProvider` | Task 8 & 9 |
| B4 | **BLOCKING** | `@hoalu/icons/radix` doesn't exist | Task 8, Step 3 |
| B5 | **BLOCKING** | `events.$id.tsx` listed but never created | Task 9 |
| I1 | Important | POST middleware order inconsistency (spec vs plan code) | Task 2, Step 3 |
| I2 | Important | `eq()` on nullable `event_id` — verify behavior | Task 7, Step 1 |
| I3 | Important | `selectedEventAtom` defined in two places | Task 5 & 7 |
| I4 | Important | `eventId` placement in `UpdateExpenseSchema` | Task 3, Step 1 |
| M1 | Minor | Sidebar icon from wrong icon set | Task 11 |
| M2 | Minor | Unused `DialogProvider` import | Task 9 |
| M3 | Minor | Duplicate `EventFormSchema` definition | Task 5 & 8 |
| M4 | Minor | Edit dialog needs event lookup, not prop | Task 8 |
| M5 | Minor | `SelectField` vs `SelectWithSearchField` | Task 10 |

---

## Next Steps

1. Fix all 5 blocking issues before implementation begins
2. Address the 4 important issues during implementation
3. Minor issues can be handled as polish during or after implementation

**Result: NOT READY for implementation. 5 blocking issues must be resolved first.**
