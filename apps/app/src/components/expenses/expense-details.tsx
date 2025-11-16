import { ChevronDownIcon, ChevronUpIcon } from "@hoalu/icons/lucide";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";

import {
	DeleteExpense,
	DuplicateExpense,
	EditExpenseForm,
} from "#app/components/expenses/expense-actions.tsx";
import {
	type SyncedExpense,
	useLiveQueryExpenseById,
	useSelectedExpense,
} from "#app/components/expenses/use-expenses.ts";
import { HotKey } from "#app/components/hotkey.tsx";

interface ExpenseDetailsProps {
	expenses: SyncedExpense[];
}

export function ExpenseDetails({ expenses }: ExpenseDetailsProps) {
	const { expense: selectedRow, onSelectExpense } = useSelectedExpense();
	const currentExpense = useLiveQueryExpenseById(selectedRow.id);
	const currentIndex = expenses.findIndex((item) => item.id === selectedRow.id);
	console.log(currentExpense);

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
			{currentExpense && (
				<div
					data-slot="expense-details-actions"
					className="flex justify-between border-b px-4 py-2"
				>
					<div className="flex items-center justify-center gap-2">
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										size="icon"
										variant="outline"
										onClick={handleGoDown}
										disabled={currentIndex === -1 || currentIndex >= expenses.length - 1}
									/>
								}
							>
								<ChevronDownIcon className="size-4" />
							</TooltipTrigger>
							<TooltipContent side="bottom">
								Down <HotKey className="ml-2" label="J" />
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										size="icon"
										variant="outline"
										onClick={handleGoUp}
										disabled={currentIndex <= 0}
									/>
								}
							>
								<ChevronUpIcon className="size-4" />
							</TooltipTrigger>
							<TooltipContent side="bottom">
								Up <HotKey className="ml-2" label="K" />
							</TooltipContent>
						</Tooltip>
					</div>
					<div className="flex items-center justify-center gap-2">
						<DuplicateExpense data={currentExpense} />
						<DeleteExpense id={currentExpense.id} />
						<Tooltip>
							<TooltipTrigger
								render={
									<Button size="icon" variant="ghost" onClick={() => onSelectExpense(null)} />
								}
							>
								<XIcon className="size-4" />
							</TooltipTrigger>
							<TooltipContent side="bottom">Close</TooltipContent>
						</Tooltip>
					</div>
				</div>
			)}
			<div data-slot="expense-details-form">
				{currentExpense ? (
					<EditExpenseForm key={currentExpense.id} data={currentExpense} />
				) : (
					<h2 className="m-4 rounded-md bg-muted/50 p-4 text-center text-muted-foreground">
						No expenses selected
					</h2>
				)}
			</div>
		</div>
	);
}
