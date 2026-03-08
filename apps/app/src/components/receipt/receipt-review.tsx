import { createExpenseDialogAtom, scanReceiptDialogAtom } from "#app/atoms/dialogs.ts";
import { draftExpenseAtom, scannedReceiptAtom } from "#app/atoms/expenses.ts";
import type { ReceiptData } from "#app/hooks/use-receipt-scan.ts";
import { TransactionAmountInput } from "#app/components/forms/transaction-amount.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { categoriesQueryOptions } from "#app/services/query-options.ts";
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
	receiptData: ReceiptData;
	originalFile: File;
	compressedBase64: string;
	onBack: () => void;
}

export function ReceiptReview({
	receiptData,
	originalFile,
	compressedBase64,
	onBack,
}: ReceiptReviewProps) {
	const workspace = useWorkspace();
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(workspace.slug));
	const setDraftExpense = useSetAtom(draftExpenseAtom);
	const setScannedReceipt = useSetAtom(scannedReceiptAtom);
	const setCreateDialog = useSetAtom(createExpenseDialogAtom);
	const setScanDialog = useSetAtom(scanReceiptDialogAtom);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [title, setTitle] = useState(receiptData.merchantName);
	const [amount, setAmount] = useState(receiptData.amount);
	const [currency, setCurrency] = useState(receiptData.currency);
	const [date, setDate] = useState(receiptData.date);
	const [categoryId, setCategoryId] = useState<string>(receiptData.suggestedCategoryId || "");

	const handleAmountChange = (value: number) => setAmount(value);
	const handleCurrencyChange = (value: string) => setCurrency(value);

	const confidenceColor =
		receiptData.confidence >= 0.8 ? "green" : receiptData.confidence >= 0.5 ? "yellow" : "red";
	const confidenceLabel =
		receiptData.confidence >= 0.8 ? "High" : receiptData.confidence >= 0.5 ? "Medium" : "Low";

	const buildDescription = (): string => {
		const items = receiptData.items;
		if (!items || items.length === 0) return "";

		const lines = items
			.map((item) => {
				let line = item.name;
				if (item.quantity && item.quantity > 1) line += ` x${item.quantity}`;
				if (item.price != null) line += ` — ${currency} ${item.price.toFixed(2)}`;
				return `<li>${line}</li>`;
			})
			.join("");

		return `<ul>${lines}</ul>`;
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			setDraftExpense((draft) => ({
				...draft,
				title,
				description: buildDescription(),
				date: new Date(date).toISOString(),
				transaction: { value: amount, currency },
				categoryId: categoryId || "",
			}));

			// Store original file so CreateExpenseForm attaches it automatically
			setScannedReceipt(originalFile);

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
				<DialogTitle>Review Receipt</DialogTitle>
				<DialogDescription>
					Review the extracted data and make any corrections before creating the expense.
				</DialogDescription>
			</DialogHeader>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Image Preview */}
				<div className="space-y-2">
					<p className="text-sm font-medium">Receipt Image</p>
					<div className="border-muted overflow-hidden rounded-md border">
						<img src={compressedBase64} alt="Receipt" className="h-auto w-full" />
					</div>
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-sm">Confidence:</span>
						<span
							className={cn(
								"rounded-full px-2 py-0.5 text-xs font-medium",
								confidenceColor === "green" && "bg-green-100 text-green-700",
								confidenceColor === "yellow" && "bg-yellow-100 text-yellow-700",
								confidenceColor === "red" && "bg-red-100 text-red-700",
							)}
						>
							{confidenceLabel} ({(receiptData.confidence * 100).toFixed(0)}%)
						</span>
					</div>
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
							onValueChange={handleAmountChange}
							onCurrencyChange={handleCurrencyChange}
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

					{receiptData.items && receiptData.items.length > 0 && (
						<div className="space-y-2">
							<p className="text-sm font-medium">Line Items</p>
							<div className="bg-muted/50 space-y-1 rounded-md p-3 text-xs">
								{receiptData.items.map((item, idx) => (
									<div key={idx} className="flex justify-between">
										<span>
											{item.name}
											{item.quantity && ` x${item.quantity}`}
										</span>
										{item.price && (
											<span>
												{currency} {item.price.toFixed(2)}
											</span>
										)}
									</div>
								))}
							</div>
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
