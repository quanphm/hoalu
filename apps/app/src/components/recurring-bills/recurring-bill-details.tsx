import {
	archiveRecurringBillDialogAtom,
	deleteRecurringBillDialogAtom,
	unarchiveRecurringBillDialogAtom,
} from "#app/atoms/index.ts";
import { HotKey } from "#app/components/hotkey.tsx";
import { EditRecurringBillForm } from "#app/components/recurring-bills/recurring-bill-actions.tsx";
import { type SyncedAllRecurringBill } from "#app/components/recurring-bills/use-recurring-bills.ts";
import { ArchiveIcon, ArchiveRestoreIcon, ChevronDownIcon, ChevronUpIcon, Trash2Icon } from "@hoalu/icons/lucide";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useSetAtom } from "jotai";

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
	const setArchiveDialog = useSetAtom(archiveRecurringBillDialogAtom);
	const setUnarchiveDialog = useSetAtom(unarchiveRecurringBillDialogAtom);
	const setDeleteDialog = useSetAtom(deleteRecurringBillDialogAtom);

	return (
		<div className="bg-card text-card-foreground flex h-[calc(100vh-94px)] flex-col overflow-auto">
			<div
				data-slot="recurring-bill-details-actions"
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
							render={
								<Button size="icon" variant="outline" onClick={onGoUp} disabled={!canGoUp} />
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
					{bill.is_active ? (
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										size="icon"
										variant="outline"
										aria-label="Archive bill"
										onClick={() => setArchiveDialog({ state: true, data: { id: bill.id } })}
									/>
								}
							>
								<ArchiveIcon className="size-4" />
							</TooltipTrigger>
							<TooltipContent side="bottom">Archive</TooltipContent>
						</Tooltip>
					) : (
						<>
							<Tooltip>
								<TooltipTrigger
									render={
										<Button
											size="icon"
											variant="outline"
											aria-label="Restore bill"
											onClick={() => setUnarchiveDialog({ state: true, data: { id: bill.id } })}
										/>
									}
								>
									<ArchiveRestoreIcon className="size-4" />
								</TooltipTrigger>
								<TooltipContent side="bottom">Restore</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger
									render={
										<Button
											size="icon"
											variant="outline"
											aria-label="Delete bill"
											onClick={() =>
												setDeleteDialog({ state: true, data: { id: bill.id, title: bill.title } })
											}
										/>
									}
								>
									<Trash2Icon className="size-4" />
								</TooltipTrigger>
								<TooltipContent side="bottom">Delete</TooltipContent>
							</Tooltip>
						</>
					)}
					<Tooltip>
						<TooltipTrigger render={<Button size="icon" variant="outline" onClick={onClose} />}>
							<XIcon className="size-4" />
						</TooltipTrigger>
						<TooltipContent side="bottom">Close</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<div data-slot="recurring-bill-details-form">
				<EditRecurringBillForm key={bill.id} bill={bill} />
			</div>
		</div>
	);
}
