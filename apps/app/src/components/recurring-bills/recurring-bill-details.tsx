import { archiveRecurringBillDialogAtom } from "#app/atoms/index.ts";
import { EditRecurringBillForm } from "#app/components/recurring-bills/recurring-bill-actions.tsx";
import {
	type SyncedRecurringBill,
	useLiveQueryRecurringBills,
	useSelectedRecurringBill,
} from "#app/components/recurring-bills/use-recurring-bills.ts";
import { Trash2Icon } from "@hoalu/icons/lucide";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useSetAtom } from "jotai";

function BillDetailsHeader({ bill, onClose }: { bill: SyncedRecurringBill; onClose: () => void }) {
	const setArchiveDialog = useSetAtom(archiveRecurringBillDialogAtom);

	return (
		<div
			data-slot="recurring-bill-details-actions"
			className="bg-card sticky top-0 z-10 flex justify-between border-b px-4 py-2"
		>
			<div>&nbsp;</div>
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
						<Trash2Icon className="size-4" />
					</TooltipTrigger>
					<TooltipContent side="bottom">Archive</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger render={<Button size="icon" variant="ghost" onClick={onClose} />}>
						<XIcon className="size-4" />
					</TooltipTrigger>
					<TooltipContent side="bottom">Close</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
}

export function RecurringBillDetails() {
	const bills = useLiveQueryRecurringBills();
	const { bill: selected, onSelectBill } = useSelectedRecurringBill();

	const currentBill: SyncedRecurringBill | undefined = bills.find((b) => b.id === selected.id);

	return (
		<div className="bg-card text-card-foreground flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 p-0">
			{currentBill ? (
				<>
					<BillDetailsHeader bill={currentBill} onClose={() => onSelectBill(null)} />
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
