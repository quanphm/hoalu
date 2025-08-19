import { atom } from "jotai";

import type { CategorySchema, RepeatSchema, WalletSchema } from "@/lib/schema";

export const expenseCategoryFilterAtom = atom<CategorySchema["id"][]>([]);

export const expenseWalletFilterAtom = atom<WalletSchema["id"][]>([]);

export const expenseRepeatFilterAtom = atom<RepeatSchema[]>([]);

export const searchKeywordsAtom = atom<string>("");

export type DateRangeFilter = "7d" | "30d" | "all";

export const dateRangeFilterAtom = atom<DateRangeFilter>("all");
