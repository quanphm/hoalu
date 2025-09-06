import { useAtom, useSetAtom } from "jotai";
import { type PropsWithChildren, useEffect } from "react";

import { Dialog, DialogBackdrop, DialogPortal } from "@hoalu/ui/dialog";
import { currentDialogAtom, type DialogId, dialogStateAtom, wipeOutDialogsAtom } from "@/atoms";
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
	const [currentDialog, setCurrentDialog] = useAtom(currentDialogAtom);
	const wipeOutAllDialogs = useSetAtom(wipeOutDialogsAtom);
	const [open, setOpen] = useAtom(dialogStateAtom);

	useEffect(() => {
		if (!open) {
			// Backdrop doesn't unmount when set these directly in `onOpenChange` handler
			setCurrentDialog(null);
			wipeOutAllDialogs();
		}
	}, [open]);

	return (
		<>
			{props.children}

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogPortal>
					<DialogBackdrop />
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
