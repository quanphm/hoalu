import { HotKey } from "#app/components/hotkey.tsx";
import {
	DeleteIncome,
	DuplicateIncome,
	EditIncomeForm,
} from "#app/components/incomes/income-actions.tsx";
import { type SyncedIncome } from "#app/components/incomes/use-incomes.ts";
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
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";

interface IncomeDetailsPanelProps {
	currentIncome: SyncedIncome;
	onClose: () => void;
	onGoUp: () => void;
	onGoDown: () => void;
	canGoUp: boolean;
	canGoDown: boolean;
}

export function IncomeDetailsPanel({
	currentIncome,
	onClose,
	onGoUp,
	onGoDown,
	canGoUp,
	canGoDown,
}: IncomeDetailsPanelProps) {
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
								<Button size="icon" variant="outline" onClick={onGoDown} disabled={!canGoDown} />
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
							render={<Button size="icon" variant="outline" onClick={onGoUp} disabled={!canGoUp} />}
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
						<TooltipTrigger render={<Button size="icon" variant="outline" onClick={onClose} />}>
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

export function MobileIncomeDetailsPanel({
	currentIncome,
	onClose,
	onGoUp,
	onGoDown,
	canGoUp,
	canGoDown,
}: IncomeDetailsPanelProps) {
	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Income Details</DialogTitle>
					<DialogHeaderAction>
						<Button size="icon-sm" variant="outline" onClick={onGoUp} disabled={!canGoUp}>
							<ChevronUpIcon />
						</Button>
						<Button size="icon-sm" variant="outline" onClick={onGoDown} disabled={!canGoDown}>
							<ChevronDownIcon />
						</Button>
					</DialogHeaderAction>
				</DialogHeader>
				<ScrollArea className="max-h-[90vh]">
					<EditIncomeForm key={currentIncome.id} data={currentIncome} />
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
