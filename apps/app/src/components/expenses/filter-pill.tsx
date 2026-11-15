import { CaretDownIcon, CheckIcon, XIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { Combobox, ComboboxItem, ComboboxTrigger } from "@hoalu/ui/combobox";
import { cn } from "@hoalu/ui/utils";

import { PillPickerPanel, type PillOption } from "#app/components/forms/pill-picker.tsx";
import { pillClass } from "#app/components/forms/pill.tsx";

export interface FilterPillOption<Value extends string = string> extends PillOption<Value> {
	label: string;
	/** Background class of the row's dot. The first two selected ones also mark the closed pill. */
	swatch?: string;
}

export interface FilterPillSection<Value extends string = string> {
	label: string;
	options: FilterPillOption<Value>[];
}

interface FilterPillProps<Value extends string> {
	/** Every option, flat. Resolves the selection and keeps values that the sections hide. */
	options: FilterPillOption<Value>[];
	/** Headed groups inside the popup, when the list has a second axis worth naming. */
	sections?: FilterPillSection<Value>[];
	value: Value[];
	onValueChange: (value: Value[]) => void;
	/** The facet's name. Shown on the pill while nothing is selected. */
	placeholder: string;
	/** The closed pill's value. `null` means "no filter", which is a filter's empty state. */
	summary: string | null;
	/** Marks the unselected pill with the facet's own icon. */
	icon: React.ReactNode;
	searchPlaceholder: string;
	emptyMessage: string;
	className?: string;
}

/**
 * The filter row's multi-select pill: a searchable list where every row carries a checkbox.
 * It exists because a filter is a different question from a form field — the same chip opens,
 * but ticking a row must not close the list, and the chip has to summarise *several* values
 * without growing into a second row of chips.
 */
export function FilterPill<Value extends string>({
	options,
	sections,
	value,
	onValueChange,
	placeholder,
	summary,
	icon,
	searchPlaceholder,
	emptyMessage,
	className,
}: FilterPillProps<Value>) {
	const selectedOptions = value
		.map((entry) => options.find((option) => option.value === entry))
		.filter((option) => option !== undefined);
	const swatches = selectedOptions.filter((option) => option.swatch).slice(0, 2);
	const items = sections
		? sections.map((section) => ({ value: section.label, items: section.options }))
		: options;

	const row = (option: FilterPillOption<Value>) => (
		<ComboboxItem
			key={option.value}
			value={option}
			className="ps-2 pe-2"
			indicator={
				<span
					className={cn(
						"border-input flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
						"in-data-[selected]:border-primary in-data-[selected]:bg-primary in-data-[selected]:text-primary-foreground",
					)}
				>
					<CheckIcon className="size-3 opacity-0 transition-opacity in-data-[selected]:opacity-100" />
				</span>
			}
		>
			<span className="flex min-w-0 items-center gap-2">
				{option.swatch && (
					<span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", option.swatch)} />
				)}
				<span className="truncate">{option.label}</span>
				{option.meta && (
					<span className="text-muted-foreground ms-auto shrink-0 text-xs tabular-nums">
						{option.meta}
					</span>
				)}
			</span>
		</ComboboxItem>
	);

	return (
		<Combobox<FilterPillOption<Value>, true>
			multiple
			items={items}
			value={selectedOptions}
			onValueChange={(next) => onValueChange(next.map((option) => option.value))}
			isItemEqualToValue={(a, b) => a.value === b.value}
			autoHighlight
		>
			<ComboboxTrigger
				aria-label={summary ? `${placeholder}: ${summary}` : placeholder}
				className={cn(
					pillClass.base,
					summary ? pillClass.active : pillClass.idle,
					"max-w-44",
					className,
				)}
			>
				{summary && swatches.length > 0 ? (
					<span aria-hidden="true" className="flex shrink-0 items-center gap-0.5">
						{swatches.map((option) => (
							<span key={option.value} className={cn("size-2 rounded-full", option.swatch)} />
						))}
					</span>
				) : (
					icon
				)}
				<span className="truncate">{summary ?? placeholder}</span>
				<CaretDownIcon className="size-3 shrink-0 opacity-60" aria-hidden="true" />
			</ComboboxTrigger>
			<PillPickerPanel
				options={options}
				sections={sections}
				renderOption={row}
				searchPlaceholder={searchPlaceholder}
				emptyMessage={emptyMessage}
				popupClassName="w-64"
				footer={
					value.length > 0 ? (
						<Button
							variant="ghost"
							className="w-full justify-start"
							onClick={() => onValueChange([])}
						>
							<XIcon className="-ms-1 me-2 size-3.5 opacity-60" aria-hidden="true" />
							Clear
						</Button>
					) : undefined
				}
			/>
		</Combobox>
	);
}
