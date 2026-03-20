import { useAppForm } from "#app/components/forms/index.tsx";
import { useQuickExpenseQueue, useQueueStatus } from "#app/hooks/use-queue.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { AlertCircleIcon } from "@hoalu/icons/lucide";
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
			if (isFull) {
				console.warn("[QuickExpensesForm] Cannot add: queue is full");
				return;
			}
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
					<div className="mb-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/50">
						<AlertCircleIcon className="size-4 text-amber-600 dark:text-amber-400" />
						<p className="text-sm text-amber-800 dark:text-amber-200">
							Queue is full. Please wait for jobs to complete or remove some items.
						</p>
					</div>
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
