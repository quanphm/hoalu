import {
	type AmountFilterState,
	expenseAmountFilterAtom,
	expenseCategoryFilterAtom,
	expenseRepeatFilterAtom,
	expenseWalletFilterAtom,
	searchKeywordsAtom,
} from "#app/atoms/index.ts";
import {
	useLiveQueryCategories,
	type SyncedCategory,
} from "#app/components/categories/use-categories.ts";
import { WalletLabel } from "#app/components/wallets/wallet-badge.tsx";
import { AVAILABLE_REPEAT_OPTIONS } from "#app/helpers/constants.ts";
import { walletsQueryOptions } from "#app/services/query-options.ts";
import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import type { RepeatSchema, WalletTypeSchema } from "@hoalu/common/schema";
import {
	CalendarIcon,
	CheckIcon,
	FilterIcon,
	ListFilterIcon,
	RefreshCwIcon,
	SearchIcon,
	TagIcon,
	WalletIcon,
	DollarSignIcon,
	XIcon,
} from "@hoalu/icons/lucide";
import { CaretRightFilledIcon } from "@hoalu/icons/tabler";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import { Calendar } from "@hoalu/ui/calendar";
import { Checkbox } from "@hoalu/ui/checkbox";
import { Input } from "@hoalu/ui/input";
import { Label } from "@hoalu/ui/label";
import { NumberField, NumberFieldGroup, NumberFieldInput } from "@hoalu/ui/number-field";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { Separator } from "@hoalu/ui/separator";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";

const workspaceRouteApi = getRouteApi("/_dashboard/$slug");
const expenseRouteApi = getRouteApi("/_dashboard/$slug/expenses");

type FilterMenuView = "main" | "amount" | "category" | "wallet" | "repeat" | "date" | "search";

export function ExpenseFilterDropdown() {
	const { slug } = workspaceRouteApi.useParams();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const categories = useLiveQueryCategories();

	const [open, setOpen] = useState(false);
	const [currentView, setCurrentView] = useState<FilterMenuView>("search");

	const [amountFilter, setAmountFilter] = useAtom(expenseAmountFilterAtom);
	const [selectedCategories, setSelectedCategories] = useAtom(expenseCategoryFilterAtom);
	const [selectedWallets, setSelectedWallets] = useAtom(expenseWalletFilterAtom);
	const [selectedRepeats, setSelectedRepeats] = useAtom(expenseRepeatFilterAtom);
	const [searchKeywords, setSearchKeywords] = useAtom(searchKeywordsAtom);
	const { date: searchByDate } = expenseRouteApi.useSearch();
	const navigate = expenseRouteApi.useNavigate();
	const dateRange = toFromToDateObject(searchByDate);

	const activeFiltersCount = useMemo(() => {
		let count = 0;
		if (amountFilter.min !== null || amountFilter.max !== null) count++;
		if (selectedCategories.length > 0) count++;
		if (selectedWallets.length > 0) count++;
		if (selectedRepeats.length > 0) count++;
		if (dateRange) count++;
		if (searchKeywords) count++;
		return count;
	}, [
		amountFilter,
		selectedCategories.length,
		selectedWallets.length,
		selectedRepeats.length,
		dateRange,
		searchKeywords,
	]);

	const filterSummaries = useMemo(() => {
		const summaries: { key: string; label: string; onRemove: () => void }[] = [];

		if (amountFilter.min !== null || amountFilter.max !== null) {
			let label = "";
			if (amountFilter.min !== null && amountFilter.max !== null) {
				label = `$${amountFilter.min} - $${amountFilter.max}`;
			} else if (amountFilter.min !== null) {
				label = `≥ $${amountFilter.min}`;
			} else if (amountFilter.max !== null) {
				label = `≤ $${amountFilter.max}`;
			}
			summaries.push({
				key: "amount",
				label,
				onRemove: () => setAmountFilter({ min: null, max: null }),
			});
		}

		if (selectedCategories.length > 0) {
			const categoryNames = categories
				.filter((c) => selectedCategories.includes(c.id))
				.map((c) => c.name);
			summaries.push({
				key: "category",
				label: categoryNames.length === 1 ? categoryNames[0] : `${categoryNames.length} categories`,
				onRemove: () => setSelectedCategories([]),
			});
		}

		if (selectedWallets.length > 0) {
			const walletNames = wallets.filter((w) => selectedWallets.includes(w.id)).map((w) => w.name);
			summaries.push({
				key: "wallet",
				label: walletNames.length === 1 ? walletNames[0] : `${walletNames.length} wallets`,
				onRemove: () => setSelectedWallets([]),
			});
		}

		if (selectedRepeats.length > 0) {
			const repeatLabels = AVAILABLE_REPEAT_OPTIONS.filter((r) =>
				selectedRepeats.includes(r.value),
			).map((r) => r.label);
			summaries.push({
				key: "repeat",
				label: repeatLabels.length === 1 ? repeatLabels[0] : `${repeatLabels.length} repeats`,
				onRemove: () => setSelectedRepeats([]),
			});
		}

		if (dateRange) {
			summaries.push({
				key: "date",
				label: `${datetime.format(dateRange.from, "MMM dd")} - ${datetime.format(dateRange.to, "MMM dd")}`,
				onRemove: () => navigate({ search: (s) => ({ ...s, date: undefined }) }),
			});
		}

		if (searchKeywords) {
			summaries.push({
				key: "search",
				label: `"${searchKeywords}"`,
				onRemove: () => setSearchKeywords(""),
			});
		}

		return summaries;
	}, [
		amountFilter,
		selectedCategories,
		selectedWallets,
		selectedRepeats,
		dateRange,
		searchKeywords,
		categories,
		wallets,
		navigate,
		setAmountFilter,
		setSelectedCategories,
		setSelectedWallets,
		setSelectedRepeats,
		setSearchKeywords,
	]);

	const resetAllFilters = useCallback(() => {
		setAmountFilter({ min: null, max: null });
		setSelectedCategories([]);
		setSelectedWallets([]);
		setSelectedRepeats([]);
		setSearchKeywords("");
		navigate({ search: (s) => ({ ...s, date: undefined }) });
	}, [
		setAmountFilter,
		setSelectedCategories,
		setSelectedWallets,
		setSelectedRepeats,
		setSearchKeywords,
		navigate,
	]);

	// Check if filter has active value
	const hasActiveFilter = (filter: FilterMenuView) => {
		switch (filter) {
			case "amount":
				return amountFilter.min !== null || amountFilter.max !== null;
			case "category":
				return selectedCategories.length > 0;
			case "wallet":
				return selectedWallets.length > 0;
			case "repeat":
				return selectedRepeats.length > 0;
			case "date":
				return !!dateRange;
			case "search":
				return !!searchKeywords;
			default:
				return false;
		}
	};

	return (
		<div className="flex flex-wrap items-center gap-2">
			<Popover
				open={open}
				onOpenChange={(isOpen) => {
					setOpen(isOpen);
					if (!isOpen) setCurrentView("search");
				}}
			>
				<PopoverTrigger render={<Button variant="outline" />}>
					<ListFilterIcon className="size-4" />
					<span>Filters</span>
					<Badge variant="secondary" size="sm">
						{activeFiltersCount}
					</Badge>
				</PopoverTrigger>

				<PopoverContent
					className="w-xs overflow-hidden p-0 md:w-[540px]"
					align="start"
					side="right"
				>
					<div className="flex min-h-[400px]">
						{/* Left Panel - Filter Menu */}
						<div className="bg-accent w-[200px] border-r p-1">
							<FilterMenuItem
								icon={<SearchIcon className="size-4" />}
								label="Search"
								active={hasActiveFilter("search")}
								selected={currentView === "search"}
								onClick={() => setCurrentView("search")}
							/>
							<FilterMenuItem
								icon={<CalendarIcon className="size-4" />}
								label="Date"
								active={hasActiveFilter("date")}
								selected={currentView === "date"}
								onClick={() => setCurrentView("date")}
							/>
							<FilterMenuItem
								icon={<DollarSignIcon className="size-4" />}
								label="Amount"
								active={hasActiveFilter("amount")}
								selected={currentView === "amount"}
								onClick={() => setCurrentView("amount")}
							/>
							<FilterMenuItem
								icon={<TagIcon className="size-4" />}
								label="Category"
								active={hasActiveFilter("category")}
								selected={currentView === "category"}
								onClick={() => setCurrentView("category")}
							/>
							<FilterMenuItem
								icon={<WalletIcon className="size-4" />}
								label="Wallet"
								active={hasActiveFilter("wallet")}
								selected={currentView === "wallet"}
								onClick={() => setCurrentView("wallet")}
							/>
							<FilterMenuItem
								icon={<RefreshCwIcon className="size-4" />}
								label="Repeat"
								active={hasActiveFilter("repeat")}
								selected={currentView === "repeat"}
								onClick={() => setCurrentView("repeat")}
							/>
						</div>

						{/* Right Panel - Filter Content */}
						<div className="flex h-[400px] flex-1 flex-col overflow-scroll">
							{currentView === "main" && (
								<MainFilterView
									activeFiltersCount={activeFiltersCount}
									filterSummaries={filterSummaries}
								/>
							)}
							{currentView === "search" && (
								<SearchFilterView value={searchKeywords} onChange={setSearchKeywords} />
							)}
							{currentView === "amount" && (
								<AmountFilterView value={amountFilter} onChange={setAmountFilter} />
							)}
							{currentView === "category" && (
								<CategoryFilterView
									categories={categories}
									selected={selectedCategories}
									onChange={setSelectedCategories}
								/>
							)}
							{currentView === "wallet" && (
								<WalletFilterView
									wallets={wallets}
									selected={selectedWallets}
									onChange={setSelectedWallets}
								/>
							)}
							{currentView === "repeat" && (
								<RepeatFilterView selected={selectedRepeats} onChange={setSelectedRepeats} />
							)}
							{currentView === "date" && (
								<DateFilterView
									value={dateRange}
									onChange={(range) => {
										if (!range) {
											navigate({
												search: (s) => ({ ...s, date: undefined }),
											});
											return;
										}
										if (range.from && range.to) {
											const query = `${range.from.getTime()}-${range.to.getTime()}`;
											navigate({
												search: (s) => ({ ...s, date: query }),
											});
										}
									}}
								/>
							)}
						</div>
					</div>
					<Separator />
					<div className="flex items-center justify-end p-2">
						<Button variant="ghost" size="sm" onClick={resetAllFilters}>
							Reset all
						</Button>
					</div>
				</PopoverContent>
			</Popover>

			{filterSummaries.map((summary) => (
				<Badge
					key={summary.key}
					variant="secondary"
					render={<button type="button" onClick={summary.onRemove} />}
					size="lg"
				>
					{summary.label}
					<XIcon className="size-4" />
				</Badge>
			))}

			{activeFiltersCount > 1 && (
				<Button
					variant="ghost"
					size="sm"
					className="text-muted-foreground"
					onClick={resetAllFilters}
				>
					Reset
				</Button>
			)}
		</div>
	);
}

function FilterMenuItem({
	icon,
	label,
	active,
	selected,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	active: boolean;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<Button
			variant="ghost"
			onClick={onClick}
			className={cn(
				"flex w-full",
				selected ? "bg-background hover:bg-background" : "hover:bg-background",
			)}
		>
			<span
				className={cn(
					"flex size-5 items-center justify-center",
					active ? "text-primary" : "text-muted-foreground",
				)}
			>
				{active ? <CheckIcon className="size-4" /> : icon}
			</span>
			<span className="flex-1 text-left">{label}</span>
			<CaretRightFilledIcon className="text-muted-foreground size-4" />
		</Button>
	);
}

function MainFilterView({
	activeFiltersCount,
	filterSummaries,
}: {
	activeFiltersCount: number;
	filterSummaries: { key: string; label: string; onRemove: () => void }[];
}) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
			{activeFiltersCount === 0 ? (
				<>
					<FilterIcon className="text-muted-foreground mb-2 size-8" />
					<p className="text-muted-foreground text-sm">Select a filter from the menu</p>
				</>
			) : (
				<>
					<p className="mb-4 text-sm font-medium">
						{activeFiltersCount} active filter
						{activeFiltersCount > 1 ? "s" : ""}
					</p>
					<div className="flex flex-wrap justify-center gap-2">
						{filterSummaries.map((summary) => (
							<Badge key={summary.key} variant="outline">
								{summary.label}
							</Badge>
						))}
					</div>
				</>
			)}
		</div>
	);
}

function SearchFilterView({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium">Search</h3>
				{value && (
					<Button variant="ghost" size="sm" onClick={() => onChange("")}>
						Reset
					</Button>
				)}
			</div>
			<div className="relative">
				<Input
					type="search"
					placeholder="Search by title, description, or amount"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="ps-6"
					autoFocus
				/>
				<SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
			</div>
		</div>
	);
}

function AmountFilterView({
	value,
	onChange,
}: {
	value: AmountFilterState;
	onChange: (value: AmountFilterState) => void;
}) {
	const handleMinChange = useCallback(
		(newValue: number | null) => {
			onChange({
				...value,
				min: newValue,
			});
		},
		[value, onChange],
	);

	const handleMaxChange = useCallback(
		(newValue: number | null) => {
			onChange({
				...value,
				max: newValue,
			});
		},
		[value, onChange],
	);

	const resetFilter = useCallback(() => {
		onChange({ min: null, max: null });
	}, [onChange]);

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium">Amount</h3>
				{(value.min !== null || value.max !== null) && (
					<Button variant="ghost" size="sm" onClick={resetFilter}>
						Reset
					</Button>
				)}
			</div>

			<div className="flex flex-col gap-3">
				<div>
					<Label className="text-muted-foreground mb-1.5 block text-xs">At least...</Label>
					<div className="flex rounded-md">
						<span className="border-input bg-muted text-muted-foreground inline-flex items-center rounded-s-md border border-e-0 px-3 text-sm">
							≥
						</span>
						<NumberField
							value={value.min ?? undefined}
							format={{
								style: "currency",
								currency: "USD",
								currencyDisplay: "symbol",
								currencySign: "accounting",
							}}
							onValueChange={handleMinChange}
							min={0}
							step={0.01}
							className="flex-1"
						>
							<NumberFieldGroup className="border-input data-focus-within:border-ring data-focus-within:ring-ring/20 relative inline-flex h-9 w-full items-center overflow-hidden rounded-md rounded-s-none border text-sm whitespace-nowrap outline-none focus-visible:outline-none data-disabled:opacity-50 data-focus-within:ring-[3px]">
								<NumberFieldInput className="bg-background text-foreground flex-1 px-3 py-2 tabular-nums outline-none" />
							</NumberFieldGroup>
						</NumberField>
					</div>
				</div>

				<div>
					<Label className="text-muted-foreground mb-1.5 block text-xs">No more than...</Label>
					<div className="flex rounded-md">
						<span className="border-input bg-muted text-muted-foreground inline-flex items-center rounded-s-md border border-e-0 px-3 text-sm">
							≤
						</span>
						<NumberField
							value={value.max ?? undefined}
							format={{
								style: "currency",
								currency: "USD",
								currencyDisplay: "symbol",
								currencySign: "accounting",
							}}
							onValueChange={handleMaxChange}
							min={0}
							step={0.01}
							className="flex-1"
						>
							<NumberFieldGroup className="border-input data-focus-within:border-ring data-focus-within:ring-ring/20 relative inline-flex h-9 w-full items-center overflow-hidden rounded-md rounded-s-none border text-sm whitespace-nowrap outline-none focus-visible:outline-none data-disabled:opacity-50 data-focus-within:ring-[3px]">
								<NumberFieldInput className="bg-background text-foreground flex-1 px-3 py-2 tabular-nums outline-none" />
							</NumberFieldGroup>
						</NumberField>
					</div>
				</div>
			</div>
		</div>
	);
}

function CategoryFilterView({
	categories,
	selected,
	onChange,
}: {
	categories: SyncedCategory[];
	selected: string[];
	onChange: (value: string[]) => void;
}) {
	const toggleCategory = (id: string) => {
		if (selected.includes(id)) {
			onChange(selected.filter((s) => s !== id));
		} else {
			onChange([...selected, id]);
		}
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium">Category</h3>
				{selected.length > 0 && (
					<Button variant="ghost" size="sm" onClick={() => onChange([])}>
						Reset
					</Button>
				)}
			</div>

			<div className="flex flex-col gap-1">
				{categories.map((category) => (
					<Label
						key={category.id}
						htmlFor={`filter-category-${category.id}`}
						className="hover:bg-accent/50 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
					>
						<Checkbox
							id={`filter-category-${category.id}`}
							checked={selected.includes(category.id)}
							onCheckedChange={() => toggleCategory(category.id)}
						/>
						<span className="flex-1 truncate">{category.name}</span>
						<span className="text-muted-foreground text-xs tabular-nums">{category.total}</span>
					</Label>
				))}
			</div>
		</div>
	);
}

function WalletFilterView({
	wallets,
	selected,
	onChange,
}: {
	wallets: Array<{
		id: string;
		name: string;
		type: WalletTypeSchema;
		total: number;
	}>;
	selected: string[];
	onChange: (value: string[]) => void;
}) {
	const toggleWallet = (id: string) => {
		if (selected.includes(id)) {
			onChange(selected.filter((s) => s !== id));
		} else {
			onChange([...selected, id]);
		}
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium">Wallet</h3>
				{selected.length > 0 && (
					<Button variant="ghost" size="sm" onClick={() => onChange([])}>
						Reset
					</Button>
				)}
			</div>

			<ScrollArea className="h-[280px]">
				<div className="flex flex-col gap-1">
					{wallets.map((wallet) => (
						<Label
							key={wallet.id}
							htmlFor={`filter-wallet-${wallet.id}`}
							className="hover:bg-accent/50 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
						>
							<Checkbox
								id={`filter-wallet-${wallet.id}`}
								checked={selected.includes(wallet.id)}
								onCheckedChange={() => toggleWallet(wallet.id)}
							/>
							<span className="flex-1">
								<WalletLabel name={wallet.name} type={wallet.type} />
							</span>
							<span className="text-muted-foreground text-xs tabular-nums">{wallet.total}</span>
						</Label>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}

function RepeatFilterView({
	selected,
	onChange,
}: {
	selected: RepeatSchema[];
	onChange: (value: RepeatSchema[]) => void;
}) {
	const toggleRepeat = (value: RepeatSchema) => {
		if (selected.includes(value)) {
			onChange(selected.filter((s) => s !== value));
		} else {
			onChange([...selected, value]);
		}
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium">Repeat</h3>
				{selected.length > 0 && (
					<Button variant="ghost" size="sm" onClick={() => onChange([])}>
						Reset
					</Button>
				)}
			</div>

			<div className="flex flex-col gap-1">
				{AVAILABLE_REPEAT_OPTIONS.map((option) => (
					<Label
						key={option.value}
						htmlFor={`filter-repeat-${option.value}`}
						className="hover:bg-accent/50 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
					>
						<Checkbox
							id={`filter-repeat-${option.value}`}
							checked={selected.includes(option.value)}
							onCheckedChange={() => toggleRepeat(option.value)}
						/>
						<span className="flex-1">{option.label}</span>
					</Label>
				))}
			</div>
		</div>
	);
}

function DateFilterView({
	value,
	onChange,
}: {
	value: { from: Date; to: Date } | undefined;
	onChange: (value: { from: Date; to: Date } | undefined) => void;
}) {
	return (
		<div className="flex flex-col p-4">
			<div className="mb-2 flex items-center justify-between">
				<h3 className="font-medium">Date Range</h3>
				{value && (
					<Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>
						Reset
					</Button>
				)}
			</div>

			<Calendar
				mode="range"
				captionLayout="dropdown"
				selected={value}
				onSelect={(selected) => {
					if (!selected) {
						onChange(undefined);
						return;
					}
					if (selected.from && selected.to) {
						onChange({ from: selected.from, to: selected.to });
					}
				}}
				className="[--cell-size:--spacing(9)]"
			/>

			{value && (
				<p className="text-muted-foreground mt-2 text-center text-sm">
					{datetime.format(value.from, "MMM dd, yyyy")} -{" "}
					{datetime.format(value.to, "MMM dd, yyyy")}
				</p>
			)}
		</div>
	);
}
