import {
	ArchiveIcon,
	BoxArrowUpIcon,
	CaretDownIcon,
	CaretUpIcon,
	TrashIcon,
} from "@hoalu/icons/phosphor";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";

import {
	archiveRecurringBillDialog,
	deleteRecurringBillDialog,
	unarchiveRecurringBillDialog,
} from "#app/atoms/index.ts";
import { HotKey } from "#app/components/hotkey.tsx";
import { EditRecurringBillForm } from "#app/components/recurring-bills/recurring-bill-actions.tsx";
import { type SyncedAllRecurringBill } from "#app/components/recurring-bills/use-recurring-bills.ts";

interface RecurringBillDetailPanelProps {
	bill: SyncedAllRecurringBill;
	onClose: () => void;
	onGoUp: () => void;
	onGoDown: () => void;
	canGoUp: boolean;
	canGoDown: boolean;
}

export function RecurringBillDetailPanel({
	bill,
	onClose,
	onGoUp,
	onGoDown,
	canGoUp,
	canGoDown,
}: RecurringBillDetailPanelProps) {
	const setArchiveDialog = archiveRecurringBillDialog.set;
	const setUnarchiveDialog = unarchiveRecurringBillDialog.set;
	const setDeleteDialog = deleteRecurringBillDialog.set;

	const headerActions = (
		<>
			<Tooltip>
				<TooltipTrigger
					render={<Button size="icon-sm" variant="outline" onClick={onGoDown} disabled={!canGoDown} />}
				>
					<CaretDownIcon />
				</TooltipTrigger>
				<TooltipContent side="bottom">
					Down <HotKey className="ml-2" label="J" />
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger
					render={<Button size="icon-sm" variant="outline" onClick={onGoUp} disabled={!canGoUp} />}
				>
					<CaretUpIcon />
				</TooltipTrigger>
				<TooltipContent side="bottom">
					Up <HotKey className="ml-2" label="K" />
				</TooltipContent>
			</Tooltip>
			{bill.is_active ? (
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								size="icon-sm"
								variant="outline"
								aria-label="Archive bill"
								onClick={() => setArchiveDialog({ state: true, data: { id: bill.id } })}
							/>
						}
					>
						<ArchiveIcon />
					</TooltipTrigger>
					<TooltipContent side="bottom">Archive</TooltipContent>
				</Tooltip>
			) : (
				<>
					<Tooltip>
						<TooltipTrigger
							render={
								<Button
									size="icon-sm"
									variant="outline"
									aria-label="Restore bill"
									onClick={() => setUnarchiveDialog({ state: true, data: { id: bill.id } })}
								/>
							}
						>
							<BoxArrowUpIcon />
						</TooltipTrigger>
						<TooltipContent side="bottom">Restore</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger
							render={
								<Button
									size="icon-sm"
									variant="outline"
									aria-label="Delete bill"
									onClick={() =>
										setDeleteDialog({ state: true, data: { id: bill.id, title: bill.title } })
									}
								/>
							}
						>
							<TrashIcon />
						</TooltipTrigger>
						<TooltipContent side="bottom">Delete</TooltipContent>
					</Tooltip>
				</>
			)}
			<Tooltip>
				<TooltipTrigger render={<Button size="icon-sm" variant="outline" onClick={onClose} />}>
					<XIcon />
				</TooltipTrigger>
				<TooltipContent side="bottom">Close</TooltipContent>
			</Tooltip>
		</>
	);

	return (
		<div
			data-slot="recurring-bill-details"
			className="bg-card text-card-foreground h-[calc(100vh-94px)] overflow-auto"
		>
			<EditRecurringBillForm key={bill.id} bill={bill} headerActions={headerActions} />
		</div>
	);
}
