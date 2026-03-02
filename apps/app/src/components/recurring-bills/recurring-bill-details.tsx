import { archiveRecurringBillDialogAtom } from "#app/atoms/index.ts";
import { HotKey } from "#app/components/hotkey.tsx";
import { EditRecurringBillForm } from "#app/components/recurring-bills/recurring-bill-actions.tsx";
import { useRecurringBillNavigation } from "#app/components/recurring-bills/use-recurring-bill-navigation.ts";
import {
	type SyncedRecurringBill,
	useSortedRecurringBills,
	useSelectedRecurringBill,
} from "#app/components/recurring-bills/use-recurring-bills.ts";
import { ChevronDownIcon, ChevronUpIcon, ArchiveIcon } from "@hoalu/icons/lucide";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useSetAtom } from "jotai";

interface BillDetailsHeaderProps {
	bill: SyncedRecurringBill;
	bills: SyncedRecurringBill[];
	onSelectBill: (id: string | null) => void;
}

function BillDetailsHeader({ bill, bills, onSelectBill }: BillDetailsHeaderProps) {
	const setArchiveDialog = useSetAtom(archiveRecurringBillDialogAtom);
	const { handleGoUp, handleGoDown, canGoUp, canGoDown } = useRecurringBillNavigation({
		bills,
		selectedId: bill.id,
		onSelectBill,
	});

	return (
		<div
			data-slot="recurring-bill-details-actions"
			className="bg-card sticky top-0 z-10 flex justify-between border-b px-4 py-2"
		>
			<div className="flex items-center justify-center gap-2">
				<Tooltip>
					<TooltipTrigger
						render={
							<Button size="icon" variant="outline" onClick={handleGoDown} disabled={!canGoDown} />
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
			<div className="flex items-center gap-2">
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								size="icon"
								variant="ghost"
								aria-label="Archive bill"
								onClick={() => setArchiveDialog({ state: true, data: { id: bill.id } })}
							/>
						}
					>
						<ArchiveIcon className="size-4" />
					</TooltipTrigger>
					<TooltipContent side="bottom">Archive</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger
						render={<Button size="icon" variant="ghost" onClick={() => onSelectBill(null)} />}
					>
						<XIcon className="size-4" />
					</TooltipTrigger>
					<TooltipContent side="bottom">Close</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
}

export function RecurringBillDetails() {
	const bills = useSortedRecurringBills();
	const { bill: selected, onSelectBill } = useSelectedRecurringBill();

	const currentBill: SyncedRecurringBill | undefined = bills.find((b) => b.id === selected.id);

	return (
		<div className="bg-card text-card-foreground flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 p-0">
			{currentBill ? (
				<>
					<BillDetailsHeader bill={currentBill} bills={bills} onSelectBill={onSelectBill} />
					<div data-slot="recurring-bill-details-form">
						<EditRecurringBillForm key={currentBill.id} bill={currentBill} />
					</div>
				</>
			) : (
				<h2 className="bg-muted/50 text-muted-foreground m-4 rounded-md p-4 text-center">
					No bill selected
				</h2>
			)}
		</div>
	);
}
