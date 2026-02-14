# Command Palette Virtualization Fix

**Date**: 2026-02-15
**Issue**: Virtualized items in command palette overflow outside dialog bounds when scrolling

## Problem

When searching in the command palette (e.g., "an sang"), virtualized expense items were rendering outside the dialog popup bounds. Items with large `translateY` values (480px+) would visually escape the container despite `overflow: hidden` being applied.

### Root Cause

The command palette had two separate groups:

1. A virtualized `Expenses` group using `position: absolute` + `translateY()` transforms
2. A non-virtualized `Actions` group

The dual-group architecture with separate scroll contexts caused the overflow issue. CSS `overflow: hidden` doesn't properly clip absolutely positioned elements with transforms in certain stacking contexts.

### Attempted Fixes That Didn't Work

- Adding `overflow: hidden` to CommandPanel
- Adding `position: relative` to scroll container
- Fixed height on scroll container
- Adding `contain: strict`
- Various combinations of overflow properties

## Solution

Unified both expenses and actions into a **single virtualized list** with one scroll container.

### Key Changes

**1. Created unified item types:**

```typescript
type VirtualizedItem =
	| { type: "header"; label: string }
	| { type: "expense"; data: ExpenseSearchResult }
	| { type: "action"; data: ActionItem };
```

**2. Built unified items array:**

```typescript
const virtualizedItems: VirtualizedItem[] = useMemo(() => {
	const items: VirtualizedItem[] = [];

	if (hasExpenseResults) {
		items.push({ type: "header", label: "Expenses" });
		for (const expense of filteredExpenses) {
			items.push({ type: "expense", data: expense });
		}
	}

	items.push({ type: "header", label: "Actions" });
	for (const action of actions) {
		items.push({ type: "action", data: action });
	}

	return items;
}, [hasExpenseResults, filteredExpenses, actions]);
```

**3. Single virtualizer with variable item heights:**

```typescript
const virtualizer = useVirtualizer({
	count: items.length,
	getScrollElement: () => parentRef.current,
	estimateSize: (index) => (items[index].type === "header" ? HEADER_HEIGHT : ITEM_HEIGHT),
	overscan: 5,
});
```

**4. Smart height calculation (no unnecessary scrollbar):**

```typescript
const needsScroll = totalHeight > MAX_LIST_HEIGHT;
// Add 8px extra space at the bottom when content fits naturally
const containerHeight = needsScroll ? MAX_LIST_HEIGHT : totalHeight + 8;

// Only apply overflow-y-auto when scrolling is needed
className={`... ${needsScroll ? "overflow-y-auto" : "overflow-y-hidden"}`}
```

**5. Render items by type:**

```typescript
{virtualItems.map((virtualRow) => {
  const item = items[virtualRow.index];

  if (item.type === "header") {
    return (
      <div
        key={`header-${item.label}`}
        className="text-muted-foreground absolute left-0 top-0 w-full px-2 py-1.5 text-xs font-medium"
        style={{ transform: `translateY(${virtualRow.start}px)` }}
      >
        {item.label}
      </div>
    );
  }

  if (item.type === "expense") { /* render expense item */ }
  if (item.type === "action") { /* render action item */ }
})}
```

## Files Modified

- `apps/app/src/components/command-palette.tsx` - Complete refactor to unified virtualized list

## Constants

```typescript
const ITEM_HEIGHT = 36;
const HEADER_HEIGHT = 32;
const MAX_LIST_HEIGHT = 384; // max-h-96
```

## Key Learnings

1. **Virtualization with mixed content**: Use discriminated unions (`type` field) to handle different item types in a single virtualized list
2. **Variable height virtualization**: Pass a function to `estimateSize` that returns different heights based on item type
3. **Conditional overflow**: Only apply `overflow-y-auto` when content exceeds max height to avoid unnecessary scrollbars
4. **Bottom padding**: Add extra space (8px) when content fits naturally to prevent items from touching container edges

---

## Keyboard Navigation for Virtualized Lists (base-ui Autocomplete)

**Date**: 2026-02-15
**Issue**: Arrow up/down keyboard navigation not working in virtualized command palette

### Problem

After implementing virtualization, keyboard navigation (ArrowUp/ArrowDown) stopped working. The highlight stayed on the first item regardless of key presses.

### Root Cause

base-ui's Autocomplete requires specific props on `Autocomplete.Item` (wrapped as `CommandItem`) to manage keyboard navigation:

1. `value` - the actual item object that base-ui tracks internally
2. `index` - the item's index in the `items` array passed to `Autocomplete.Root`

Additionally, items must be wrapped in `Autocomplete.List` (wrapped as `CommandList`) for the listbox keyboard management to work.

### Solution

**1. Track `itemIndex` separately from virtual row index:**

Headers are not selectable items, so we need a separate counter that only increments for actual items:

```typescript
type VirtualizedItem =
	| { type: "header"; label: string; itemIndex?: never }
	| { type: "expense"; data: ExpenseSearchResult; itemIndex: number }
	| { type: "action"; data: ActionItem; itemIndex: number };

const virtualizedItems: VirtualizedItem[] = useMemo(() => {
	const items: VirtualizedItem[] = [];
	let itemIndex = 0;

	if (hasExpenseResults) {
		items.push({ type: "header", label: "Expenses" });
		for (const expense of filteredExpenses) {
			items.push({ type: "expense", data: expense, itemIndex });
			itemIndex++;
		}
	}

	items.push({ type: "header", label: "Actions" });
	for (const action of actions) {
		items.push({ type: "action", data: action, itemIndex });
		itemIndex++;
	}

	return items;
}, [hasExpenseResults, filteredExpenses, actions]);
```

**2. Build `autocompleteItems` array for base-ui:**

This array contains only selectable items (no headers) and is passed to `Command` (Autocomplete.Root):

```typescript
const autocompleteItems = useMemo(() => {
	const expenseItems = filteredExpenses.map((e) => ({
		id: e.id,
		title: e.title,
		amount: e.amount,
	}));
	const actionItems = actions.map((a) => ({ id: a.id, label: a.label }));
	return [...expenseItems, ...actionItems];
}, [filteredExpenses, actions]);
```

**3. Pass `value` and `index` to CommandItem:**

```typescript
if (item.type === "expense") {
  const expense = item.data;
  const autocompleteItem = autocompleteItems[item.itemIndex];
  return (
    <CommandItem
      key={expense.id}
      value={autocompleteItem}  // Required for base-ui item tracking
      index={item.itemIndex}    // Required for virtualized keyboard nav
      // ... other props
    />
  );
}
```

**4. Wrap virtualized content in CommandList:**

```typescript
return (
  <CommandList className="!p-0">
    <div ref={parentRef} style={{ height: containerHeight }} className="...">
      <div style={{ height: totalHeight }} className="relative w-full">
        {virtualItems.map((virtualRow) => {
          // ... render items
        })}
      </div>
    </div>
  </CommandList>
);
```

### Key Props Required

| Prop    | Purpose                                                                            |
| ------- | ---------------------------------------------------------------------------------- |
| `value` | The item object from `autocompleteItems` - base-ui uses this for internal tracking |
| `index` | The item's position in `autocompleteItems` - required when `virtualized={true}`    |

### Files Modified

- `apps/app/src/components/command-palette.tsx`

### Additional Improvements Made

1. **Results count in footer**: Shows "X results" when expense search returns matches
2. **Vertical separator fix**: Added explicit height (`!h-4`) since `h-full` doesn't work in flex containers with `items-center`
3. **Accessibility improvements**: Added `aria-hidden="true"` to decorative Kbd icons and `role="presentation"` to section headers

---

## Keyboard Navigation Scrolling for Off-Screen Items

**Date**: 2026-02-15
**Issue**: Keyboard navigation stops when items are outside the visible viewport

### Problem

With virtualization, keyboard navigation (ArrowUp/ArrowDown) appeared to "stop" when the next item to highlight wasn't rendered by the virtualizer. The virtualizer only renders items within the visible area + overscan, so if you press ArrowDown and the next item isn't rendered, nothing visible happens.

### Solution

Use the `onItemHighlighted` callback on `Autocomplete.Root` (wrapped as `Command`) to scroll the virtualizer to the highlighted item when navigating via keyboard.

**1. Create a ref to hold the scroll function:**

```typescript
const scrollToItemRef = useRef<((itemIndex: number) => void) | null>(null);
```

**2. Implement `onItemHighlighted` callback:**

```typescript
const handleItemHighlighted = useCallback(
	(highlightedValue: unknown, eventDetails: { reason: string }) => {
		if (eventDetails.reason === "keyboard" && highlightedValue) {
			const value = highlightedValue as { id: string };
			// Find the index of the highlighted item in autocompleteItems
			const itemIndex = autocompleteItems.findIndex((item) => item.id === value.id);
			if (itemIndex !== -1 && scrollToItemRef.current) {
				scrollToItemRef.current(itemIndex);
			}
		}
	},
	[autocompleteItems],
);
```

**3. Pass callback to Command:**

```typescript
<Command
  items={autocompleteItems}
  virtualized
  onItemHighlighted={handleItemHighlighted}
>
```

**4. Expose scroll function from VirtualizedList via ref:**

```typescript
function VirtualizedList({ scrollToItemRef, items, ... }) {
  useEffect(() => {
    scrollToItemRef.current = (itemIndex: number) => {
      // Find the virtualizedItems index that corresponds to this itemIndex
      const virtualIndex = items.findIndex(
        (item) => item.type !== "header" && item.itemIndex === itemIndex,
      );
      if (virtualIndex !== -1) {
        virtualizer.scrollToIndex(virtualIndex, { align: "auto" });
      }
    };

    return () => {
      scrollToItemRef.current = null;
    };
  }, [items, virtualizer, scrollToItemRef]);
}
```

### Key Details

1. **`onItemHighlighted` receives item value, not index**: You need to find the index by matching the item's `id`
2. **`eventDetails.reason`**: Can be `'keyboard'`, `'pointer'`, or `'none'` - only scroll for keyboard navigation
3. **Two-level index mapping**:
   - `itemIndex` in autocompleteItems (excludes headers)
   - `virtualIndex` in virtualizedItems (includes headers)
4. **`align: "auto"`**: Scrolls minimally to bring item into view (doesn't center unnecessarily)

### Files Modified

- `apps/app/src/components/command-palette.tsx`

### base-ui Documentation Reference

From the Autocomplete API docs:

```typescript
onItemHighlighted?: (
  highlightedValue: ItemValue | undefined,
  eventDetails: { reason: 'keyboard' | 'pointer' | 'none' }
) => void
```

Callback fired when an item is highlighted or unhighlighted. The `reason` describes why the highlight changed.

---

## Description-Matched Items Not Keyboard-Navigable

**Date**: 2026-02-15
**Issue**: Searching "bia" shows 8 results including items matched via description (e.g., "Kingfood", "Foodmart"), but keyboard navigation skips those items and cannot reach them.

### Problem

When searching "bia", `filteredExpenses` correctly matched expenses where "bia" appeared in either `title` or `description`. However, keyboard navigation only worked for expenses where "bia" was in the `title`.

### Root Cause

base-ui `Autocomplete` (via `Command`) uses `mode="list"` by default, which **re-filters `autocompleteItems` internally** against the typed query. The `autocompleteItems` array only exposes `{ id, title, amount }` per expense — no `description`. So for items like "Kingfood" (matched via description), base-ui's internal filter couldn't match "bia" against `title: "Kingfood"` and treated those items as hidden/non-navigable.

This created a split:

- **Visible in list**: all 8 expenses (pre-filtered by `filteredExpenses` which checks both title + description)
- **Navigable via keyboard**: only the subset whose `title` contained "bia" (base-ui's internal filter)

### Solution

Add `mode="none"` to the `Command` component in `command-palette.tsx`.

```typescript
// Before
<Command
  items={autocompleteItems}
  value={search}
  onValueChange={(value) => setSearch(value)}
  virtualized
  onItemHighlighted={handleItemHighlighted}
>

// After
<Command
  items={autocompleteItems}
  value={search}
  onValueChange={(value) => setSearch(value)}
  virtualized
  mode="none"
  onItemHighlighted={handleItemHighlighted}
>
```

`mode="none"` tells base-ui that items are **static/pre-filtered** — no internal filtering is applied. All items passed to `Command` are treated as fully navigable.

### base-ui `mode` Values

| Mode             | Filtering               | Inline autocompletion |
| ---------------- | ----------------------- | --------------------- |
| `list` (default) | Dynamic, based on input | No                    |
| `both`           | Dynamic, based on input | Yes                   |
| `inline`         | None (static)           | Yes                   |
| `none`           | None (static)           | No                    |

Use `mode="none"` whenever filtering is handled externally (as in this command palette).

### Files Modified

- `apps/app/src/components/command-palette.tsx` — added `mode="none"` to `<Command>`

---

## Code Refactoring for Maintainability

**Date**: 2026-02-15
**Issue**: Single 407-line file handling multiple concerns

### Problem

The `command-palette.tsx` file grew to 407 lines with:

- Type definitions
- Constants
- Custom hooks
- Multiple component renderers
- Virtualization logic
- Main component

This made navigation and modification harder as complexity grew.

### Solution

Split into a modular directory structure:

```
apps/app/src/components/command-palette/
├── index.ts                 # Barrel export
├── types.ts                 # Type definitions (~35 lines)
├── constants.ts             # Configuration constants (4 lines)
├── use-expense-search.ts    # Live query hook (~45 lines)
├── header-item.tsx          # Header renderer (~15 lines)
├── expense-item.tsx         # Expense item renderer (~45 lines)
├── action-item.tsx          # Action item renderer (~25 lines)
├── virtualized-list.tsx     # Virtualization logic (~110 lines)
└── command-palette.tsx      # Main component (~175 lines)
```

### Key Decisions

**1. Discriminated union types centralized:**

```typescript
// types.ts
export type VirtualizedItem =
	| { type: "header"; label: string; itemIndex?: never }
	| { type: "expense"; data: ExpenseSearchResult; itemIndex: number }
	| { type: "action"; data: ActionItem; itemIndex: number };

export type AutocompleteItem = AutocompleteExpenseItem | AutocompleteActionItem;
```

**2. Item renderers as separate components:**

Each item type has its own file, making it easy to:

- Test in isolation
- Modify styling without affecting others
- Add new item types (wallets, tasks, etc.)

**3. Constants extracted for easy tuning:**

```typescript
// constants.ts
export const ITEM_HEIGHT = 36;
export const HEADER_HEIGHT = 32;
export const MAX_LIST_HEIGHT = 384;
export const VIRTUALIZER_OVERSCAN = 5;
```

**4. Hook separation:**

`useExpenseSearch` extracted to its own file with clear return type annotation.

### Benefits

1. **Single responsibility** - Each file handles one concern
2. **Easier testing** - Item renderers can be tested independently
3. **Future extensibility** - Adding new item types just requires a new `*-item.tsx`
4. **Better navigation** - Easier to find and modify specific parts
5. **Smaller diffs** - Changes are localized to relevant files

### Files Created

- `apps/app/src/components/command-palette/index.ts`
- `apps/app/src/components/command-palette/types.ts`
- `apps/app/src/components/command-palette/constants.ts`
- `apps/app/src/components/command-palette/use-expense-search.ts`
- `apps/app/src/components/command-palette/header-item.tsx`
- `apps/app/src/components/command-palette/expense-item.tsx`
- `apps/app/src/components/command-palette/action-item.tsx`
- `apps/app/src/components/command-palette/virtualized-list.tsx`
- `apps/app/src/components/command-palette/command-palette.tsx`

### Files Modified

- `apps/app/src/components/providers/workspace-action-provider.tsx` — updated import path

### Files Removed

- `apps/app/src/components/command-palette.tsx` — replaced by directory structure
