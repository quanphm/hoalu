import { createExpenseDialogAtom, scanReceiptDialogAtom } from "#app/atoms/dialogs.ts";
import { draftExpenseAtom, scannedReceiptsAtom } from "#app/atoms/expenses.ts";
import { TransactionAmountInput } from "#app/components/forms/transaction-amount.tsx";
import type { ReceiptData, ReceiptScanResult } from "#app/hooks/use-receipt-scan.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { categoriesQueryOptions } from "#app/services/query-options.ts";
import { zeroDecimalCurrencies } from "@hoalu/countries";
import { FileTextIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@hoalu/ui/dialog";
import { Input } from "@hoalu/ui/input";
import { Label } from "@hoalu/ui/label";
import { SelectNative } from "@hoalu/ui/select-native";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useState } from "react";

interface ReceiptReviewProps {
	results: ReceiptScanResult[];
	onBack: () => void;
}

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
			const name =
				item.quantity && item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name;
			const price = item.price != null ? ` — ${formatLineItemPrice(item.price, currency)}` : "";
			return `<li>${name}${price}</li>`;
		})
		.join("");
	return `<ul>${listItems}</ul>`;
}

export function ReceiptReview({ results, onBack }: ReceiptReviewProps) {
	const workspace = useWorkspace();
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(workspace.slug));
	const setDraftExpense = useSetAtom(draftExpenseAtom);
	const setScannedReceipts = useSetAtom(scannedReceiptsAtom);
	const setCreateDialog = useSetAtom(createExpenseDialogAtom);
	const setScanDialog = useSetAtom(scanReceiptDialogAtom);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Pick the result with the highest confidence as the initial active one
	const bestIdx = results.reduce((best, r, i) => {
		const bestConf = results[best]?.data?.confidence ?? -1;
		const currConf = r.data?.confidence ?? -1;
		return currConf > bestConf ? i : best;
	}, 0);

	const [activeIdx, setActiveIdx] = useState(bestIdx);
	const activeResult = results[activeIdx];
	const activeData = activeResult?.data;

	// Form fields — initialised from the best result's data
	const bestData = results[bestIdx]?.data;
	const [title, setTitle] = useState(bestData?.merchantName ?? "");
	const [amount, setAmount] = useState(bestData?.amount ?? 0);
	const [currency, setCurrency] = useState(bestData?.currency ?? "");
	const [date, setDate] = useState(bestData?.date ?? "");
	const [categoryId, setCategoryId] = useState<string>(bestData?.suggestedCategoryId ?? "");

	const successResults = results.filter((r) => r.data !== null);
	const failureCount = results.length - successResults.length;

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			// Merge line items from all successful scans into a single description
			const allItems = successResults.flatMap((r) => r.data?.items ?? []);
			const description = buildDescription(allItems, currency);

			setDraftExpense((draft) => ({
				...draft,
				title,
				description,
				date: new Date(date).toISOString(),
				transaction: { value: amount, currency },
				categoryId: categoryId || "",
			}));

			// Pass ALL original files as attachments (successes + failures)
			setScannedReceipts(results.map((r) => r.file));

			// Transition: close scan dialog → open create dialog
			setScanDialog({ state: false });
			setCreateDialog({ state: true });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>Review Receipt{results.length > 1 ? "s" : ""}</DialogTitle>
				<DialogDescription>
					{results.length > 1
						? `${successResults.length} of ${results.length} attachments were read successfully. Review the extracted data before creating the expense.`
						: "Review the extracted data and make any corrections before creating the expense."}
				</DialogDescription>
			</DialogHeader>

			{/* Attachment thumbnail strip — only shown for multi-file */}
			{results.length > 1 && (
				<div className="flex gap-2 overflow-x-auto pb-1">
					{results.map((r, idx) => (
						<button
							key={`${r.file.name}-${r.file.size}-${idx}`}
							type="button"
							onClick={() => setActiveIdx(idx)}
							className={cn(
								"relative flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors",
								idx === activeIdx
									? "border-primary"
									: "border-muted hover:border-muted-foreground/50",
								!r.data && "opacity-50",
							)}
						>
							<div className="size-16">
								{r.previewBase64 ? (
									<img
										src={r.previewBase64}
										alt={r.file.name}
										className="h-full w-full object-cover"
									/>
								) : (
									<div className="bg-muted flex h-full flex-col items-center justify-center gap-0.5 p-1">
										<FileTextIcon className="text-muted-foreground size-5" />
										<span className="text-muted-foreground line-clamp-2 max-w-full text-center text-[9px] leading-tight">
											{r.file.name}
										</span>
									</div>
								)}
							</div>
							{r.data && (
								<div className="absolute right-0 bottom-0 left-0 bg-black/40 px-1 py-0.5 text-center">
									<span className="text-[9px] font-medium text-white">
										{(r.data.confidence * 100).toFixed(0)}%
									</span>
								</div>
							)}
							{!r.data && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/30">
									<span className="text-[9px] font-semibold text-white">Failed</span>
								</div>
							)}
						</button>
					))}
				</div>
			)}

			{failureCount > 0 && (
				<p className="text-muted-foreground text-xs">
					{failureCount} attachment{failureCount > 1 ? "s" : ""} could not be read — still attached
					to the expense for manual reference.
				</p>
			)}

			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-2">
					<p className="text-sm font-medium">
						{results.length > 1
							? `Attachment ${activeIdx + 1} of ${results.length}`
							: "Receipt Image"}
					</p>
					<div className="border-muted overflow-hidden rounded-md border">
						{activeResult.previewBase64 ? (
							<img src={activeResult.previewBase64} alt="Receipt" className="h-auto w-full" />
						) : (
							<div className="bg-muted flex aspect-[3/4] flex-col items-center justify-center gap-2">
								<FileTextIcon className="text-muted-foreground size-12" />
								<span className="text-muted-foreground max-w-[80%] truncate text-xs">
									{activeResult.file.name}
								</span>
							</div>
						)}
					</div>
					{activeData && (
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground text-sm">Confidence:</span>
							<ConfidenceBadge confidence={activeData.confidence} />
						</div>
					)}
					{!activeData && (
						<p className="text-muted-foreground text-xs">
							Could not extract data from this attachment.
						</p>
					)}
				</div>

				{/* Form Fields */}
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
						<Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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

					{activeData?.items && activeData.items.length > 0 && (
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
									{activeData.items.map((item, idx) => (
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

			<DialogFooter>
				<Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
					Back
				</Button>
				<Button onClick={handleSubmit} disabled={isSubmitting}>
					{isSubmitting ? "Creating..." : "Create Expense"}
				</Button>
			</DialogFooter>
		</>
	);
}
