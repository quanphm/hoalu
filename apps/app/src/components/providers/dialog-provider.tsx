import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { PropsWithChildren } from "react";

import { Dialog, DialogBackdrop, DialogPortal } from "@hoalu/ui/dialog";

import {
	currentDialogAtom,
	type DialogId,
	dialogStateAtom,
	wipeOutDialogsAtom,
} from "#app/atoms/index.ts";
import { CreateCategoryDialogContent, DeleteCategoryDialogContent } from "../category-actions";
import {
	CreateExpenseDialogContent,
	DeleteExpenseDialogContent,
} from "../expenses/expense-actions";
import {
	CreateWalletDialogContent,
	DeleteWalletDialogContent,
	EditWalletDialogContent,
} from "../wallets/wallet-actions";
import { CreateWorkspaceDialogContent, DeleteWorkspaceDialogContent } from "../workspace";

export function DialogProvider(props: PropsWithChildren) {
	const [open, setOpen] = useAtom(dialogStateAtom);
	const currentDialog = useAtomValue(currentDialogAtom);
	const wipeOutAllDialogs = useSetAtom(wipeOutDialogsAtom);

	const handleOpenChange = (open: boolean) => {
		setOpen(open);
		if (!open) {
			wipeOutAllDialogs();
		}
	};

	return (
		<>
			{props.children}

			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogPortal>
					{open && <DialogBackdrop />}
					{currentDialog && <Content id={currentDialog.id} />}
				</DialogPortal>
			</Dialog>
		</>
	);
}

function Content(props: { id: DialogId }) {
	switch (props.id) {
		case "create-workspace":
			return <CreateWorkspaceDialogContent />;
		case "delete-workspace":
			return <DeleteWorkspaceDialogContent />;

		case "create-expense":
			return <CreateExpenseDialogContent />;
		case "delete-expense":
			return <DeleteExpenseDialogContent />;

		case "create-wallet":
			return <CreateWalletDialogContent />;
		case "edit-wallet":
			return <EditWalletDialogContent />;
		case "delete-wallet":
			return <DeleteWalletDialogContent />;

		case "create-category":
			return <CreateCategoryDialogContent />;
		case "delete-category":
			return <DeleteCategoryDialogContent />;

		default:
			return "Not supported dialog";
	}
}
