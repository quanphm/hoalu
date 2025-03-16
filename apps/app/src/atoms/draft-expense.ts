import type { ExpenseFormSchema } from "@/lib/schema";
import { atomWithStorage } from "jotai/utils";

const initialValue = {
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
} as ExpenseFormSchema;

export const draftExpenseAtom = atomWithStorage("draft-expense", initialValue);
