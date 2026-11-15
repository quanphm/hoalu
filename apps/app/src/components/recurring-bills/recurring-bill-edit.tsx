import { useId } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useAppForm } from "#app/components/forms/index.tsx";
import { RecurringBillFields } from "#app/components/recurring-bills/recurring-bill-fields.tsx";
import { BillFormSchema } from "#app/components/recurring-bills/recurring-bill-form.ts";
import { type SyncedRecurringBill } from "#app/components/recurring-bills/use-recurring-bills.ts";
import {
	TransactionCloseAction,
	TransactionPageHeader,
} from "#app/components/transactions/transaction-layout.tsx";
import { buildWalletGroups, useLiveQueryWallets } from "#app/components/wallets/use-wallets.ts";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { useEditRecurringBill } from "#app/services/mutations.ts";

import type { ReactNode } from "react";

interface EditRecurringBillFormProps {
	bill: SyncedRecurringBill;
	headerActions?: ReactNode;
	onClose: () => void;
}

export function EditRecurringBillForm({
	bill,
	headerActions,
	onClose,
}: EditRecurringBillFormProps) {
	const mutation = useEditRecurringBill();
	const wallets = useLiveQueryWallets();
	const walletGroups = buildWalletGroups(wallets);
	const formId = useId();
	const defaultDueDay = new Date().getDate();

	const form = useAppForm({
		defaultValues: {
			title: bill.title,
			description: bill.description ?? "",
			dueDay: String(bill.due_day ?? defaultDueDay),
			anchorDate: bill.anchor_date,
			transaction: {
				value: bill.amount,
				currency: bill.currency,
			},
			walletId: bill.wallet_id,
			categoryId: bill.category_id ?? "",
			eventId: bill.event_id ?? "",
			repeat: bill.repeat,
		} as BillFormSchema,
		validators: { onSubmit: BillFormSchema },
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				id: bill.id,
				payload: {
					title: value.title,
					description: value.description,
					amount: value.transaction.value,
					currency: value.transaction.currency,
					walletId: value.walletId,
					// `null` clears the relation; `undefined` would omit the key and leave the
					// previous value in place.
					categoryId: value.categoryId || null,
					eventId: value.eventId || null,
					repeat: value.repeat,
					...(value.repeat === "yearly"
						? {
								dueDay: new Date(`${value.anchorDate}T00:00:00`).getDate(),
								dueMonth: new Date(`${value.anchorDate}T00:00:00`).getMonth() + 1,
							}
						: { dueDay: value.dueDay ? Number(value.dueDay) : undefined }),
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
				className="bg-background sticky top-0 z-10"
				title={
					<form.Subscribe selector={(s) => s.values.title}>
						{(title) => title || "Untitled bill"}
					</form.Subscribe>
				}
				actions={
					<>
						{headerActions}
						<TransactionCloseAction onClose={onClose} />
					</>
				}
			/>
			<RecurringBillFields
				form={form}
				formId={formId}
				submitLabel="Update"
				showDirty
				walletGroups={walletGroups}
				defaultDueDay={defaultDueDay}
			/>
		</form.AppForm>
	);
}
