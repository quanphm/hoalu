import { useAtom } from "jotai";
import type { PropsWithChildren } from "react";

import { Dialog, DialogContent } from "@hoalu/ui/dialog";
import { currentDialogAtom, type DialogId } from "@/atoms";
import { CreateCategoryDialogContent } from "../category-actions";
import { CreateExpenseDialogContent } from "../expenses/expense-actions";
import { CreateWalletDialogContent } from "../wallets/wallet-actions";

export function DialogProvider(props: PropsWithChildren) {
	const [currentDialog, setCurrentDialog] = useAtom(currentDialogAtom);
	const open = !!currentDialog;

	return (
		<Dialog open={open} onOpenChange={() => setCurrentDialog(null)}>
			{props.children}
			{currentDialog && <Content id={currentDialog.id} />}
		</Dialog>
	);
}

function Content(props: { id: DialogId }) {
	switch (props.id) {
		case "create-expense":
			return <CreateExpenseDialogContent />;
		case "create-category":
			return <CreateCategoryDialogContent />;
		case "create-wallet":
			return <CreateWalletDialogContent />;
		default:
			return <DialogContent>Dialog does not exist</DialogContent>;
	}
}
