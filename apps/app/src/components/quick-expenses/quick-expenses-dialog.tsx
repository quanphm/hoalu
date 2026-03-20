import { createExpenseDialogAtom, quickExpenseDialogAtom } from "#app/atoms/dialogs.ts";
import { draftExpenseAtom } from "#app/atoms/expenses.ts";
import { QuickExpensesForm } from "#app/components/quick-expenses/quick-expenses-form.tsx";
import { ZapIcon } from "@hoalu/icons/lucide";
import { Button, type ButtonProps } from "@hoalu/ui/button";
import { DialogDescription, DialogHeader, DialogPopup, DialogTitle } from "@hoalu/ui/dialog";
import { useSetAtom } from "jotai";

export function QuickExpensesDialogTrigger(props: ButtonProps) {
	const setQuickDialog = useSetAtom(quickExpenseDialogAtom);

	return (
		<Button variant="outline" {...props} onClick={() => setQuickDialog({ state: true })}>
			<ZapIcon />
			Quick add
		</Button>
	);
}

export function QuickExpensesDialogContent() {
	const setQuickDialog = useSetAtom(quickExpenseDialogAtom);
	const setCreateDialog = useSetAtom(createExpenseDialogAtom);
	const setDraft = useSetAtom(draftExpenseAtom);

	const handleParsed = (data: Parameters<typeof setDraft>[0]) => {
		setDraft(data);
		setQuickDialog({ state: false });
		setCreateDialog({ state: true });
	};

	return (
		<DialogPopup className="max-h-[92vh] overflow-y-scroll sm:max-w-[500px]">
			<DialogHeader>
				<DialogTitle>Create expense</DialogTitle>
				<DialogDescription>Describe your expense.</DialogDescription>
			</DialogHeader>
			<QuickExpensesForm onParsed={handleParsed} />
		</DialogPopup>
	);
}
