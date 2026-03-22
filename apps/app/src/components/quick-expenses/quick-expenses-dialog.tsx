import { quickExpenseDialogAtom } from "#app/atoms/dialogs.ts";
import { QuickExpensesForm } from "#app/components/quick-expenses/quick-expenses-form.tsx";
import { ZapIcon } from "@hoalu/icons/lucide";
import { Button, type ButtonProps } from "@hoalu/ui/button";
import { DialogHeader, DialogHeaderAction, DialogPopup, DialogTitle } from "@hoalu/ui/dialog";
import { useSetAtom } from "jotai";

export function QuickExpensesDialogTrigger(props: ButtonProps) {
	const setQuickDialog = useSetAtom(quickExpenseDialogAtom);

	return (
		<Button variant="outline" {...props} onClick={() => setQuickDialog({ state: true })}>
			<ZapIcon className="text-blue-600" />
			Quick add
		</Button>
	);
}

export function QuickExpensesDialogContent() {
	const setQuickDialog = useSetAtom(quickExpenseDialogAtom);

	const handleSubmitted = () => {
		setQuickDialog({ state: false });
	};

	return (
		<DialogPopup className="max-h-[92vh] overflow-y-scroll sm:max-w-[500px]">
			<DialogHeader>
				<DialogTitle>Create expense</DialogTitle>
				<DialogHeaderAction />
			</DialogHeader>
			<QuickExpensesForm onSubmitted={handleSubmitted} />
		</DialogPopup>
	);
}
