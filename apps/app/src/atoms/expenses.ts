import type { ExpenseFormSchema } from "#app/lib/schema.ts";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

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
const draftExpenseAtom = atomWithStorage("draft_expense", basedExpense);

const selectedExpenseAtom = atom<{
	id: string | null;
}>({
	id: null,
});

export { draftExpenseAtom, selectedExpenseAtom };
