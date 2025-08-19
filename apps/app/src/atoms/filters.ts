import { atom } from "jotai";

import type { CategorySchema, RepeatSchema, WalletSchema } from "@/lib/schema";

export const expenseCategoryFilterAtom = atom<CategorySchema["id"][]>([]);

export const expenseWalletFilterAtom = atom<WalletSchema["id"][]>([]);

export const expenseRepeatFilterAtom = atom<RepeatSchema[]>([]);

export const searchKeywordsAtom = atom<string>("");

export type DashboardDateRange = "7" | "30" | "all" | "custom";

export interface CustomDateRange {
	from: Date;
	to: Date;
}

export const selectDateRangeAtom = atom<DashboardDateRange>("7");
export const customDateRangeAtom = atom<CustomDateRange | undefined>(undefined);
