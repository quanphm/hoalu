import { atom } from "jotai";

import type { CategorySchema, WalletSchema } from "@/lib/schema";

export const expenseCategoryFilterAtom = atom<CategorySchema["id"][]>([]);

export const expenseWalletFilterAtom = atom<WalletSchema["id"][]>([]);

export const searchKeywordsAtom = atom<string>("");
