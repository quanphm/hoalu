import type { ExpenseFormSchema } from "#app/lib/schema.ts";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

/**
 * Holds the original high-res receipt files captured during OCR scan.
 * Written by ReceiptReview when user approves, cleared by CreateExpenseForm after upload.
 * Stored in memory only (File objects are not serialisable to localStorage).
 * Supports multiple files when the user scans multiple attachments at once.
 */
const scannedReceiptsAtom = atom<File[]>([]);

/**
 * @deprecated Use scannedReceiptsAtom instead.
 * Kept for backward compatibility — resolves to the first file in scannedReceiptsAtom.
 */
const scannedReceiptAtom = atom<File | null>(null);

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

/**
 * Tracks the receipt scan queue job ID that produced the current draft expense.
 * Written by ScanQueueReviewDialogContent when the user proceeds to create an expense.
 * Read and cleared by CreateExpenseForm after the expense is successfully created,
 * so the originating scan job is removed from the queue automatically.
 * In-memory only — no persistence needed (transient handoff between two dialogs).
 */
const scannedReceiptJobIdAtom = atom<string | null>(null);

export { draftExpenseAtom, selectedExpenseAtom, logPaymentAtom, scannedReceiptAtom, scannedReceiptsAtom, scannedReceiptJobIdAtom };
