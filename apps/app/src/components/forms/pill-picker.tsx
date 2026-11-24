import { CaretDownIcon, MagnifyingGlassIcon } from "@hoalu/icons/phosphor";
import {
	Combobox,
	ComboboxCollection,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxGroupLabel,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
	ComboboxSeparator,
	ComboboxTrigger,
	ComboboxValue,
} from "@hoalu/ui/combobox";
import { cn } from "@hoalu/ui/utils";

import { pillClass } from "./pill";

export interface PillOption<Value extends string = string> {
	value: Value;
	label: React.ReactNode;
	/** Leading marker in the trigger and the row: a wallet's type colour. */
	icon?: React.ReactNode;
	/** Right-aligned metadata in the row: a status badge, a cadence. */
	meta?: React.ReactNode;
}

export interface PillSection<Value extends string = string> {
	label: string;
	options: PillOption<Value>[];
}

interface PillPickerPanelProps<Value extends string, Option extends PillOption<Value>> {
	/** Every rendered option, flat. */
	options: Option[];
	/** Headed groups inside the popup. Their own item list is what the list filters against. */
	sections?: Array<{ label: string; options: Option[] }>;
	renderOption: (option: Option) => React.ReactNode;
	searchPlaceholder: string;
	/** A five-item list needs no search row; a long one does. */
	searchable?: boolean;
	emptyMessage: string;
	footer?: React.ReactNode;
	popupClassName?: string;
}

/**
 * The popup half of a pill picker: one search row, one list, one footer. Single- and multi-select
 * pickers differ in their trigger and their rows, so this shell is written once — that is what
 * keeps the search field's borderless treatment from drifting between them.
 */
export function PillPickerPanel<Value extends string, Option extends PillOption<Value>>({
	options,
	sections,
	renderOption,
	searchPlaceholder,
	searchable = true,
	emptyMessage,
	footer,
	popupClassName,
}: PillPickerPanelProps<Value, Option>) {
	return (
		<ComboboxPopup className={cn("w-72 max-sm:w-(--available-width)", popupClassName)}>
			<div
				className={cn("border-border/70 border-b p-1.5", !searchable && "sr-only h-0 border-0 p-0")}
			>
				<ComboboxInput
					showTrigger={false}
					placeholder={searchPlaceholder}
					startAddon={<MagnifyingGlassIcon className="size-4" />}
					inputClassName="border-transparent! bg-transparent! shadow-none ring-0! before:hidden"
				/>
			</div>
			<ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
			<ComboboxList>
				{sections
					? (group: { value: string; items: Option[] }) => (
							<ComboboxGroup key={group.value} items={group.items} className="pb-1 last:pb-0">
								{group.value && (
									<ComboboxGroupLabel className="pt-2 pb-1">{group.value}</ComboboxGroupLabel>
								)}
								<ComboboxCollection>{(option: Option) => renderOption(option)}</ComboboxCollection>
							</ComboboxGroup>
						)
					: (option: Option) => renderOption(option)}
			</ComboboxList>
			{footer && (
				<>
					<ComboboxSeparator />
					<div className="p-1">{footer}</div>
				</>
			)}
		</ComboboxPopup>
	);
}

interface PillPickerProps<Value extends string> extends Omit<
	PillPickerPanelProps<Value, PillOption<Value>>,
	"renderOption" | "searchPlaceholder" | "emptyMessage"
> {
	value: Value | undefined;
	onValueChange: (value: Value) => void;
	/** Shown on the closed pill when nothing is selected, and doubling as the field's name. */
	placeholder: string;
	/** Marks the closed pill when its options carry no icon of their own. */
	triggerIcon?: React.ReactNode;
	/**
	 * `pill` is the chip in a row of attributes. `field` is the same picker wearing a form
	 * input's clothes — same height and full width — for dialogs where every other control is
	 * an input at that size.
	 */
	appearance?: "pill" | "field";
	searchPlaceholder?: string;
	emptyMessage?: string;
	disabled?: boolean;
	readOnly?: boolean;
	className?: string;
}

/**
 * A chip-shaped trigger over a searchable list — the shape Linear and Vercel use for assignee,
 * status, and filters. The closed pill carries the current value, so the field costs one row
 * instead of a wall of options and reads as a value rather than an empty control.
 *
 * Rows are rendered through the list's function child on purpose: that is what makes the
 * collection filter as the user types. Mapping `options` into items by hand renders every row
 * regardless of the query.
 */
export function PillPicker<Value extends string>({
	options,
	sections,
	value,
	onValueChange,
	placeholder,
	triggerIcon,
	searchPlaceholder,
	searchable,
	appearance = "pill",
	footer,
	emptyMessage = "No result.",
	disabled,
	readOnly,
	className,
	popupClassName,
}: PillPickerProps<Value>) {
	const selected = options.find((option) => option.value === value);
	const items = sections
		? sections.map((section) => ({ value: section.label, items: section.options }))
		: options;

	const row = (option: PillOption<Value>) => (
		<ComboboxItem
			key={option.value}
			value={option}
			className="grid-cols-[1fr_1rem] ps-2.5 pe-2 *:first:col-start-2 *:last:col-start-1 *:last:row-start-1 pointer-coarse:min-h-10"
		>
			<span className="flex min-w-0 items-center gap-2">
				{option.icon}
				<span className="min-w-0 flex-1 truncate">{option.label}</span>
				{option.meta && (
					<span className="text-muted-foreground shrink-0 text-xs">{option.meta}</span>
				)}
			</span>
		</ComboboxItem>
	);

	return (
		<Combobox<PillOption<Value>>
			items={items}
			value={selected ?? null}
			onValueChange={(next) => {
				if (next) onValueChange(next.value);
			}}
			isItemEqualToValue={(a, b) => a.value === b.value}
			disabled={disabled}
			readOnly={readOnly}
			autoHighlight
		>
			<ComboboxTrigger
				aria-label={placeholder}
				className={cn(
					appearance === "field"
						? "border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/24 relative flex h-8.5 w-full items-center justify-between gap-2 rounded-md border px-[calc(--spacing(3)-1px)] text-base whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] sm:h-7 sm:text-sm [&_svg]:pointer-events-none [&_svg]:shrink-0"
						: cn(pillClass.base, selected ? pillClass.active : pillClass.idle, "w-fit max-w-56"),
					className,
				)}
			>
				{triggerIcon}
				<ComboboxValue>
					{(current: PillOption<Value> | null) => (
						<span className="flex min-w-0 items-center gap-1.5">
							{current?.icon}
							<span className={cn("truncate", !current && "text-muted-foreground")}>
								{current?.label ?? placeholder}
							</span>
						</span>
					)}
				</ComboboxValue>
				<CaretDownIcon
					className={cn("shrink-0 opacity-60", appearance === "field" ? "size-3.5" : "size-3")}
					aria-hidden="true"
				/>
			</ComboboxTrigger>
			<PillPickerPanel
				options={options}
				sections={sections}
				renderOption={row}
				searchPlaceholder={searchPlaceholder ?? `Search ${placeholder.toLowerCase()}…`}
				searchable={searchable}
				emptyMessage={emptyMessage}
				footer={footer}
				popupClassName={popupClassName}
			/>
		</Combobox>
	);
}
