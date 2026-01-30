import { atom } from "jotai";

import { DEFAULT_DATE_RANGE } from "#app/helpers/constants.ts";
import { calculateDateRange } from "#app/helpers/date-range.ts";
import type { CategorySchema, RepeatSchema, WalletSchema } from "#app/lib/schema.ts";

// Mobile filter panel visibility (collapsed by default on mobile)
export const mobileFilterExpandedAtom = atom<boolean>(false);

export const expenseCategoryFilterAtom = atom<CategorySchema["id"][]>([]);

export const chartCategoryFilterAtom = atom<CategorySchema["id"][]>([]);

export const expenseWalletFilterAtom = atom<WalletSchema["id"][]>([]);

export const expenseRepeatFilterAtom = atom<RepeatSchema[]>([]);

export const searchKeywordsAtom = atom<string>("");

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
