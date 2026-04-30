import { HotKey } from "#app/components/hotkey.tsx";
import { useIncomeNavigation } from "#app/components/incomes/use-income-navigation.ts";
import { type SyncedIncome, useSelectedIncome } from "#app/components/incomes/use-incomes.ts";
import { ChevronDownIcon, ChevronUpIcon } from "@hoalu/icons/lucide";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogHeaderAction,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { Empty, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";

import { DeleteIncome, DuplicateIncome, EditIncomeForm } from "./income-actions";

interface IncomeDetailsProps {
	incomes: SyncedIncome[];
}

export function IncomeDetails({ incomes }: IncomeDetailsProps) {
	const { income: selectedRow, onSelectIncome } = useSelectedIncome();
	const { currentIncome, handleGoUp, handleGoDown, canGoUp, canGoDown } = useIncomeNavigation({
		incomes,
		selectedId: selectedRow.id,
		onSelectIncome,
	});

	if (!currentIncome) {
		return (
			<div className="flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 p-0">
				<Empty>
					<EmptyHeader>
						<EmptyTitle>Select an income to view details</EmptyTitle>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 p-0">
			<div
				data-slot="income-details-actions"
				className="bg-card sticky top-0 z-10 flex justify-between border-b px-4 py-2"
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
					<DuplicateIncome data={currentIncome} />
					<DeleteIncome id={currentIncome.id} />
					<Tooltip>
						<TooltipTrigger
							render={<Button size="icon" variant="outline" onClick={() => onSelectIncome(null)} />}
						>
							<XIcon className="size-4" />
						</TooltipTrigger>
						<TooltipContent side="bottom">Close</TooltipContent>
					</Tooltip>
				</div>
			</div>

			<div data-slot="income-details-form">
				<EditIncomeForm key={currentIncome.id} data={currentIncome} />
			</div>
		</div>
	);
}

export function MobileIncomeDetails({ incomes }: IncomeDetailsProps) {
	const { income: selectedRow, onSelectIncome } = useSelectedIncome();
	const { currentIncome, handleGoUp, handleGoDown, canGoUp, canGoDown } = useIncomeNavigation({
		incomes,
		selectedId: selectedRow.id,
		onSelectIncome,
	});

	const isOpen = !!currentIncome;

	function handleClose() {
		onSelectIncome(null);
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Income Details</DialogTitle>
					<DialogHeaderAction>
						<Button size="icon-sm" variant="outline" onClick={handleGoUp} disabled={!canGoUp}>
							<ChevronUpIcon />
						</Button>
						<Button size="icon-sm" variant="outline" onClick={handleGoDown} disabled={!canGoDown}>
							<ChevronDownIcon />
						</Button>
					</DialogHeaderAction>
				</DialogHeader>
				<ScrollArea className="max-h-[90vh]">
					{currentIncome && <EditIncomeForm key={currentIncome.id} data={currentIncome} />}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
