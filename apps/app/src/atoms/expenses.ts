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
	recurringBillId: undefined,
};
const draftExpenseAtom = atomWithStorage("draft_expense", basedExpense);

const selectedExpenseAtom = atom<{
	id: string | null;
}>({
	id: null,
});

/**
 * Used by the "Log payment" flow from upcoming bills.
 * When set, CreateExpenseForm will include this recurringBillId in the POST payload
 * (which also advances the bill's anchor_date server-side).
 */
const logPaymentAtom = atom<{ recurringBillId: string | null }>({ recurringBillId: null });

export { draftExpenseAtom, selectedExpenseAtom, logPaymentAtom };
