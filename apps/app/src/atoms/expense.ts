import type { ExpenseFormSchema } from "@/lib/schema";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

type ExpenseAtomSchema = Omit<ExpenseFormSchema, "attachments">;

export const draftExpenseAtom = atomWithStorage<ExpenseAtomSchema>("draft-expense", {
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
});

export const selectedExpenseAtom = atom<ExpenseAtomSchema>({
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
});
