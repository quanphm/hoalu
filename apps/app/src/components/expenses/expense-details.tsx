import { useAtomValue } from "jotai";

import { ChevronDown, ChevronUpIcon, XIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { selectedExpenseAtom } from "@/atoms";
import { DeleteExpense, EditExpenseForm } from "@/components/expenses/expense-actions";
import { useExpenses } from "@/hooks/use-expenses";

export function ExpenseDetails() {
	const selectedRow = useAtomValue(selectedExpenseAtom);
	const { data: expenses, currentIndex, onSelectExpense } = useExpenses();

	function handleGoUp() {
		const prevIndex = currentIndex - 1;
		const prevRowData = expenses[prevIndex];
		if (!prevRowData) return;
		onSelectExpense(prevRowData.id);
	}

	function handleGoDown() {
		const nextIndex = currentIndex + 1;
		const nextRowData = expenses[nextIndex];
		if (!nextRowData) return;
		onSelectExpense(nextRowData.id);
	}

	return (
		<div className="flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 bg-card p-0 text-card-foreground">
			{selectedRow.id && (
				<div
					data-slot="expense-details-actions"
					className="flex justify-between border-b px-4 py-2"
				>
					<div className="flex items-center justify-center gap-2">
						<Button size="icon" variant="outline" onClick={handleGoUp}>
							<ChevronUpIcon className="size-4" />
						</Button>
						<Button size="icon" variant="outline" onClick={handleGoDown}>
							<ChevronDown className="size-4" />
						</Button>
					</div>
					<div className="flex items-center justify-center gap-2">
						<DeleteExpense id={selectedRow.id} />
						<Button size="icon" variant="ghost" onClick={() => onSelectExpense(null)}>
							<XIcon className="size-4" />
						</Button>
					</div>
				</div>
			)}
			<div data-slot="expense-details-form">
				{selectedRow.id && <EditExpenseForm id={selectedRow.id} />}
				{!selectedRow.id && (
					<h2 className="m-4 rounded-md bg-muted/50 p-4 text-center text-muted-foreground">
						No expenses selected
					</h2>
				)}
			</div>
		</div>
	);
}
