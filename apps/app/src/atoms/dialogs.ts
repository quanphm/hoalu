import { observable } from "@legendapp/state";

const DIALOG_ID = [
	// workspace
	"create-workspace",
	"delete-workspace",

	// expense
	"create-expense",
	"delete-expense",
	"scan-receipt",
	"scan-queue-review",
	"quick-expense",

	// wallet
	"create-wallet",
	"edit-wallet",
	"delete-wallet",

	// category
	"create-category",
	"delete-category",

	// recurring bill
	"create-recurring-bill",
	"archive-recurring-bill",
	"unarchive-recurring-bill",
	"delete-recurring-bill",

	// income
	"create-income",
	"delete-income",

	// event
	"create-event",
	"edit-event",
	"delete-event",
] as const;
export type DialogId = (typeof DIALOG_ID)[number];

type DialogData = { id: DialogId; data: Record<string, any> | undefined };

interface DialogState {
	currentId: DialogId | null;
	data: Record<string, any> | undefined;
	open: boolean;
}

/**
 * Single source of truth for the app's modal dialog. Only one dialog is open
 * at a time, identified by `currentId`, with its optional `data` payload.
 */
export const dialog$ = observable<DialogState>({
	currentId: null,
	data: undefined,
	open: false,
});

/**
 * The currently active dialog ({ id, data }) or null. Drives DialogProvider.
 */
export const currentDialog$ = observable<DialogData | null>(() => {
	const currentId = dialog$.currentId.get();
	return currentId ? { id: currentId, data: dialog$.data.get() } : null;
});

/**
 * Close any open dialog and clear its state.
 */
export function wipeOutDialogs() {
	dialog$.set({ currentId: null, data: undefined, open: false });
}

type Action = { state: true; data?: Record<string, any> | undefined } | { state: false };

/**
 * Creates a controller for a single dialog id:
 * - `$`  a computed observable resolving to { id, data } when this dialog is
 *        active, otherwise null (read it in components with `useValue`).
 * - `set` open/close this dialog, mirroring the previous atom write API
 *        (`{ state: true, data }` / `{ state: false }`).
 */
function createDialog(id: DialogId) {
	return {
		$: observable<DialogData | null>(() =>
			dialog$.currentId.get() === id ? { id, data: dialog$.data.get() } : null,
		),
		set: (action: Action) => {
			if (action.state) {
				dialog$.set({ currentId: id, data: action.data, open: true });
			} else {
				dialog$.set({ currentId: null, data: undefined, open: false });
			}
		},
	};
}

export const createWorkspaceDialog = createDialog("create-workspace");
export const deleteWorkspaceDialog = createDialog("delete-workspace");

export const createExpenseDialog = createDialog("create-expense");
export const deleteExpenseDialog = createDialog("delete-expense");
export const scanReceiptDialog = createDialog("scan-receipt");

export const createWalletDialog = createDialog("create-wallet");
export const editWalletDialog = createDialog("edit-wallet");
export const deleteWalletDialog = createDialog("delete-wallet");

export const createCategoryDialog = createDialog("create-category");
export const deleteCategoryDialog = createDialog("delete-category");

export const createRecurringBillDialog = createDialog("create-recurring-bill");
export const archiveRecurringBillDialog = createDialog("archive-recurring-bill");
export const unarchiveRecurringBillDialog = createDialog("unarchive-recurring-bill");
export const deleteRecurringBillDialog = createDialog("delete-recurring-bill");

export const scanQueueReviewDialog = createDialog("scan-queue-review");
export const quickExpenseDialog = createDialog("quick-expense");

export const createIncomeDialog = createDialog("create-income");
export const deleteIncomeDialog = createDialog("delete-income");

export const createEventDialog = createDialog("create-event");
export const editEventDialog = createDialog("edit-event");
export const deleteEventDialog = createDialog("delete-event");
