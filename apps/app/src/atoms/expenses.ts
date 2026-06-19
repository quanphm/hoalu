import { observable } from "@legendapp/state";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { syncObservable } from "@legendapp/state/sync";

import type { ExpenseFormSchema } from "#app/lib/schema.ts";

export const scannedReceipts$ = observable<File[]>([]);

type ExpenseAtomSchema = Omit<ExpenseFormSchema, "attachments">;

export const makeDraftExpense = (): ExpenseAtomSchema => ({
	title: "",
	description: "",
	date: new Date().toISOString(),
	transaction: { value: 0, currency: "" },
	walletId: "",
	categoryId: "",
	repeat: "one-time",
	recurringBillId: undefined,
});

export const draftExpense$ = observable<ExpenseAtomSchema>(makeDraftExpense());
syncObservable(draftExpense$, {
	persist: {
		name: "draft_expense",
		plugin: ObservablePersistLocalStorage,
	},
});

export const logPayment$ = observable<{ recurringBillId: string | null }>({
	recurringBillId: null,
});

export const scannedReceiptJobId$ = observable<string | null>(null);

export const quickExpenseJobId$ = observable<string | null>(null);
