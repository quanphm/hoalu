# Mobile Dropdown Z-Index Fix in Drawer/Sheet

**Date**: 2026-02-15
**Task**: Fix dropdowns not selectable on mobile when editing expense inside sheet/drawer

## Problem

When editing an expense on mobile, the edit form opens in a bottom Drawer (using Vaul). All dropdown/select components inside the drawer could not be selected - tapping on dropdown items had no effect.

### Root Cause

Z-index stacking conflict between the Drawer and floating UI components (Select, Combobox, Popover).

**Before:**
| Component | Z-Index |
|-----------|---------|
| Drawer overlay | `z-50` |
| Drawer content | `z-50` |
| Select positioner | `z-50` |
| Select popup | `z-50` |
| Combobox positioner | `z-50` |
| Popover positioner | `z-50` |
| Popover popup | `z-50` |

When Select/Combobox popups are portaled to `document.body`, they render at the same z-level as the drawer overlay. On mobile, the overlay intercepts touch events before they can reach the dropdown items.

## Solution

Increased z-index for all floating UI components from `z-50` to `z-[60]` so they render above the drawer overlay.

**After:**
| Component | Z-Index |
|-----------|---------|
| Drawer overlay | `z-50` (unchanged) |
| Drawer content | `z-50` (unchanged) |
| Select positioner | `z-[60]` |
| Select popup | `z-[60]` |
| Combobox positioner | `z-[60]` |
| Popover positioner | `z-[60]` |
| Popover popup | `z-[60]` |

## Files Modified

### `packages/ui/src/components/select.tsx`

```typescript
// Line 77 - SelectPositioner
className={cn("z-[60]", className)}

// Line 96 - SelectContent popup
"... relative z-[60] max-h-(--available-height) ..."
```

### `packages/ui/src/components/combobox.tsx`

```typescript
// Line 145 - ComboboxPositioner
className="z-[60] select-none"
```

### `packages/ui/src/components/popover.tsx`

```typescript
// Line 25 - PopoverPositioner
className={cn("z-[60]", className)}

// Line 45 - PopoverContent popup
"... data-[open]:animate-in z-[60] w-72 ..."
```

## Why This Works

1. **Portal behavior**: All these components use `Portal` to render their popups to `document.body`, outside the drawer's DOM tree
2. **Z-index stacking**: With same z-index, elements later in DOM order appear on top, but the overlay can still capture touch/click events
3. **Mobile touch specifics**: Mobile browsers handle touch events differently - the overlay at `z-50` was intercepting touches before they reached dropdown items also at `z-50`
4. **Fix**: By setting dropdowns to `z-[60]`, they're guaranteed to be above the drawer overlay in stacking context

## Testing

1. Open the app on mobile (or use mobile viewport in DevTools)
2. Navigate to expenses
3. Tap on an expense to open details drawer
4. Tap "Edit" to open edit form
5. Verify all dropdowns (wallet, category, repeat) can be selected

## Related Components

The fix affects all places where these UI components are used inside drawers/sheets:
- Expense edit form (wallet select, category select, repeat select)
- Any other forms using Select, Combobox, or Popover inside Drawer/Sheet
