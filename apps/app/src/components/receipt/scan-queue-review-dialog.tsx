import { useAtomValue, useSetAtom } from "jotai";
import { currentDialogAtom, createExpenseDialogAtom, scanQueueReviewDialogAtom } from "#app/atoms/dialogs.ts";
import { scannedReceiptsAtom, draftExpenseAtom } from "#app/atoms/expenses.ts";
import { receiptScanQueue } from "#app/lib/queues/receipt-scan-queue.ts";
import type { ReceiptData } from "#app/hooks/use-receipt-scan.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { categoriesQueryOptions } from "#app/services/query-options.ts";
import { TransactionAmountInput } from "#app/components/forms/transaction-amount.tsx";
import { zeroDecimalCurrencies } from "@hoalu/countries";
import { FileTextIcon, ChevronRightIcon, ChevronLeftIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogPopup } from "@hoalu/ui/dialog";
import { Input } from "@hoalu/ui/input";
import { Label } from "@hoalu/ui/label";
import { SelectNative } from "@hoalu/ui/select-native";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState, useCallback, useEffect } from "react";

function ConfidenceBadge({ confidence }: { confidence: number }) {
	const color = confidence >= 0.8 ? "green" : confidence >= 0.5 ? "yellow" : "red";
	const label = confidence >= 0.8 ? "High" : confidence >= 0.5 ? "Medium" : "Low";
	return (
		<span
			className={cn(
				"rounded-full px-2 py-0.5 text-xs font-medium",
				color === "green" && "bg-green-100 text-green-700",
				color === "yellow" && "bg-yellow-100 text-yellow-700",
				color === "red" && "bg-red-100 text-red-700",
			)}
		>
			{label} ({(confidence * 100).toFixed(0)}%)
		</span>
	);
}

function formatLineItemPrice(price: number, currencyCode: string): string {
	const fractionDigits = (zeroDecimalCurrencies as readonly string[]).includes(
		currencyCode.toUpperCase(),
	)
		? 0
		: 2;
	const formatted = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(price);
	return `${currencyCode} ${formatted}`;
}

function buildDescription(items: ReceiptData["items"], currency: string): string {
	if (!items || items.length === 0) return "";
	const listItems = items
		.map((item) => {
			const name = item.quantity && item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name;
			const price = item.price != null ? ` — ${formatLineItemPrice(item.price, currency)}` : "";
			return `<li>${name}${price}</li>`;
		})
		.join("");
	return `<ul>${listItems}</ul>`;
}

// Reconstruct File from base64 data URL
async function base64ToFile(base64: string, fileName: string, fileType: string): Promise<File> {
	// Extract the base64 data (remove data:...;base64, prefix)
	const base64Data = base64.split(",")[1];
	if (!base64Data) {
		throw new Error("Invalid base64 data");
	}

	// Decode base64 to binary - write directly to Uint8Array for efficiency
	const byteCharacters = atob(base64Data);
	const byteArray = new Uint8Array(byteCharacters.length);
	for (let i = 0; i < byteCharacters.length; i++) {
		byteArray[i] = byteCharacters.charCodeAt(i);
	}

	// Create Blob and File
	const blob = new Blob([byteArray], { type: fileType });
	return new File([blob], fileName, { type: fileType });
}

export function ScanQueueReviewDialogContent() {
	const currentDialog = useAtomValue(currentDialogAtom);
	const jobId = currentDialog?.data?.jobId as string | undefined;
	const queue = useAtomValue(receiptScanQueue.queueAtom);
	const workspace = useWorkspace();
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(workspace.slug));
	const setDraftExpense = useSetAtom(draftExpenseAtom);
	const setScannedReceipts = useSetAtom(scannedReceiptsAtom);
	const setCreateDialog = useSetAtom(createExpenseDialogAtom);
	const setReviewDialog = useSetAtom(scanQueueReviewDialogAtom);

	// Find current job and completed jobs
	const currentJob = useMemo(() => {
		return queue.find((j) => j.id === jobId && j.status === "completed") ?? null;
	}, [queue, jobId]);

	const completedJobs = useMemo(() => {
		return queue.filter((j) => j.status === "completed");
	}, [queue]);

	const currentIndex = useMemo(() => {
		if (!currentJob) return -1;
		return completedJobs.findIndex((j) => j.id === currentJob.id);
	}, [completedJobs, currentJob]);

	const hasNext = currentIndex < completedJobs.length - 1;
	const hasPrev = currentIndex > 0;

	// Form state - initialize from job data
	const jobData = currentJob?.result;
	const [title, setTitle] = useState(jobData?.merchantName ?? "");
	const [amount, setAmount] = useState(jobData?.amount ?? 0);
	const [currency, setCurrency] = useState(jobData?.currency ?? "");
	const [date, setDate] = useState(jobData?.date ?? "");
	const [categoryId, setCategoryId] = useState<string>(jobData?.suggestedCategoryId ?? "");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Reset form state when jobId changes
	useEffect(() => {
		if (jobData) {
			setTitle(jobData.merchantName ?? "");
			setAmount(jobData.amount ?? 0);
			setCurrency(jobData.currency ?? "");
			setDate(jobData.date ?? "");
			setCategoryId(jobData.suggestedCategoryId ?? "");
			setError(null);
		}
	}, [jobId, jobData]);

	// Navigation
	const handleNext = useCallback(() => {
		if (!hasNext) return;
		const nextJob = completedJobs[currentIndex + 1];
		if (nextJob) {
			setReviewDialog({ state: true, data: { jobId: nextJob.id } });
		}
	}, [hasNext, completedJobs, currentIndex, setReviewDialog]);

	const handlePrev = useCallback(() => {
		if (!hasPrev) return;
		const prevJob = completedJobs[currentIndex - 1];
		if (prevJob) {
			setReviewDialog({ state: true, data: { jobId: prevJob.id } });
		}
	}, [hasPrev, completedJobs, currentIndex, setReviewDialog]);

	// Handle create expense
	const handleCreateExpense = async () => {
		if (!currentJob) return;

		setIsSubmitting(true);
		setError(null);
		try {
			// Build description from line items
			const description = buildDescription(jobData?.items, currency);

			// Set draft expense data
			setDraftExpense((draft) => ({
				...draft,
				title,
				description,
				date: new Date(date).toISOString(),
				transaction: { value: amount, currency },
				categoryId: categoryId || "",
			}));

			// Reconstruct File from base64 and set as scanned receipt
			const file = await base64ToFile(
				currentJob.input.encodedBase64,
				currentJob.input.fileName,
				currentJob.input.fileType,
			);
			setScannedReceipts([file]);

			// Close review dialog and open create expense dialog
			setReviewDialog({ state: false });
			setCreateDialog({ state: true });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to process receipt");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!currentJob) {
		return (
			<DialogPopup className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Receipt Not Found</DialogTitle>
					<DialogDescription>
						The receipt you are trying to review is no longer available.
					</DialogDescription>
				</DialogHeader>
			</DialogPopup>
		);
	}

	const data = currentJob.result;

	return (
		<DialogPopup className="max-h-[92vh] overflow-y-scroll sm:max-w-[750px]">
			<DialogHeader>
				<div className="flex items-center justify-between">
					<DialogTitle>Review Receipt ({currentIndex + 1} of {completedJobs.length})</DialogTitle>
					{completedJobs.length > 1 && (
						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="icon"
								className="size-8"
								onClick={handlePrev}
								disabled={!hasPrev}
							>
								<ChevronLeftIcon className="size-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="size-8"
								onClick={handleNext}
								disabled={!hasNext}
							>
								<ChevronRightIcon className="size-4" />
							</Button>
						</div>
					)}
				</div>
				<DialogDescription>
					Review the extracted data and make any corrections before creating the expense.
				</DialogDescription>
			</DialogHeader>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Receipt preview */}
				<div className="space-y-2">
					<p className="text-sm font-medium">Receipt Image</p>
					<div className="border-muted overflow-hidden rounded-md border">
						{currentJob.input.previewBase64 ? (
							<img
								src={currentJob.input.previewBase64}
								alt={currentJob.input.fileName}
								className="h-auto w-full"
							/>
						) : (
							<div className="bg-muted flex aspect-[3/4] flex-col items-center justify-center gap-2">
								<FileTextIcon className="text-muted-foreground size-12" />
								<span className="text-muted-foreground max-w-[80%] truncate text-xs">
									{currentJob.input.fileName}
								</span>
							</div>
						)}
					</div>
					{data && (
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground text-sm">Confidence:</span>
							<ConfidenceBadge confidence={data.confidence} />
						</div>
					)}
					{!data && (
						<p className="text-muted-foreground text-xs">
							Could not extract data from this receipt.
						</p>
					)}
				</div>

				{/* Form fields */}
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Merchant Name</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Enter merchant name"
						/>
					</div>

					<div className="space-y-2">
						<Label>Amount</Label>
						<TransactionAmountInput
							value={amount}
							currency={currency}
							onValueChange={setAmount}
							onCurrencyChange={setCurrency}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="date">Date</Label>
						<Input
							id="date"
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="category">Category</Label>
						<SelectNative
							id="category"
							value={categoryId}
							onChange={(e) => setCategoryId(e.target.value)}
						>
							<option value="">None</option>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</SelectNative>
					</div>

					{data?.items && data.items.length > 0 && (
						<div className="space-y-2">
							<p className="text-sm font-medium">Line Items</p>
							<table className="w-full text-xs">
								<thead>
									<tr className="border-b">
										<th className="py-1 text-left font-medium">Item</th>
										<th className="py-1 text-right font-medium">Price</th>
									</tr>
								</thead>
								<tbody>
									{data.items.map((item, idx) => (
										<tr key={idx} className="border-b last:border-0">
											<td className="py-1 pr-4">
												{item.name}
												{item.quantity && item.quantity > 1 && (
													<span className="text-muted-foreground ml-1">x{item.quantity}</span>
												)}
											</td>
											<td className="py-1 text-right tabular-nums">
												{item.price != null ? formatLineItemPrice(item.price, currency) : "—"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{error && (
				<div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
					{error}
				</div>
			)}
			<DialogFooter>
				{hasNext ? (
					<>
						<Button variant="ghost" onClick={handleNext} disabled={isSubmitting}>
							Skip
						</Button>
						<Button onClick={handleCreateExpense} disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create Expense"}
						</Button>
					</>
				) : (
					<Button onClick={handleCreateExpense} disabled={isSubmitting}>
						{isSubmitting ? "Creating..." : "Create Expense"}
					</Button>
				)}
			</DialogFooter>
		</DialogPopup>
	);
}
