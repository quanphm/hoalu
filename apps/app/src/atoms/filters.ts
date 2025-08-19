import { atom } from "jotai";

import type { CategorySchema, RepeatSchema, WalletSchema } from "@/lib/schema";

export const expenseCategoryFilterAtom = atom<CategorySchema["id"][]>([]);

export const expenseWalletFilterAtom = atom<WalletSchema["id"][]>([]);

export const expenseRepeatFilterAtom = atom<RepeatSchema[]>([]);

export const searchKeywordsAtom = atom<string>("");
