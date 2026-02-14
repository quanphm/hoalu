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
