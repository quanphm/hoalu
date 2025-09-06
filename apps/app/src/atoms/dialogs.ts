import { atom, type PrimitiveAtom } from "jotai";

const DIALOG_ID = [
	// workspace
	"create-workspace",
	"delete-workspace",

	// expense
	"create-expense",
	"edit-expense",
	"delete-expense",

	// wallet
	"create-wallet",
	"edit-wallet",
	"delete-wallet",

	// category
	"create-category",
	"delete-category",
] as const;
export type DialogId = (typeof DIALOG_ID)[number];

interface DialogData {
	id: DialogId;
	data: Record<string, any> | undefined;
}

interface ManagerAtom {
	currentId: DialogId | null;
	dialogs: PrimitiveAtom<DialogData>[];
}

const managerAtom = atom<ManagerAtom>({
	currentId: null,
	dialogs: [],
});

export const currentDialogAtom = atom(
	(get) => {
		const { currentId, dialogs } = get(managerAtom);
		if (!currentId) {
			return null;
		}
		const currentDialog = dialogs.find((dialog) => get(dialog).id === currentId);
		return currentDialog ? get(currentDialog) : null;
	},
	(_get, set, id: DialogId | null) => {
		set(managerAtom, (state) => ({
			...state,
			currentId: id,
		}));
	},
);

const dialogsAtom = atom((get) => get(managerAtom).dialogs);

export const isOpeningDialogsAtom = atom((get) => get(dialogsAtom).length > 0);

function createDialogAtom(id: DialogId) {
	const basedAtom = atom(
		(get) => {
			const dialogs = get(dialogsAtom);
			const dialogAtomById = dialogs.find((dialogAtom) => get(dialogAtom).id === id);
			return dialogAtomById ? get(dialogAtomById) : null;
		},
		(get, set, action: { state: boolean; data?: Record<string, any> }) => {
			if (!action.state) {
				set(managerAtom, (state) => ({
					currentId: state.currentId === id ? null : state.currentId,
					dialogs: state.dialogs.filter((dialogAtom) => get(dialogAtom).id !== id),
				}));
			} else {
				set(managerAtom, (state) => {
					const filteredDialogs = state.dialogs.filter((atom) => get(atom).id !== id);
					return {
						currentId: id,
						dialogs: [...filteredDialogs, atom({ id, data: action.data })],
					};
				});
			}
		},
	);
	return basedAtom;
}

export const createWorkspaceDialogAtom = createDialogAtom("create-workspace");
export const deleteWorkspaceDialogAtom = createDialogAtom("delete-workspace");

export const createExpenseDialogAtom = createDialogAtom("create-expense");
export const deleteExpenseDialogAtom = createDialogAtom("delete-expense");

export const createWalletDialogAtom = createDialogAtom("create-wallet");
export const deleteWalletDialogAtom = createDialogAtom("delete-wallet");

export const createCategoryDialogAtom = createDialogAtom("create-category");
export const deleteCategoryDialogAtom = createDialogAtom("delete-category");
