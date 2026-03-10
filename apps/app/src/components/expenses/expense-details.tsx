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
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, RepeatIcon, Trash2Icon } from "@hoalu/icons/lucide";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@hoalu/ui/dialog";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";

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

	return (
		<div className="bg-card text-card-foreground flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 p-0">
			{currentExpense && (
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
					<>
						{currentExpense.repeat !== "one-time" && !currentExpense.recurring_bill_id && (
							<SetUpRecurringBillPrompt expense={currentExpense} />
						)}
						<EditExpenseForm key={currentExpense.id} data={currentExpense} />
						<Suspense fallback={null}>
							<ReceiptPreview expenseId={currentExpense.id} />
						</Suspense>
					</>
				) : (
					<h2 className="bg-muted/50 text-muted-foreground m-4 rounded-md p-4 text-center">
						No expenses selected
					</h2>
				)}
			</div>
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

	function goTo(index: number) {
		setPreviewIndex((index + total) % total);
	}

	useEffect(() => {
		if (!open) return;
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "ArrowLeft") goTo((previewIndex ?? 0) - 1);
			if (e.key === "ArrowRight") goTo((previewIndex ?? 0) + 1);
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [open, previewIndex]);

	const current = previewIndex !== null ? files[previewIndex] : null;

	return (
		<>
			<div className="flex gap-3 overflow-x-auto pb-1">
				{files.map((file, index) => (
					<div key={file.id} className="group relative shrink-0">
						<button
							type="button"
							className="block cursor-pointer"
							onClick={() => setPreviewIndex(index)}
						>
							<img
								src={file.presignedUrl}
								alt="Attachment"
								className="h-24 w-auto rounded-md border object-cover"
							/>
						</button>
						<Button
							type="button"
							size="icon"
							variant="destructive"
							className="absolute top-1 right-1 hidden size-6 rounded-full group-hover:flex"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(file.id);
							}}
						>
							<XIcon className="size-4" />
						</Button>
					</div>
				))}
			</div>

			<Dialog open={open} onOpenChange={(o) => !o && setPreviewIndex(null)}>
				<DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
					{/* Header */}
					<div className="flex items-center px-6 pt-6 pb-4 pr-12">
						<h2 className="text-xl font-semibold leading-none">Attachment preview</h2>
					</div>

					{/* Image area — full width, no side padding */}
					<div className="relative flex items-center justify-center bg-black/90 min-h-[40vh]">
						{current && (
							<img
								key={current.presignedUrl}
								src={current.presignedUrl}
								alt="Attachment"
								className="max-h-[60vh] w-full object-contain"
							/>
						)}
						{total > 1 && (
							<>
								<Button
									type="button"
									size="icon"
									variant="ghost"
									className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60"
									onClick={() => goTo((previewIndex ?? 0) - 1)}
								>
									<ChevronLeftIcon className="size-5" />
								</Button>
								<Button
									type="button"
									size="icon"
									variant="ghost"
									className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60"
									onClick={() => goTo((previewIndex ?? 0) + 1)}
								>
									<ChevronRightIcon className="size-5" />
								</Button>
								<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
									{files.map((_, i) => (
										<button
											key={i}
											type="button"
											className={`size-1.5 rounded-full transition-colors ${i === previewIndex ? "bg-white" : "bg-white/40"}`}
											onClick={() => setPreviewIndex(i)}
										/>
									))}
								</div>
							</>
						)}
					</div>

					{/* Footer */}
					{current && (
						<div className="bg-muted/50 flex justify-end border-t px-6 py-4">
							<Button
								type="button"
								variant="destructive"
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
								<Trash2Icon className="size-4" />
								Delete
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
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
			<DialogContent className="flex max-h-[90dvh] flex-col gap-0 p-0" showCloseButton={false}>
				<DialogHeader className="flex flex-row items-center justify-between border-b px-4 py-2">
					<DialogTitle className="text-base font-semibold">Expense Details</DialogTitle>
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
						<DialogClose
							render={
								<Button size="icon" variant="ghost" aria-label="Close">
									<XIcon className="size-4" />
								</Button>
							}
						/>
					</div>
				</DialogHeader>
				<ScrollArea className="flex-1 overflow-auto">
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
