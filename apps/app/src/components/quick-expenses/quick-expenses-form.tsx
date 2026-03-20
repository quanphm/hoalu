import { useAppForm } from "#app/components/forms/index.tsx";
import { useScanQueue } from "#app/hooks/use-scan-queue.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { DialogFooter } from "@hoalu/ui/dialog";
import * as z from "zod";

const QuickEntryFormSchema = z.object({
	text: z.string().min(1, "Please describe your expense"),
});

interface QuickExpensesFormProps {
	onSubmitted: () => void;
}

export function QuickExpensesForm({ onSubmitted }: QuickExpensesFormProps) {
	const workspace = useWorkspace();
	const { addQuickExpense } = useScanQueue();

	const form = useAppForm({
		defaultValues: {
			text: "",
		},
		validators: {
			onSubmit: QuickEntryFormSchema,
		},
		onSubmit: async ({ value }) => {
			addQuickExpense({
				text: value.text.trim(),
				workspaceSlug: workspace.slug,
			});
			onSubmitted();
		},
	});

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

				<DialogFooter>
					<form.SubscribeButton>Continue</form.SubscribeButton>
				</DialogFooter>
			</form.Form>
		</form.AppForm>
	);
}
