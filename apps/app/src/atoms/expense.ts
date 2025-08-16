import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import type { ExpenseFormSchema } from "@/lib/schema";

type ExpenseAtomSchema = Omit<ExpenseFormSchema, "attachments">;
const basedExpense: ExpenseAtomSchema = {
	title: "",
	description: "",
	date: new Date().toISOString(),
	transaction: {
		value: 0,
		currency: "",
	},
	walletId: "",
	categoryId: "",
	repeat: "one-time",
};
export const draftExpenseAtom = atomWithStorage("draft-expense", basedExpense);

export const selectedExpenseAtom = atom<{
	id: string | null;
}>({
	id: null,
});

export const searchKeywordsAtom = atom<string>("");
