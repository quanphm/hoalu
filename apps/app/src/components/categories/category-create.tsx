import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useId } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { CategoryFields } from "#app/components/categories/category-fields.tsx";
import { useAppForm } from "#app/components/forms/index.tsx";
import {
	TransactionCloseAction,
	TransactionPageHeader,
} from "#app/components/transactions/transaction-layout.tsx";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { CategoryFormSchema } from "#app/lib/schema.ts";
import { useCreateCategory } from "#app/services/mutations.ts";

const routeApi = getRouteApi("/_dashboard/$slug/categories/new");

export function CreateCategoryPage() {
	const { slug } = routeApi.useParams();
	const { type, returnTo, transactionType } = routeApi.useSearch();
	const navigate = useNavigate();
	const mutation = useCreateCategory();
	const formId = useId();
	const returnToTransaction = returnTo === "transaction";
	const backToTransaction = (categoryId: string) =>
		navigate({
			to: "/$slug/transactions/new",
			params: { slug },
			search: { type: transactionType ?? type ?? "expense", categoryId },
		});

	const form = useAppForm({
		defaultValues: {
			name: "🔮 Magic",
			description: "",
			color: "purple",
			type: type ?? "expense",
		} as CategoryFormSchema,
		validators: { onSubmit: CategoryFormSchema },
		onSubmit: async ({ value }) => {
			const category = await mutation.mutateAsync({
				payload: {
					name: value.name,
					description: value.description,
					color: value.color,
					type: value.type,
				},
			});
			if (returnToTransaction) {
				backToTransaction(category.id);
				return;
			}
			navigate({
				to: "/$slug/categories/$categoryId",
				params: { slug, categoryId: category.id },
			});
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

	const handleClose = () =>
		returnToTransaction
			? navigate({
					to: "/$slug/transactions/new",
					params: { slug },
					search: { type: transactionType ?? type ?? "expense" },
				})
			: navigate({ to: "/$slug/categories", params: { slug } });

	return (
		<form.AppForm>
			<TransactionPageHeader
				title={
					<span className="flex min-w-0 items-center gap-2">
						<form.Subscribe selector={(s) => s.values.name}>
							{(name) => <span className="truncate">{name || "New category"}</span>}
						</form.Subscribe>
						{returnToTransaction && (
							<span className="text-muted-foreground shrink-0 text-xs">
								· Returns to your {transactionType ?? type ?? "expense"}
							</span>
						)}
					</span>
				}
				actions={<TransactionCloseAction onClose={handleClose} />}
			/>
			<CategoryFields form={form} formId={formId} submitLabel="Create category" />
		</form.AppForm>
	);
}
