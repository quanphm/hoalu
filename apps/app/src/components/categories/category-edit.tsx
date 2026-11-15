import { useId } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { CategoryFields } from "#app/components/categories/category-fields.tsx";
import { type SyncedCategory } from "#app/components/categories/use-categories.ts";
import { useAppForm } from "#app/components/forms/index.tsx";
import {
	TransactionCloseAction,
	TransactionPageHeader,
} from "#app/components/transactions/transaction-layout.tsx";
import { CATEGORY_TYPE_LABELS, KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { CategoryFormSchema } from "#app/lib/schema.ts";
import { useEditCategory } from "#app/services/mutations.ts";

import type { ReactNode } from "react";

export function EditCategoryForm({
	category,
	headerActions,
	onClose,
}: {
	category: SyncedCategory;
	headerActions?: ReactNode;
	onClose: () => void;
}) {
	const mutation = useEditCategory();
	const formId = useId();

	const form = useAppForm({
		defaultValues: {
			name: category.name,
			description: category.description ?? "",
			color: category.color,
			type: category.type,
		} as CategoryFormSchema,
		validators: {
			onSubmit: CategoryFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				id: category.id,
				payload: {
					name: value.name,
					description: value.description,
					color: value.color,
				},
			});
			form.reset(value);
		},
	});

	useHotkeys(
		KEYBOARD_SHORTCUTS.save_transaction.hotkey,
		(e) => {
			e.preventDefault();
			void form.handleSubmit();
		},
		{ enableOnFormTags: true },
		[form],
	);

	return (
		<form.AppForm>
			<TransactionPageHeader
				title={
					<span className="flex min-w-0 items-center gap-2">
						<form.Subscribe selector={(s) => s.values.name}>
							{(name) => <span className="truncate">{name || "Untitled category"}</span>}
						</form.Subscribe>
						<span className="shrink-0 opacity-70">· {CATEGORY_TYPE_LABELS[category.type]}</span>
					</span>
				}
				actions={
					<>
						{headerActions}
						<TransactionCloseAction onClose={onClose} />
					</>
				}
			/>
			<CategoryFields form={form} formId={formId} submitLabel="Update" showDirty />
		</form.AppForm>
	);
}
