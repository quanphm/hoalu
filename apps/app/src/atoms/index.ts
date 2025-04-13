import type { ExpenseFormSchema } from "@/lib/schema";
import { type PrimitiveAtom, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

interface Dialog {
	id: string;
	isOpen: boolean;
}

export const dialogsAtom = atom<PrimitiveAtom<Dialog>[]>([]);

export const openedDialogsAtom = atom((get) => {
	const dialogs = get(dialogsAtom);
	return dialogs.filter((dialogAtom) => get(dialogAtom).isOpen);
});

function createDialogAtom(id: string) {
	const basedAtom = atom(
		(get) => {
			const dialogs = get(dialogsAtom);
			const dialogAtomById = dialogs.find((dialogAtom) => get(dialogAtom).id === id);
			return dialogAtomById ? get(dialogAtomById) : { id, isOpen: false };
		},
		(get, set, value: boolean) => {
			const dialogs = get(dialogsAtom);
			const dialogAtomById = dialogs.find((dialogAtom) => get(dialogAtom).id === id);
			if (!dialogAtomById) {
				set(dialogsAtom, (dialogs) => [...dialogs, atom<Dialog>({ id, isOpen: value })]);
			} else {
				set(dialogAtomById, (dialog) => ({
					...dialog,
					isOpen: value,
				}));
			}
		},
	);
	return basedAtom;
}

export const createExpenseDialogOpenAtom = createDialogAtom("create-expense");
export const createWalletDialogOpenAtom = createDialogAtom("create-wallet");
export const createCategoryDialogOpenAtom = createDialogAtom("create-category");

export const selectedCategoryAtom = atom<{ id: string | undefined; name: string | undefined }>({
	id: undefined,
	name: undefined,
});

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
};

export const draftExpenseAtom = atomWithStorage("draft-expense", basedExpense);
export const selectedExpenseAtom = atom(basedExpense);
