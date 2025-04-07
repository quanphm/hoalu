import type { ExpenseFormSchema } from "@/lib/schema";
import { atomWithStorage } from "jotai/utils";

export const draftExpenseAtom = atomWithStorage<Omit<ExpenseFormSchema, "attachments">>(
	"draft-expense",
	{
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
	},
);
