import { atom, type PrimitiveAtom } from "jotai";

const DIALOG_ID = [
	// workspace
	"create-workspace",
	"delete-workspace",

	// expense
	"create-expense",
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

interface DialogManagerAtom {
	currentId: DialogId | null;
	dialogs: PrimitiveAtom<DialogData>[];
}

export const dialogStateAtom = atom(false);

export const dialogManagerAtom = atom<DialogManagerAtom>({
	currentId: null,
	dialogs: [],
});

export const currentDialogAtom = atom(
	(get) => {
		const { currentId, dialogs } = get(dialogManagerAtom);
		if (!currentId) {
			return null;
		}
		const currentDialog = dialogs.find((dialog) => get(dialog).id === currentId);
		return currentDialog ? get(currentDialog) : null;
	},
	(_get, set, id: DialogId | null) => {
		set(dialogManagerAtom, (state) => ({
			...state,
			currentId: id,
		}));
	},
);

export const wipeOutDialogsAtom = atom(null, (_get, set) => {
	set(dialogManagerAtom, {
		currentId: null,
		dialogs: [],
	});
});

const dialogsAtom = atom((get) => get(dialogManagerAtom).dialogs);

type Action = { state: true; data?: Record<string, any> | undefined } | { state: false };

function createDialogAtom(id: DialogId) {
	const basedAtom = atom(
		(get) => {
			const dialogs = get(dialogsAtom);
			const dialogAtomById = dialogs.find((dialogAtom) => get(dialogAtom).id === id);
			return dialogAtomById ? get(dialogAtomById) : null;
		},
		(get, set, action: Action) => {
			set(dialogStateAtom, action.state);

			if (!action.state) {
				set(dialogManagerAtom, (state) => ({
					currentId: state.currentId === id ? null : state.currentId,
					dialogs: state.dialogs.filter((dialogAtom) => get(dialogAtom).id !== id),
				}));
			} else {
				set(dialogManagerAtom, (state) => {
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
export const editWalletDialogAtom = createDialogAtom("edit-wallet");
export const deleteWalletDialogAtom = createDialogAtom("delete-wallet");

export const createCategoryDialogAtom = createDialogAtom("create-category");
export const deleteCategoryDialogAtom = createDialogAtom("delete-category");
