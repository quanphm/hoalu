import {
	DeleteExpense,
	DuplicateExpense,
	EditExpenseForm,
} from "#app/components/expenses/expense-actions.tsx";
import { useExpenseNavigation } from "#app/components/expenses/use-expense-navigation.ts";
import { type SyncedExpense, useSelectedExpense } from "#app/components/expenses/use-expenses.ts";
import { HotKey } from "#app/components/hotkey.tsx";
import { ChevronDownIcon, ChevronUpIcon } from "@hoalu/icons/lucide";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@hoalu/ui/drawer";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";

interface ExpenseDetailsProps {
	expenses: SyncedExpense[];
}

export function ExpenseDetails({ expenses }: ExpenseDetailsProps) {
	const { expense: selectedRow, onSelectExpense } = useSelectedExpense();
	const { currentExpense, currentIndex, handleGoUp, handleGoDown, canGoUp, canGoDown } =
		useExpenseNavigation({
			expenses,
			selectedId: selectedRow.id,
			onSelectExpense,
		});

	return (
		<div className="bg-card text-card-foreground flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 p-0">
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
										disabled={!canGoDown}
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
									<Button size="icon" variant="outline" onClick={handleGoUp} disabled={!canGoUp} />
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
					<h2 className="bg-muted/50 text-muted-foreground m-4 rounded-md p-4 text-center">
						No expenses selected
					</h2>
				)}
			</div>
		</div>
	);
}

// Mobile full-screen expense details drawer
export function MobileExpenseDetails({ expenses }: ExpenseDetailsProps) {
	const { expense: selectedRow, onSelectExpense } = useSelectedExpense();
	const { currentExpense, handleGoUp, handleGoDown, canGoUp, canGoDown } = useExpenseNavigation({
		expenses,
		selectedId: selectedRow.id,
		onSelectExpense,
	});

	const isOpen = currentExpense !== undefined;

	function handleClose() {
		onSelectExpense(null);
	}

	return (
		<Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()} direction="bottom">
			<DrawerContent className="h-[95vh] max-h-[95vh]">
				<DrawerHeader className="flex flex-row items-center justify-between border-b">
					<DrawerTitle>Expense Details</DrawerTitle>
					<div className="flex items-center gap-2">
						<Button size="icon" variant="outline" onClick={handleGoUp} disabled={!canGoUp}>
							<ChevronUpIcon className="size-4" />
						</Button>
						<Button size="icon" variant="outline" onClick={handleGoDown} disabled={!canGoDown}>
							<ChevronDownIcon className="size-4" />
						</Button>
						{currentExpense && (
							<>
								<DuplicateExpense data={currentExpense} />
								<DeleteExpense id={currentExpense.id} />
							</>
						)}
						<DrawerClose asChild>
							<Button size="icon" variant="ghost">
								<XIcon className="size-4" />
							</Button>
						</DrawerClose>
					</div>
				</DrawerHeader>
				<ScrollArea className="flex-1 overflow-auto">
					{currentExpense && <EditExpenseForm key={currentExpense.id} data={currentExpense} />}
				</ScrollArea>
			</DrawerContent>
		</Drawer>
	);
}
