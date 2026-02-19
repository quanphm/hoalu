import { DEFAULT_DATE_RANGE } from "#app/helpers/constants.ts";
import { calculateDateRange } from "#app/helpers/date-range.ts";
import type { CategorySchema, WalletSchema } from "#app/lib/schema.ts";
import type { RepeatSchema } from "@hoalu/common/schema";
import { atom } from "jotai";

export const expenseCategoryFilterAtom = atom<CategorySchema["id"][]>([]);

export const chartCategoryFilterAtom = atom<CategorySchema["id"][]>([]);

export const expenseWalletFilterAtom = atom<WalletSchema["id"][]>([]);

export const expenseRepeatFilterAtom = atom<RepeatSchema[]>([]);

export interface AmountFilterState {
	min: number | null;
	max: number | null;
}

export const expenseAmountFilterAtom = atom<AmountFilterState>({
	min: null,
	max: null,
});

export const searchKeywordsAtom = atom<string>("");

export type ChartGroupBy = "date" | "month";

export const chartGroupByAtom = atom<ChartGroupBy>("date");

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

export const selectDateRangeAtom = atom<PredefinedDateRange>(DEFAULT_DATE_RANGE);

const initValue = calculateDateRange(DEFAULT_DATE_RANGE);
export const customDateRangeAtom = atom<CustomDateRange | null>(
	initValue ? { from: initValue.startDate, to: initValue.endDate } : null,
);

export const syncedDateRangeAtom = atom(
	(get) => ({
		selected: get(selectDateRangeAtom),
		custom: get(customDateRangeAtom),
	}),
	(_get, set, update: { selected?: PredefinedDateRange; custom?: CustomDateRange }) => {
		const { selected, custom } = update;

		if (selected) {
			set(selectDateRangeAtom, selected);

			if (selected === "custom") {
				if (custom) {
					set(customDateRangeAtom, custom);
				}
			} else {
				const dateRange = calculateDateRange(selected, custom);
				set(
					customDateRangeAtom,
					dateRange ? { from: dateRange.startDate, to: dateRange.endDate } : null,
				);
			}
		}

		if (custom && selected !== "custom") {
			set(selectDateRangeAtom, "custom");
			set(customDateRangeAtom, custom);
		}
	},
);
