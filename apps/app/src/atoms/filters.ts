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

const initValue = calculateDateRange("7");

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
