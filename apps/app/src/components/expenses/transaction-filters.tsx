import { toFromToDateObject } from "@hoalu/datetime/datetime";
import {
	ArrowsClockwiseIcon,
	CalendarIcon,
	CurrencyDollarIcon,
	ShapesIcon,
	WalletIcon,
	XIcon,
} from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { RangeCalendar } from "@hoalu/ui/calendar-range";
import { Label } from "@hoalu/ui/label";
import { NumberField, NumberFieldGroup, NumberFieldInput } from "@hoalu/ui/number-field";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
import { cn } from "@hoalu/ui/utils";
import { useValue } from "@legendapp/state/react";
import { getRouteApi } from "@tanstack/react-router";
import { useId } from "react";

import {
	type AmountFilterState,
	expenseAmountFilter$,
	expenseCategoryFilter$,
	expenseRepeatFilter$,
	expenseWalletFilter$,
	transactionKindFilter$,
} from "#app/atoms/index.ts";
import {
	useLiveQueryCategories,
	type SyncedCategory,
} from "#app/components/categories/use-categories.ts";
import { FilterPill, type FilterPillOption } from "#app/components/expenses/filter-pill.tsx";
import { pillClass } from "#app/components/forms/pill.tsx";
import { useLiveQueryWallets } from "#app/components/wallets/use-wallets.ts";
import { createChartColor, createWalletTheme } from "#app/helpers/colors.ts";
import { AVAILABLE_REPEAT_OPTIONS, CATEGORY_TYPE_LABELS } from "#app/helpers/constants.ts";
import { formatShortDate } from "#app/helpers/format-date.ts";

import type { RepeatSchema } from "@hoalu/schema/schema";

const expenseRouteApi = getRouteApi("/_dashboard/$slug/_toolbar-and-queue/transactions");

const MAX_CALENDAR_MONTH = new Date(new Date().getFullYear() + 2, 11);

const EMPTY_AMOUNT_FILTER: AmountFilterState = { min: null, max: null, equal: null };

const FACET_ICON_CLASS = "size-3.5 shrink-0";

export function TransactionFilters() {
	const wallets = useLiveQueryWallets();
	const categories = useLiveQueryCategories();

	const amountFilter = useValue(expenseAmountFilter$);
	const setAmountFilter = expenseAmountFilter$.set;
	const selectedCategories = useValue(expenseCategoryFilter$);
	const setSelectedCategories = expenseCategoryFilter$.set;
	const selectedWallets = useValue(expenseWalletFilter$);
	const setSelectedWallets = expenseWalletFilter$.set;
	const selectedRepeats = useValue(expenseRepeatFilter$);
	const setSelectedRepeats = expenseRepeatFilter$.set;
	const kindFilter = useValue(transactionKindFilter$);
	const { date: searchByDate } = expenseRouteApi.useSearch();
	const navigate = expenseRouteApi.useNavigate();
	const dateRange = toFromToDateObject(searchByDate);

	const setDateRange = (range: { from: Date; to: Date } | undefined) => {
		if (!range) {
			navigate({ search: (state) => ({ ...state, date: undefined }) });
			return;
		}
		navigate({
			search: (state) => ({ ...state, date: `${range.from.getTime()}-${range.to.getTime()}` }),
		});
	};

	const amountSummary = describeAmount(amountFilter);
	const dateSummary = dateRange
		? `${formatShortDate(dateRange.from)} – ${formatShortDate(dateRange.to)}`
		: null;
	const categorySummary = summarize(
		selectedCategories,
		categories.map((category) => ({ value: category.id, label: category.name })),
		["category", "categories"],
	);
	const walletSummary = summarize(
		selectedWallets,
		wallets.map((wallet) => ({ value: wallet.id, label: wallet.name })),
		["wallet", "wallets"],
	);
	const repeatSummary = summarize(
		selectedRepeats,
		AVAILABLE_REPEAT_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
		["repeat", "repeats"],
	);

	const categoryOption = (category: SyncedCategory): FilterPillOption => ({
		value: category.id,
		label: category.name,
		swatch: createChartColor(category.color),
	});
	const categoryOptions = categories.map(categoryOption);
	const kindTypes: Array<"expense" | "income"> =
		kindFilter === "all" ? ["expense", "income"] : [kindFilter];
	const categorySections = kindTypes
		.map((type) => ({
			label: CATEGORY_TYPE_LABELS[type],
			options: categories.filter((category) => category.type === type).map(categoryOption),
		}))
		.filter((section) => section.options.length > 0);

	const walletOptions: FilterPillOption[] = wallets.map((wallet) => ({
		value: wallet.id,
		label: wallet.name,
		swatch: createWalletTheme(wallet.type),
		meta: wallet.total,
	}));

	const repeatOptions: FilterPillOption<RepeatSchema>[] = AVAILABLE_REPEAT_OPTIONS.map(
		(option) => ({ value: option.value, label: option.label }),
	);

	const activeCount = [
		dateSummary,
		amountSummary,
		categorySummary,
		walletSummary,
		repeatSummary,
	].filter((summary) => summary !== null).length;

	const resetAll = () => {
		setDateRange(undefined);
		setAmountFilter(EMPTY_AMOUNT_FILTER);
		setSelectedCategories([]);
		setSelectedWallets([]);
		setSelectedRepeats([]);
	};

	return (
		<div
			className={cn(
				"flex min-w-0 [scrollbar-width:none] items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden",
				"md:flex-wrap md:overflow-visible",
			)}
		>
			<div className="bg-border mx-1 hidden h-5 w-px shrink-0 md:block" aria-hidden="true" />
			<DateFacet summary={dateSummary} value={dateRange} onChange={setDateRange} />
			<AmountFacet summary={amountSummary} value={amountFilter} onChange={setAmountFilter} />
			<FilterPill
				icon={<ShapesIcon className={FACET_ICON_CLASS} aria-hidden="true" />}
				placeholder="Category"
				summary={categorySummary}
				options={categoryOptions}
				sections={categorySections.length > 0 ? categorySections : undefined}
				value={selectedCategories}
				onValueChange={setSelectedCategories}
				searchPlaceholder="Search categories…"
				emptyMessage="No category found."
			/>
			<FilterPill
				icon={<WalletIcon className={FACET_ICON_CLASS} aria-hidden="true" />}
				placeholder="Wallet"
				summary={walletSummary}
				options={walletOptions}
				value={selectedWallets}
				onValueChange={setSelectedWallets}
				searchPlaceholder="Search wallets…"
				emptyMessage="No wallet found."
			/>
			<FilterPill
				icon={<ArrowsClockwiseIcon className={FACET_ICON_CLASS} aria-hidden="true" />}
				placeholder="Repeat"
				summary={repeatSummary}
				options={repeatOptions}
				value={selectedRepeats}
				onValueChange={setSelectedRepeats}
				searchPlaceholder="Search repeats…"
				emptyMessage="No repeat found."
			/>

			{activeCount > 0 && (
				<Button
					variant="ghost"
					size="sm"
					onClick={resetAll}
					className="text-muted-foreground shrink-0 gap-1 font-normal"
				>
					<XIcon className="size-3.5" />
					Clear
				</Button>
			)}
		</div>
	);
}

function summarize(
	selected: string[],
	options: Array<{ value: string; label: string }>,
	nouns: [one: string, many: string],
): string | null {
	if (selected.length === 0) return null;
	if (selected.length === 1) {
		return options.find((option) => option.value === selected[0])?.label ?? `1 ${nouns[0]}`;
	}
	return `${selected.length} ${nouns[1]}`;
}

function describeAmount(filter: AmountFilterState): string | null {
	if (filter.equal !== null) return `= ${filter.equal}`;
	if (filter.min !== null && filter.max !== null) return `${filter.min}–${filter.max}`;
	if (filter.min !== null) return `≥ ${filter.min}`;
	if (filter.max !== null) return `≤ ${filter.max}`;
	return null;
}

/**
 * The date and amount facets hold a value rather than a list, so they keep a popover. They wear
 * the same chip as the list facets: one row of filters, one way to read it.
 */
function PopoverFacet({
	placeholder,
	summary,
	icon,
	children,
	className,
}: {
	placeholder: string;
	summary: string | null;
	icon: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Popover>
			<PopoverTrigger
				render={
					<button
						type="button"
						aria-label={summary ? `${placeholder}: ${summary}` : placeholder}
						className={cn(pillClass.base, summary ? pillClass.active : pillClass.idle, "max-w-44")}
					>
						{icon}
						<span className="truncate">{summary ?? placeholder}</span>
					</button>
				}
			/>
			<PopoverContent align="start" className={cn("w-64 p-0", className)}>
				{children}
			</PopoverContent>
		</Popover>
	);
}

function FacetFooter({ onClear }: { onClear: () => void }) {
	return (
		<div className="border-border border-t p-1">
			<Button variant="ghost" className="w-full justify-start" onClick={onClear}>
				<XIcon className="-ms-1 me-2 size-3.5 opacity-60" aria-hidden="true" />
				Clear
			</Button>
		</div>
	);
}

function AmountFacet({
	summary,
	value,
	onChange,
}: {
	summary: string | null;
	value: AmountFilterState;
	onChange: (value: AmountFilterState) => void;
}) {
	const equalId = useId();
	const minId = useId();
	const maxId = useId();

	return (
		<PopoverFacet
			placeholder="Amount"
			summary={summary}
			icon={<CurrencyDollarIcon className={FACET_ICON_CLASS} aria-hidden="true" />}
		>
			<div className="flex flex-col gap-3 p-3">
				<LabeledAmount
					id={equalId}
					sign="="
					label="Specific amount"
					value={value.equal}
					onValueChange={(equal) => onChange({ min: null, max: null, equal })}
				/>
				<LabeledAmount
					id={minId}
					sign="≥"
					label="At least…"
					value={value.min}
					onValueChange={(min) => onChange({ min, max: null, equal: null })}
				/>
				<LabeledAmount
					id={maxId}
					sign="≤"
					label="No more than…"
					value={value.max}
					onValueChange={(max) => onChange({ min: null, max, equal: null })}
				/>
			</div>
			{summary !== null && <FacetFooter onClear={() => onChange(EMPTY_AMOUNT_FILTER)} />}
		</PopoverFacet>
	);
}

function LabeledAmount({
	id,
	sign,
	label,
	value,
	onValueChange,
}: {
	id: string;
	sign: "=" | "≥" | "≤";
	label: string;
	value: number | null;
	onValueChange: (value: number | null) => void;
}) {
	return (
		<div>
			<Label htmlFor={id} className="text-muted-foreground mb-1.5 block text-xs">
				{label}
			</Label>
			<div className="flex rounded-md">
				<span className="border-input bg-muted text-muted-foreground inline-flex items-center rounded-s-md border border-e-0 px-3 text-sm">
					{sign}
				</span>
				<NumberField
					value={value ?? undefined}
					onValueChange={onValueChange}
					min={0}
					step={0.01}
					className="flex-1"
				>
					<NumberFieldGroup className="border-input data-focus-within:border-ring data-focus-within:ring-ring/20 relative inline-flex h-9 w-full items-center overflow-hidden rounded-md rounded-s-none border text-sm whitespace-nowrap outline-none focus-visible:outline-none data-disabled:opacity-50 data-focus-within:ring-[3px]">
						<NumberFieldInput
							id={id}
							className="bg-background text-foreground flex-1 px-3 py-2 tabular-nums outline-none"
						/>
					</NumberFieldGroup>
				</NumberField>
			</div>
		</div>
	);
}

function DateFacet({
	summary,
	value,
	onChange,
}: {
	summary: string | null;
	value: { from: Date; to: Date } | undefined;
	onChange: (value: { from: Date; to: Date } | undefined) => void;
}) {
	const handleRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
		if (!range?.from) {
			onChange(undefined);
			return;
		}
		if (!range.to) return;
		onChange({ from: range.from, to: range.to });
	};

	return (
		<PopoverFacet
			placeholder="Date"
			summary={summary}
			icon={<CalendarIcon className={FACET_ICON_CLASS} aria-hidden="true" />}
			className="w-auto"
		>
			<RangeCalendar
				captionLayout="dropdown"
				value={value}
				onChange={handleRangeChange}
				endMonth={MAX_CALENDAR_MONTH}
			/>
			{value && <FacetFooter onClear={() => onChange(undefined)} />}
		</PopoverFacet>
	);
}
