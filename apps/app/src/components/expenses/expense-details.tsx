import {
	DeleteExpense,
	DuplicateExpense,
	EditExpenseForm,
} from "#app/components/expenses/expense-actions.tsx";
import { useExpenseNavigation } from "#app/components/expenses/use-expense-navigation.ts";
import { type SyncedExpense, useSelectedExpense } from "#app/components/expenses/use-expenses.ts";
import { HotKey } from "#app/components/hotkey.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { useSetUpRecurringBill, useDeleteExpenseFile } from "#app/services/mutations.ts";
import { expenseFilesQueryOptions } from "#app/services/query-options.ts";
import {
	ChevronDownIcon,
	ChevronUpIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	RepeatIcon,
	Trash2Icon,
} from "@hoalu/icons/lucide";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogHeaderAction,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { Empty, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useEffectEvent, useState } from "react";

function SetUpRecurringBillPrompt({ expense }: { expense: SyncedExpense }) {
	const workspace = useWorkspace();
	const mutation = useSetUpRecurringBill();

	return (
		<div className="border-border bg-muted/40 mb-3 flex items-center gap-3 px-4 py-2">
			<RepeatIcon className="size-4 shrink-0" />
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium">Track future payments</p>
				<p className="text-muted-foreground text-sm">
					Link a recurring bill to project upcoming charges.
				</p>
			</div>
			<Button
				variant="outline"
				disabled={mutation.isPending}
				onClick={() =>
					mutation.mutate({
						payload: {
							id: expense.id,
							title: expense.title,
							amount: expense.amount,
							currency: expense.currency,
							repeat: expense.repeat,
							date: expense.date,
							walletId: expense.wallet.id,
							categoryId: expense.category?.id,
							workspaceId: workspace.id,
						},
					})
				}
			>
				{mutation.isPending ? "Setting up…" : "Set up"}
			</Button>
		</div>
	);
}

function ReceiptPreview({ expenseId }: { expenseId: string }) {
	const workspace = useWorkspace();
	const { data: files } = useSuspenseQuery(expenseFilesQueryOptions(workspace.slug, expenseId));
	const deleteMutation = useDeleteExpenseFile();

	if (!files || files.length === 0) {
		return null;
	}

	return (
		<div className="border-t p-4">
			<h4 className="mb-2 text-sm font-medium">Attachments</h4>
			<AttachmentStrip
				files={files}
				onDelete={(fileId) => {
					if (confirm("Delete this attachment?")) {
						deleteMutation.mutate({ expenseId, fileId });
					}
				}}
			/>
		</div>
	);
}

function AttachmentStrip({
	files,
	onDelete,
}: {
	files: { id: string; name: string; description: string | null; presignedUrl: string }[];
	onDelete: (fileId: string) => void;
}) {
	const [previewIndex, setPreviewIndex] = useState<number | null>(null);
	const open = previewIndex !== null;
	const total = files.length;

	const goTo = useEffectEvent((index: number) => {
		setPreviewIndex((index + total) % total);
	});

	useEffect(() => {
		if (!open) return;

		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "ArrowLeft") goTo((previewIndex ?? 0) - 1);
			if (e.key === "ArrowRight") goTo((previewIndex ?? 0) + 1);
		}

		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [open, previewIndex]);

	const current = previewIndex !== null ? files[previewIndex] : null;

	return (
		<>
			<div className="flex gap-3 overflow-x-auto pb-1">
				{files.map((file, index) => (
					<div key={file.id} className="bg-muted/50 group relative shrink-0">
						<button
							type="button"
							className="relative aspect-square w-full overflow-hidden rounded-md"
							onClick={() => setPreviewIndex(index)}
						>
							<img
								src={file.presignedUrl}
								alt="Attachment"
								className="h-24 w-auto rounded-md border object-cover"
							/>
						</button>
						<Button
							size="icon"
							variant="secondary"
							className="absolute top-1 right-1 flex size-6 items-center gap-2 rounded-full"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(file.id);
							}}
						>
							<XIcon />
						</Button>
					</div>
				))}
			</div>

			<Dialog open={open} onOpenChange={(o) => !o && setPreviewIndex(null)}>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Preview</DialogTitle>
						<DialogHeaderAction>
							{current && (
								<Button
									size="icon"
									variant="outline"
									onClick={() => {
										if (confirm("Delete this attachment?")) {
											const nextTotal = total - 1;
											if (nextTotal === 0) {
												setPreviewIndex(null);
											} else {
												setPreviewIndex((previewIndex ?? 0) % nextTotal);
											}
											onDelete(current.id);
										}
									}}
								>
									<Trash2Icon />
								</Button>
							)}
							{total > 1 && (
								<>
									<Button
										size="icon"
										variant="outline"
										onClick={() => goTo((previewIndex ?? 0) - 1)}
									>
										<ChevronLeftIcon className="size-5" />
									</Button>
									<Button
										size="icon"
										variant="outline"
										onClick={() => goTo((previewIndex ?? 0) + 1)}
									>
										<ChevronRightIcon className="size-5" />
									</Button>
								</>
							)}
						</DialogHeaderAction>
					</DialogHeader>
					<div className="relative flex min-h-[40vh] items-center justify-center bg-black/90">
						{current && (
							<img
								key={current.presignedUrl}
								src={current.presignedUrl}
								alt="Attachment"
								className="max-h-[60vh] w-full object-contain"
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

interface ExpenseDetailsProps {
	expenses: SyncedExpense[];
}

export function ExpenseDetails({ expenses }: ExpenseDetailsProps) {
	const { expense: selectedRow, onSelectExpense } = useSelectedExpense();
	const { currentExpense, handleGoUp, handleGoDown, canGoUp, canGoDown } = useExpenseNavigation({
		expenses,
		selectedId: selectedRow.id,
		onSelectExpense,
	});

	if (!currentExpense) {
		return (
			<div className="flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 p-0">
				<Empty>
					<EmptyHeader>
						<EmptyTitle>Select an expense to view details</EmptyTitle>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 p-0">
			<div
				data-slot="expense-details-actions"
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
					<DuplicateExpense data={currentExpense} />
					<DeleteExpense id={currentExpense.id} />
					<Tooltip>
						<TooltipTrigger
							render={
								<Button size="icon" variant="outline" onClick={() => onSelectExpense(null)} />
							}
						>
							<XIcon className="size-4" />
						</TooltipTrigger>
						<TooltipContent side="bottom">Close</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<div data-slot="expense-details-form">
				{currentExpense.repeat !== "one-time" && !currentExpense.recurring_bill_id && (
					<SetUpRecurringBillPrompt expense={currentExpense} />
				)}
				<EditExpenseForm key={currentExpense.id} data={currentExpense} />
				<Suspense fallback={null}>
					<ReceiptPreview expenseId={currentExpense.id} />
				</Suspense>
			</div>
		</div>
	);
}

export function MobileExpenseDetails({ expenses }: ExpenseDetailsProps) {
	const { expense: selectedRow, onSelectExpense } = useSelectedExpense();
	const { currentExpense, handleGoUp, handleGoDown, canGoUp, canGoDown } = useExpenseNavigation({
		expenses,
		selectedId: selectedRow.id,
		onSelectExpense,
	});

	const isOpen = !!currentExpense;

	function handleClose() {
		onSelectExpense(null);
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Expense Details</DialogTitle>
					<DialogHeaderAction>
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
					</DialogHeaderAction>
				</DialogHeader>
				<ScrollArea className="max-h-[90vh]">
					{currentExpense && (
						<>
							<EditExpenseForm key={currentExpense.id} data={currentExpense} />
							<Suspense fallback={null}>
								<ReceiptPreview expenseId={currentExpense.id} />
							</Suspense>
						</>
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
