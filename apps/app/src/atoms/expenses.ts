import { observable } from "@legendapp/state";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { syncObservable } from "@legendapp/state/sync";

import type { ExpenseFormSchema } from "#app/lib/schema.ts";

/**
 * Holds the original high-res receipt files captured during OCR scan.
 * Written by ReceiptReview when user approves, cleared by CreateExpenseForm after upload.
 * Stored in memory only (File objects are not serialisable to localStorage).
 * Supports multiple files when the user scans multiple attachments at once.
 */
const scannedReceipts$ = observable<File[]>([]);

/**
 * @deprecated Use scannedReceipts$ instead.
 * Kept for backward compatibility — resolves to the first file in scannedReceipts$.
 */
const scannedReceipt$ = observable<File | null>(null);

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
const draftExpense$ = observable<ExpenseAtomSchema>(basedExpense);
syncObservable(draftExpense$, {
	persist: {
		name: "draft_expense",
		plugin: ObservablePersistLocalStorage,
	},
});

function resetDraftExpense() {
	draftExpense$.set(basedExpense);
}

/**
 * Used by the "Log payment" flow from upcoming bills.
 * When set, CreateExpenseForm will include this recurringBillId in the POST payload
 * (which also advances the bill's anchor_date server-side).
 */
const logPayment$ = observable<{ recurringBillId: string | null }>({ recurringBillId: null });

/**
 * Tracks the receipt scan queue job ID that produced the current draft expense.
 * Written by ScanQueueReviewDialogContent when the user proceeds to create an expense.
 * Read and cleared by CreateExpenseForm after the expense is successfully created,
 * so the originating scan job is removed from the queue automatically.
 * In-memory only — no persistence needed (transient handoff between two dialogs).
 */
const scannedReceiptJobId$ = observable<string | null>(null);

/**
 * Tracks the quick expense queue job ID that produced the current draft expense.
 * Written by QuickExpenseJobItem in queue-panel when the user clicks "Review".
 * Read and cleared by CreateExpenseForm after the expense is successfully created,
 * so the originating quick expense job is removed from the queue automatically.
 * In-memory only — no persistence needed (transient handoff between components).
 */
const quickExpenseJobId$ = observable<string | null>(null);

export {
	draftExpense$,
	resetDraftExpense,
	logPayment$,
	scannedReceipt$,
	scannedReceipts$,
	scannedReceiptJobId$,
	quickExpenseJobId$,
};
