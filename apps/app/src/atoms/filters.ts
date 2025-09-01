import { atom } from "jotai";

import { calculateDateRange } from "@/helpers/date-range";
import type { CategorySchema, RepeatSchema, WalletSchema } from "@/lib/schema";

export const expenseCategoryFilterAtom = atom<CategorySchema["id"][]>([]);

export const expenseWalletFilterAtom = atom<WalletSchema["id"][]>([]);

export const expenseRepeatFilterAtom = atom<RepeatSchema[]>([]);

export const searchKeywordsAtom = atom<string>("");

export type PredefinedDateRange = "7" | "30" | "wtd" | "mtd" | "ytd" | "all" | "custom";
export interface CustomDateRange {
	from: Date;
	to: Date;
}

export const selectDateRangeAtom = atom<PredefinedDateRange>("7");
export const customDateRangeAtom = atom<CustomDateRange | undefined>(undefined);

export const syncedDateRangeAtom = atom(
	(get) => ({
		selected: get(selectDateRangeAtom),
		custom: get(customDateRangeAtom),
	}),
	(_get, set, update: { selected?: PredefinedDateRange; custom?: CustomDateRange }) => {
		const { selected, custom } = update;

		if (selected) {
			set(selectDateRangeAtom, selected);

			const dateRange = calculateDateRange(selected, custom);
			console.log(dateRange);
			if (dateRange) {
				set(customDateRangeAtom, { from: dateRange.startDate, to: dateRange.endDate });
			} else {
				set(customDateRangeAtom, undefined);
			}
		}

		if (custom) {
			set(selectDateRangeAtom, "custom");
			set(customDateRangeAtom, custom);
		}
	},
);
