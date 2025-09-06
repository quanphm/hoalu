import { useAtom } from "jotai";
import type { PropsWithChildren } from "react";

import { Dialog, DialogContent } from "@hoalu/ui/dialog";
import { currentDialogAtom, type DialogId } from "@/atoms";
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
	const open = !!currentDialog;

	return (
		<>
			{props.children}
			<Dialog open={open} onOpenChange={() => setCurrentDialog(null)}>
				{currentDialog && <Content id={currentDialog.id} />}
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
			return <DialogContent>Dialog does not exist</DialogContent>;
	}
}
