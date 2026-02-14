# SelectWithSearchField Migration to Combobox

**Date**: 2026-02-15
**Task**: Migrate `SelectWithSearchField` from Command/Popover pattern to base-ui Combobox

## Problem

The `SelectWithSearchField` component in `apps/app/src/components/forms/select-with-search.tsx` was using an older pattern with:
- `Popover` + `PopoverTrigger` + `PopoverContent`
- `Command` + `CommandInput` + `CommandList` + `CommandItem`
- Manual state management for `open` state

This was inconsistent with the newer `SelectCategoryField` component which uses the base-ui `Combobox` pattern.

## Solution

Migrated to use the `Combobox` component from `@hoalu/ui/combobox`, following the pattern established in `SelectCategoryField`.

### Key Changes

**1. Replaced imports:**

```typescript
// Before
import { CheckIcon, ChevronDownIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@hoalu/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";

// After
import { Combobox, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxPopup } from "@hoalu/ui/combobox";
```

**2. Removed manual state management:**

```typescript
// Before
const [open, setOpen] = useState(false);

// After
// Combobox handles open state internally
```

**3. Simplified value handling:**

```typescript
// Before
const { value } = field.state;
// ... complex onSelect logic finding option by label

// After
const selectedOption = props.options.find((opt) => opt.value === value) ?? null;

<Combobox<SelectOption>
  value={selectedOption}
  onValueChange={(newValue) => {
    field.handleChange(newValue?.value ?? "");
  }}
  items={props.options}
>
```

**4. Updated component structure:**

```typescript
// Before
<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger render={<Button ...>}>
    {/* trigger content */}
  </PopoverTrigger>
  <PopoverContent>
    <Command>
      <CommandInput />
      <CommandList>
        <CommandEmpty />
        <CommandGroup>
          {options.map((opt) => (
            <CommandItem key={opt.value} onSelect={...}>
              {opt.label}
              {value === opt.value && <CheckIcon />}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>

// After
<Combobox<SelectOption>
  value={selectedOption}
  onValueChange={(newValue) => field.handleChange(newValue?.value ?? "")}
  items={props.options}
  disabled={props.disabled}
>
  <ComboboxInput placeholder="Select" />
  <ComboboxPopup className="max-h-64">
    <ComboboxEmpty>No result.</ComboboxEmpty>
    <ComboboxList>
      {(item: SelectOption) => (
        <ComboboxItem key={item.value} value={item}>
          {item.label}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxPopup>
</Combobox>
```

### Benefits of Combobox Pattern

1. **Less boilerplate**: No manual `open` state management
2. **Built-in features**: Check icon indicator, keyboard navigation, search filtering handled automatically
3. **Consistent UX**: Same behavior as other combobox components in the app
4. **Type safety**: Generic `Combobox<SelectOption>` provides proper typing

## Files Modified

- `apps/app/src/components/forms/select-with-search.tsx` - Complete migration to Combobox

## Gotcha: Import Extensions

When importing local files in Bun projects, ensure correct file extensions:

```typescript
// Wrong - file is .ts not .tsx
import { Field } from "./components.tsx";
import { useFieldContext } from "./context.tsx";

// Correct
import { Field } from "./components.ts";
import { useFieldContext } from "./context.ts";
```

This caused a Vite import resolution error: `Failed to resolve import "./context.tsx"`.

## Reference

See `apps/app/src/components/forms/select-category.tsx` for a more complete example that also includes a dialog for creating new items inline.
