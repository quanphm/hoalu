import { datetime } from "@hoalu/datetime/datetime";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useId } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useAppForm } from "#app/components/forms/index.tsx";
import { RecurringBillFields } from "#app/components/recurring-bills/recurring-bill-fields.tsx";
import {
	type BillFormSchema,
	BillFormSchema as billFormValidator,
	toCreateBillPayload,
} from "#app/components/recurring-bills/recurring-bill-form.ts";
import {
	TransactionCloseAction,
	TransactionPageHeader,
} from "#app/components/transactions/transaction-layout.tsx";
import { buildWalletGroups, useLiveQueryWallets } from "#app/components/wallets/use-wallets.ts";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { useCreateRecurringBill } from "#app/services/mutations.ts";

const routeApi = getRouteApi("/_dashboard/$slug/recurring-bills/new");

/**
 * A bill's definition gets a page rather than a dialog: a cadence, a due day and an amount are
 * the whole object, and editing one already had a page.
 */
export function CreateRecurringBillPage() {
	const workspace = useWorkspace();
	const { slug } = routeApi.useParams();
	const { returnTo } = routeApi.useSearch();
	const navigate = useNavigate();
	const returnToTransaction = returnTo === "transaction";
	const mutation = useCreateRecurringBill();
	const wallets = useLiveQueryWallets();
	const formId = useId();

	const walletGroups = buildWalletGroups(wallets, { activeOnly: true });
	const fallbackWallet = wallets[0];
	const today = new Date();
	const defaultDueDay = today.getDate();

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			dueDay: String(defaultDueDay),
			anchorDate: datetime.format(today, "yyyy-MM-dd"),
			transaction: {
				value: 0,
				currency: fallbackWallet?.currency ?? workspace.metadata.currency,
			},
			walletId: fallbackWallet?.id ?? "",
			categoryId: "",
			eventId: "",
			repeat: "monthly",
		} as BillFormSchema,
		validators: { onSubmit: billFormValidator },
		onSubmit: async ({ value }) => {
			const bill = await mutation.mutateAsync({
				payload: toCreateBillPayload(value, workspace.id),
			});
			if (returnToTransaction) {
				navigate({
					to: "/$slug/transactions/new",
					params: { slug },
					search: { type: "expense", recurringBillId: bill.id },
				});
				return;
			}
			navigate({ to: "/$slug/recurring-bills", params: { slug } });
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
					search: { type: "expense" },
				})
			: navigate({ to: "/$slug/recurring-bills", params: { slug } });

	if (!wallets.length) return null;

	return (
		<form.AppForm>
			<TransactionPageHeader
				title={
					<span className="flex min-w-0 items-center gap-2">
						<form.Subscribe selector={(s) => s.values.title}>
							{(title) => <span className="truncate">{title || "New recurring bill"}</span>}
						</form.Subscribe>
						{returnToTransaction && (
							<span className="text-muted-foreground shrink-0 text-xs">
								· Returns to your expense
							</span>
						)}
					</span>
				}
				actions={<TransactionCloseAction onClose={handleClose} />}
			/>
			<RecurringBillFields
				form={form}
				formId={formId}
				submitLabel="Create bill"
				walletGroups={walletGroups}
				defaultDueDay={defaultDueDay}
			/>
		</form.AppForm>
	);
}
