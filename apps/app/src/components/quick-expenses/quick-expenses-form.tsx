import { useAppForm } from "#app/components/forms/index.tsx";
import { useQuickExpenseQueue, useQueueStatus } from "#app/hooks/use-queue.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { AlertCircleIcon } from "@hoalu/icons/lucide";
import { Alert, AlertDescription, AlertTitle } from "@hoalu/ui/alert";
import { DialogFooter } from "@hoalu/ui/dialog";
import { cn } from "@hoalu/ui/utils";
import * as z from "zod";

const QuickEntryFormSchema = z.object({
	text: z.string().min(1, "Please describe your expense"),
});

interface QuickExpensesFormProps {
	onSubmitted: () => void;
}

export function QuickExpensesForm({ onSubmitted }: QuickExpensesFormProps) {
	const workspace = useWorkspace();
	const { add } = useQuickExpenseQueue();
	const { isFull } = useQueueStatus();

	const form = useAppForm({
		defaultValues: {
			text: "",
		},
		validators: {
			onSubmit: QuickEntryFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (isFull) return;
			add({
				text: value.text.trim(),
				workspaceSlug: workspace.slug,
			});
			onSubmitted();
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				{isFull && (
					<Alert variant="error">
						<AlertCircleIcon />
						<AlertTitle>Queue is full</AlertTitle>
						<AlertDescription>
							Please wait for jobs to complete or remove some items.
						</AlertDescription>
					</Alert>
				)}
				<form.AppField
					name="text"
					children={(field) => (
						<field.InputField
							placeholder="e.g. Coffee 15k yesterday, Cơm trưa 50k hôm qua"
							autoFocus
							disabled={isFull}
							className={cn(isFull && "opacity-50")}
						/>
					)}
				/>
				<DialogFooter>
					<form.SubscribeButton disabled={isFull}>Continue</form.SubscribeButton>
				</DialogFooter>
			</form.Form>
		</form.AppForm>
	);
}
