# Mobile Dropdown Z-Index Fix in Drawer/Sheet

**Date**: 2026-02-15
**Task**: Fix dropdowns not selectable on mobile when editing expense inside sheet/drawer

## Problem

When editing an expense on mobile, the edit form opens in a bottom Drawer (using Vaul). All dropdown/select components inside the drawer could not be selected - tapping on dropdown items had no effect.

### Root Cause

Z-index stacking conflict between the Drawer and floating UI components. The Drawer overlay (`fixed inset-0 z-50`) intercepts touch events because portaled dropdowns were rendered at the same z-level.

**Before:**
| Component | Z-Index |
|-----------|---------|
| Drawer overlay | `z-50` |
| Drawer content | `z-50` |
| Select positioner | `z-50` |
| Combobox positioner | `z-50` |
| Popover positioner | `z-50` |
| DropdownMenu popup | `z-50` |
| Autocomplete positioner | `z-50` |
| Tooltip positioner | `z-50` |

## Solution

Established a z-index hierarchy for floating UI components:

**After:**
| Component | Z-Index | Purpose |
|-----------|---------|---------|
| Drawer/Sheet overlay | `z-50` | Modal backdrop (unchanged) |
| Drawer/Sheet content | `z-50` | Modal content (unchanged) |
| Select positioner | `z-[60]` | Dropdowns above modals |
| Combobox positioner | `z-[60]` | Dropdowns above modals |
| Popover positioner | `z-[60]` | Popovers above modals |
| DropdownMenu popup | `z-[60]` | Menus above modals |
| Autocomplete positioner | `z-[60]` | Autocomplete above modals |
| Tooltip positioner | `z-[70]` | Tooltips above everything |

## Files Modified

### `packages/ui/src/components/select.tsx`

- `SelectPositioner`: `z-50` → `z-[60]`
- `SelectContent` popup: Removed redundant `z-[60]` (positioner controls stacking)

### `packages/ui/src/components/combobox.tsx`

- `ComboboxPositioner`: `z-50` → `z-[60]`

### `packages/ui/src/components/popover.tsx`

- `PopoverPositioner`: `z-50` → `z-[60]`
- `PopoverContent` popup: Removed redundant `z-[60]` (positioner controls stacking)

### `packages/ui/src/components/dropdown-menu.tsx`

- `DropdownMenuContent` popup: `z-50` → `z-[60]`
- `DropdownMenuSubContent` popup: `z-50` → `z-[60]`

### `packages/ui/src/components/autocomplete.tsx`

- `AutocompletePositioner`: `z-50` → `z-[60]`

### `packages/ui/src/components/tooltip.tsx`

- `TooltipPositioner`: `z-50` → `z-[70]` (tooltips should appear above dropdowns)

## Z-Index Architecture

```
z-[70] - Tooltips (highest - always visible)
z-[60] - Floating UI (Select, Combobox, Popover, DropdownMenu, Autocomplete)
z-50   - Modal layers (Drawer, Sheet, Dialog, AlertDialog)
z-40   - (reserved)
```

## Why This Works

1. **Portal behavior**: All floating components use `Portal` to render to `document.body`, escaping the DOM tree
2. **Stacking context**: The positioner's z-index controls the entire floating panel's stacking
3. **Touch events**: Mobile browsers use painted stacking order for hit-testing; higher z-index = receives touch events
4. **Redundancy cleanup**: Inner popup elements don't need z-index when wrapped by a positioned parent

## Testing

1. Open the app on mobile (or use mobile viewport in DevTools)
2. Navigate to expenses
3. Tap on an expense to open details drawer
4. Tap "Edit" to open edit form
5. Verify all dropdowns (wallet, category, repeat) can be selected
6. Verify tooltips appear above open dropdowns
7. Verify dropdown menus work inside sheets

## Related Components

The fix affects all places where floating UI components are used inside drawers/sheets:
- Expense edit form (wallet select, category select, repeat select)
- Workspace action menus
- Any forms using Select, Combobox, Popover, or DropdownMenu inside Drawer/Sheet
