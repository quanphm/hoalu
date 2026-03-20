import { useAppForm } from "#app/components/forms/index.tsx";
import { useParseQuickExpense } from "#app/services/mutations.ts";
import { datetime } from "@hoalu/common/datetime";
import { type RepeatSchema } from "@hoalu/common/schema";
import { DialogFooter } from "@hoalu/ui/dialog";
import { useState } from "react";
import * as z from "zod";

interface QuickParsedDraft {
	title: string;
	description: string;
	transaction: { value: number; currency: string };
	date: string;
	walletId: string;
	categoryId: string;
	repeat: RepeatSchema;
}

const QuickEntryFormSchema = z.object({
	text: z.string().min(1, "Please describe your expense"),
});

interface QuickExpensesFormProps {
	onParsed: (data: QuickParsedDraft) => void;
}

export function QuickExpensesForm({ onParsed }: QuickExpensesFormProps) {
	const mutation = useParseQuickExpense();
	const [parsedResult, setParsedResult] = useState<{
		title: string;
		amount: number;
		currency: string;
		date: string;
		suggestedCategoryId: string | null;
		repeat: string;
		confidence: number;
	} | null>(null);

	const form = useAppForm({
		defaultValues: {
			text: "",
		},
		validators: {
			onSubmit: QuickEntryFormSchema,
		},
		onSubmit: async ({ value }) => {
			mutation.reset();
			setParsedResult(null);

			const result = await mutation.mutateAsync({
				text: value.text.trim(),
			});
			if (result) {
				setParsedResult(result);
			}
		},
	});

	// const handleContinue = () => {
	// 	if (!parsedResult) return;

	// 	const draft: QuickParsedDraft = {
	// 		title: parsedResult.title,
	// 		description: "",
	// 		transaction: {
	// 			value: parsedResult.amount,
	// 			currency: parsedResult.currency,
	// 		},
	// 		date: new Date(parsedResult.date).toISOString(),
	// 		walletId: "",
	// 		categoryId: parsedResult.suggestedCategoryId ?? "",
	// 		repeat: parsedResult.repeat as QuickParsedDraft["repeat"],
	// 	};

	// 	onParsed(draft);
	// };

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField
					name="text"
					children={(field) => (
						<field.InputField
							placeholder="e.g. Coffee 15k yesterday, Cơm trưa 50k hôm qua"
							autoFocus
						/>
					)}
				/>

				{parsedResult && (
					<div className="bg-muted/50 space-y-4 rounded-lg border p-4">
						<div className="flex items-center justify-between">
							<h4 className="text-sm font-medium">Parsed Result</h4>
						</div>

						<div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
							<div>
								<p className="text-muted-foreground">Title</p>
								<p className="font-medium">{parsedResult.title}</p>
							</div>
							<div>
								<p className="text-muted-foreground">Amount</p>
								<p className="font-medium tabular-nums">
									{new Intl.NumberFormat("en-US", {
										style: "currency",
										currency: parsedResult.currency,
										maximumFractionDigits: 0,
									}).format(parsedResult.amount)}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Date</p>
								<p className="font-medium">{datetime.format(parsedResult.date, "MMM d, yyyy")}</p>
							</div>
							<div>
								<p className="text-muted-foreground">Repeat</p>
								<p className="font-medium capitalize">{parsedResult.repeat.replace(/-/g, " ")}</p>
							</div>
						</div>

						{parsedResult.suggestedCategoryId && (
							<p className="text-muted-foreground text-xs">Category matched by AI</p>
						)}
					</div>
				)}

				<DialogFooter>
					<form.SubscribeButton disabled={mutation.isPending}>Continue</form.SubscribeButton>
				</DialogFooter>
			</form.Form>
		</form.AppForm>
	);
}
