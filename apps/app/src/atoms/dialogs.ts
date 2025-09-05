import { atom, type PrimitiveAtom } from "jotai";

const DIALOG_ID = ["create-expense", "create-wallet", "create-category"] as const;
export type DialogId = (typeof DIALOG_ID)[number];

interface DialogData {
	id: DialogId;
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

function createDialogAtom(id: DialogId) {
	const basedAtom = atom(
		(get) => {
			const dialogs = get(dialogsAtom);
			const dialogAtomById = dialogs.find((dialogAtom) => get(dialogAtom).id === id);
			return dialogAtomById ? get(dialogAtomById) : null;
		},
		(get, set, state: boolean) => {
			const dialogs = get(dialogsAtom);

			if (!state) {
				set(managerAtom, (state) => ({
					...state,
					currentId: state.currentId === id ? null : state.currentId,
				}));
			} else {
				const dialogAtomById = dialogs.find((dialogAtom) => get(dialogAtom).id === id);
				if (dialogAtomById) {
					set(managerAtom, (state) => ({
						...state,
						currentId: id,
					}));
				} else {
					set(managerAtom, (state) => ({
						currentId: id,
						dialogs: [...state.dialogs, atom({ id })],
					}));
				}
			}
		},
	);
	return basedAtom;
}
export const createExpenseDialogOpenAtom = createDialogAtom("create-expense");
export const createWalletDialogOpenAtom = createDialogAtom("create-wallet");
export const createCategoryDialogOpenAtom = createDialogAtom("create-category");

export const isOpeningDialogsAtom = atom((get) => get(dialogsAtom).length > 0);
