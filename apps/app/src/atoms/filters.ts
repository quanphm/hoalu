import { observable } from "@legendapp/state";

import { DEFAULT_DATE_RANGE } from "#app/helpers/constants.ts";
import { calculateDateRange } from "#app/helpers/date-range.ts";

import type { CategorySchema, WalletSchema } from "#app/lib/schema.ts";
import type { RepeatSchema } from "@hoalu/schema/schema";

export const expenseCategoryFilter$ = observable<CategorySchema["id"][]>([]);

export const chartCategoryFilter$ = observable<CategorySchema["id"][]>([]);

export const expenseWalletFilter$ = observable<WalletSchema["id"][]>([]);

export const expenseRepeatFilter$ = observable<RepeatSchema[]>([]);

export interface AmountFilterState {
	min: number | null;
	max: number | null;
	equal: number | null;
}

export const expenseAmountFilter$ = observable<AmountFilterState>({
	min: null,
	max: null,
	equal: null,
});

export const searchKeywords$ = observable<string>("");

export type TransactionKindFilter = "all" | "expense" | "income";
export const transactionKindFilter$ = observable<TransactionKindFilter>("all");

export type ChartGroupBy = "date" | "month";

export const chartGroupBy$ = observable<ChartGroupBy>("month");

export type PredefinedDateRange =
	| "7"
	| "30"
	| "90"
	| "3m"
	| "6m"
	| "12m"
	| "wtd"
	| "mtd"
	| "ytd"
	| "all"
	| "custom";
export interface CustomDateRange {
	from: Date;
	to: Date;
}

export const selectDateRange$ = observable<PredefinedDateRange>(DEFAULT_DATE_RANGE);

const initValue = calculateDateRange(DEFAULT_DATE_RANGE);
export const customDateRange$ = observable<CustomDateRange | null>(
	initValue ? { from: initValue.startDate, to: initValue.endDate } : null,
);

/**
 * Computed read-only view of the current date range selection.
 */
export const syncedDateRange$ = observable(() => ({
	selected: selectDateRange$.get(),
	custom: customDateRange$.get(),
}));

/**
 * Updates the date range, keeping selectDateRange$ and customDateRange$ in sync.
 * Mirrors the previous syncedDateRangeAtom write behavior.
 */
export function setSyncedDateRange(update: {
	selected?: PredefinedDateRange;
	custom?: CustomDateRange;
}) {
	const { selected, custom } = update;

	if (selected) {
		selectDateRange$.set(selected);

		if (selected === "custom") {
			if (custom) {
				customDateRange$.set(custom);
			}
		} else {
			const dateRange = calculateDateRange(selected, custom);
			customDateRange$.set(dateRange ? { from: dateRange.startDate, to: dateRange.endDate } : null);
		}
	}

	if (custom && selected !== "custom") {
		selectDateRange$.set("custom");
		customDateRange$.set(custom);
	}
}
