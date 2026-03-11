import { createExpenseDialogAtom, voiceExpenseDialogAtom } from "#app/atoms/dialogs.ts";
import { draftExpenseAtom } from "#app/atoms/expenses.ts";
import { TransactionAmountInput } from "#app/components/forms/transaction-amount.tsx";
import { categoriesQueryOptions } from "#app/services/query-options.ts";
import { type VoiceExpenseData, useParseVoiceExpense, useVoiceRecorder } from "#app/hooks/use-voice-expense.ts";
import { MicIcon, MicOffIcon, RotateCcwIcon } from "@hoalu/icons/lucide";
import { Button, type ButtonProps } from "@hoalu/ui/button";
import {
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { Input } from "@hoalu/ui/input";
import { Label } from "@hoalu/ui/label";
import { SelectNative } from "@hoalu/ui/select-native";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { useWorkspace } from "#app/hooks/use-workspace.ts";

export function VoiceExpenseDialogTrigger(props: ButtonProps) {
	const setVoiceDialog = useSetAtom(voiceExpenseDialogAtom);

	return (
		<Button variant="outline" {...props} onClick={() => setVoiceDialog({ state: true })}>
			<MicIcon className="mr-2 size-4" />
			Voice expense
		</Button>
	);
}

export function VoiceExpenseDialogContent() {
	const [voiceData, setVoiceData] = useState<VoiceExpenseData | null>(null);

	const handleParseSuccess = (data: VoiceExpenseData) => {
		setVoiceData(data);
	};

	const handleReset = () => {
		setVoiceData(null);
	};

	if (voiceData) {
		return (
			<DialogPopup className="max-h-[92vh] overflow-y-scroll sm:max-w-[600px]">
				<VoiceExpenseReview voiceData={voiceData} onBack={handleReset} />
			</DialogPopup>
		);
	}

	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Voice Expense</DialogTitle>
				<DialogDescription>
					Speak your expense and we'll fill in the details automatically.
				</DialogDescription>
			</DialogHeader>
			<VoiceRecorder onParseSuccess={handleParseSuccess} />
		</DialogPopup>
	);
}

function VoiceRecorder({ onParseSuccess }: { onParseSuccess: (data: VoiceExpenseData) => void }) {
	const { isListening, transcript, interimTranscript, error, isSupported, start, stop, reset } =
		useVoiceRecorder();
	const parseMutation = useParseVoiceExpense();
	const setVoiceDialog = useSetAtom(voiceExpenseDialogAtom);

	const displayText = transcript + (interimTranscript ? " " + interimTranscript : "");

	const handleParse = async () => {
		if (!transcript.trim()) return;
		const result = await parseMutation.mutateAsync(transcript.trim());
		if (result) {
			onParseSuccess(result);
		}
	};

	const handleReset = () => {
		reset();
		parseMutation.reset();
	};

	if (!isSupported) {
		return (
			<div className="flex flex-col items-center gap-4 py-8 text-center">
				<div className="bg-muted rounded-full p-4">
					<MicOffIcon className="text-muted-foreground size-8" />
				</div>
				<div>
					<p className="font-medium">Speech recognition not supported</p>
					<p className="text-muted-foreground mt-1 text-sm">
						Try Chrome, Edge, or Safari for voice input.
					</p>
				</div>
				<Button variant="outline" onClick={() => setVoiceDialog({ state: false })}>
					Close
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Mic button */}
			<div className="flex flex-col items-center gap-4 py-4">
				<button
					type="button"
					onClick={isListening ? stop : start}
					disabled={parseMutation.isPending}
					className={cn(
						"relative flex size-20 cursor-pointer items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
						isListening
							? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
							: "bg-primary text-primary-foreground hover:bg-primary/90",
						parseMutation.isPending && "cursor-not-allowed opacity-50",
					)}
					aria-label={isListening ? "Stop recording" : "Start recording"}
				>
					{isListening && (
						<span className="bg-destructive absolute inset-0 animate-ping rounded-full opacity-30" />
					)}
					{isListening ? (
						<MicOffIcon className="size-8" />
					) : (
						<MicIcon className="size-8" />
					)}
				</button>

				<p className="text-muted-foreground text-sm">
					{parseMutation.isPending
						? "Parsing your expense…"
						: isListening
							? "Listening… tap to stop"
							: transcript
								? "Tap to re-record"
								: "Tap to start speaking"}
				</p>
			</div>

			{/* Transcript display */}
			<div
				className={cn(
					"bg-muted min-h-[80px] rounded-lg p-4 text-sm transition-opacity",
					!displayText && "flex items-center justify-center",
					parseMutation.isPending && "opacity-50",
				)}
			>
				{displayText ? (
					<p>
						{transcript && <span>{transcript}</span>}
						{interimTranscript && (
							<span className="text-muted-foreground"> {interimTranscript}</span>
						)}
					</p>
				) : (
					<p className="text-muted-foreground italic">
						Try: "Spent 45 dollars on coffee" or "Grocery shopping 120 VND yesterday"
					</p>
				)}
			</div>

			{/* Error */}
			{(error || parseMutation.isError) && (
				<p className="text-destructive text-sm">
					{error ?? parseMutation.error?.message ?? "Something went wrong. Please try again."}
				</p>
			)}

			{/* Actions */}
			<DialogFooter>
				{transcript && !isListening && (
					<Button variant="ghost" size="sm" onClick={handleReset}>
						<RotateCcwIcon className="mr-1.5 size-3.5" />
						Reset
					</Button>
				)}
				<Button
					onClick={handleParse}
					disabled={!transcript.trim() || isListening || parseMutation.isPending}
				>
					{parseMutation.isPending ? "Parsing…" : "Parse expense"}
				</Button>
			</DialogFooter>
		</div>
	);
}

interface VoiceExpenseReviewProps {
	voiceData: VoiceExpenseData;
	onBack: () => void;
}

function VoiceExpenseReview({ voiceData, onBack }: VoiceExpenseReviewProps) {
	const workspace = useWorkspace();
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(workspace.slug));
	const setDraftExpense = useSetAtom(draftExpenseAtom);
	const setCreateDialog = useSetAtom(createExpenseDialogAtom);
	const setVoiceDialog = useSetAtom(voiceExpenseDialogAtom);

	const [title, setTitle] = useState(voiceData.title);
	const [amount, setAmount] = useState(voiceData.amount);
	const [currency, setCurrency] = useState(voiceData.currency);
	const [date, setDate] = useState(voiceData.date);
	const [categoryId, setCategoryId] = useState<string>(voiceData.suggestedCategoryId ?? "");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const confidenceColor =
		voiceData.confidence >= 0.8 ? "green" : voiceData.confidence >= 0.5 ? "yellow" : "red";
	const confidenceLabel =
		voiceData.confidence >= 0.8 ? "High" : voiceData.confidence >= 0.5 ? "Medium" : "Low";

	const handleConfirm = async () => {
		setIsSubmitting(true);
		try {
			setDraftExpense((draft) => ({
				...draft,
				title,
				date: new Date(date).toISOString(),
				transaction: { value: amount, currency },
				categoryId: categoryId || "",
				repeat: voiceData.repeat,
			}));

			// Transition: close voice dialog → open create dialog
			setVoiceDialog({ state: false });
			setCreateDialog({ state: true });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>Review Expense</DialogTitle>
				<DialogDescription>
					Review the parsed details and make any corrections before creating the expense.
				</DialogDescription>
			</DialogHeader>

			<div className="flex flex-col gap-4">
				{/* Confidence badge */}
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
						{confidenceLabel} ({(voiceData.confidence * 100).toFixed(0)}%)
					</span>
				</div>

				<div className="space-y-2">
					<Label htmlFor="voice-title">Title</Label>
					<Input
						id="voice-title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Expense title"
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
					<Label htmlFor="voice-date">Date</Label>
					<Input
						id="voice-date"
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="voice-category">Category</Label>
					<SelectNative
						id="voice-category"
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
			</div>

			<DialogFooter>
				<Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
					<RotateCcwIcon className="mr-1.5 size-3.5" />
					Re-record
				</Button>
				<Button onClick={handleConfirm} disabled={isSubmitting || !title.trim()}>
					{isSubmitting ? "Opening…" : "Create expense"}
				</Button>
			</DialogFooter>
		</>
	);
}
