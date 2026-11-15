import { Button } from "@hoalu/ui/button";
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogHeaderAction,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { Field as UIField, FieldGroup } from "@hoalu/ui/field";
import { useValue } from "@legendapp/state/react";
import { useNavigate, useParams } from "@tanstack/react-router";

import {
	archiveRecurringBillDialog,
	deleteRecurringBillDialog,
	unarchiveRecurringBillDialog,
} from "#app/atoms/index.ts";
import { useAppForm } from "#app/components/forms/index.tsx";
import {
	BillFormSchema,
	CADENCE_OPTIONS,
	DOM_OPTIONS,
	DOW_OPTIONS,
	toCreateBillPayload,
} from "#app/components/recurring-bills/recurring-bill-form.ts";
import { buildWalletGroups, useLiveQueryWallets } from "#app/components/wallets/use-wallets.ts";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	useArchiveRecurringBill,
	useCreateRecurringBill,
	useDeleteRecurringBill,
	useUnarchiveRecurringBill,
} from "#app/services/mutations.ts";

interface CreateRecurringBillFormProps {
	defaultDate?: string;
	defaultExpenseId?: string;
	onSuccess?: (newBillId?: string) => void;
}

export function CreateRecurringBillForm({ defaultDate, onSuccess }: CreateRecurringBillFormProps) {
	const workspace = useWorkspace();
	const mutation = useCreateRecurringBill();
	const wallets = useLiveQueryWallets();
	const walletGroups = buildWalletGroups(wallets);
	const defaultWallet = wallets[0];

	const defaultDueDay = defaultDate
		? new Date(`${defaultDate}T00:00:00`).getDate()
		: new Date().getDate();

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			dueDay: String(defaultDueDay),
			anchorDate: defaultDate ?? new Date().toISOString().slice(0, 10),
			transaction: {
				value: 0,
				currency: defaultWallet?.currency ?? workspace.metadata.currency,
			},
			walletId: defaultWallet?.id ?? "",
			categoryId: "",
			repeat: "monthly",
		} as BillFormSchema,
		validators: { onSubmit: BillFormSchema },
		onSubmit: async ({ value }) => {
			const bill = await mutation.mutateAsync({
				payload: toCreateBillPayload(value, workspace.id),
			});
			onSuccess?.(bill?.id);
		},
	});

	if (!wallets.length) return null;

	return (
		<form.AppForm>
			<form.Form>
				<FieldGroup className="grid grid-cols-1 gap-4">
					<form.Subscribe
						selector={(s) => s.values.repeat}
						children={(repeat) => (
							<div
								className={repeat === "daily" || repeat === "none" ? "" : "grid grid-cols-2 gap-4"}
							>
								<form.AppField
									name="repeat"
									children={(field) => (
										<field.SelectField label="Repeat" options={CADENCE_OPTIONS} />
									)}
								/>
								{repeat === "yearly" ? (
									<form.AppField
										name="anchorDate"
										children={(field) => <field.DatepickerInputField label="Due date" />}
									/>
								) : repeat === "weekly" ? (
									<form.AppField
										name="dueDay"
										children={(field) => (
											<field.SelectField label="Day of week" options={DOW_OPTIONS} />
										)}
									/>
								) : repeat === "monthly" ? (
									<form.AppField
										name="dueDay"
										children={(field) => (
											<field.SelectField label="Day of month" options={DOM_OPTIONS} />
										)}
									/>
								) : null}
							</div>
						)}
					/>
					<form.AppField
						name="title"
						children={(field) => <field.InputField label="Title" required autoFocus />}
					/>
					<form.AppField
						name="transaction"
						children={(field) => <field.TransactionAmountField label="Amount" />}
					/>
					<div className="grid grid-cols-2 gap-4">
						<form.AppField
							name="walletId"
							children={(field) => (
								<field.SelectWithGroupsField
									label="Wallet"
									groups={walletGroups}
									appearance="field"
								/>
							)}
						/>
						<form.AppField
							name="categoryId"
							children={(field) => (
								<field.SelectCategoryField type="expense" label="Category" appearance="field" />
							)}
						/>
					</div>

					<form.AppField
						name="eventId"
						children={(field) => <field.SelectEventField label="Event" appearance="field" />}
					/>

					<form.AppField
						name="description"
						children={(field) => <field.TiptapField label="Note" />}
					/>
				</FieldGroup>

				<DialogFooter>
					<UIField orientation="horizontal" className="justify-end">
						<form.SubscribeButton>Create bill</form.SubscribeButton>
					</UIField>
				</DialogFooter>
			</form.Form>
		</form.AppForm>
	);
}

export function ArchiveRecurringBillDialogContent() {
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const mutation = useArchiveRecurringBill();
	const dialog = useValue(archiveRecurringBillDialog.$);
	const setDialog = archiveRecurringBillDialog.set;

	const onDelete = async () => {
		if (!dialog?.data?.id) {
			setDialog({ state: false });
			return;
		}
		await mutation.mutateAsync({ id: dialog.data.id });
		navigate({ to: "/$slug/recurring-bills", params: { slug } });
		setDialog({ state: false });
	};

	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Archive this recurring bill?</DialogTitle>
				<DialogHeaderAction />
			</DialogHeader>
			<WarningMessage>
				This bill will be archived and removed from upcoming payments. Past linked expenses are not
				affected. This action cannot be undone.
			</WarningMessage>
			<DialogFooter>
				<DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
				<Button variant="destructive" onClick={onDelete}>
					Archive
				</Button>
			</DialogFooter>
		</DialogPopup>
	);
}

export function UnarchiveRecurringBillDialogContent() {
	const mutation = useUnarchiveRecurringBill();
	const dialog = useValue(unarchiveRecurringBillDialog.$);
	const setDialog = unarchiveRecurringBillDialog.set;

	const onUnarchive = async () => {
		if (!dialog?.data?.id) {
			setDialog({ state: false });
			return;
		}
		await mutation.mutateAsync({ id: dialog.data.id });
		setDialog({ state: false });
	};

	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Restore this recurring bill?</DialogTitle>
				<DialogHeaderAction />
			</DialogHeader>
			<p className="text-sm">
				This bill will be restored and will appear in your active bills and upcoming payments.
			</p>
			<DialogFooter>
				<DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
				<Button onClick={onUnarchive} disabled={mutation.isPending}>
					Restore
				</Button>
			</DialogFooter>
		</DialogPopup>
	);
}

export function DeleteRecurringBillDialogContent() {
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const mutation = useDeleteRecurringBill();
	const dialog = useValue(deleteRecurringBillDialog.$);
	const setDialog = deleteRecurringBillDialog.set;

	const billTitle = dialog?.data?.title ?? "this bill";

	const onDelete = async () => {
		if (!dialog?.data?.id) {
			setDialog({ state: false });
			return;
		}
		try {
			await mutation.mutateAsync({ id: dialog.data.id });
			navigate({ to: "/$slug/recurring-bills", params: { slug } });
		} finally {
			setDialog({ state: false });
		}
	};

	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Delete recurring bill?</DialogTitle>
				<DialogHeaderAction />
			</DialogHeader>
			<WarningMessage>
				This will permanently delete "{billTitle}". Linked expenses will remain but will no longer
				be associated with this bill. This action cannot be undone.
			</WarningMessage>
			<DialogFooter>
				<DialogClose
					render={<Button type="button" variant="outline" disabled={mutation.isPending} />}
				>
					Cancel
				</DialogClose>
				<Button variant="destructive" onClick={onDelete} disabled={mutation.isPending}>
					Delete
				</Button>
			</DialogFooter>
		</DialogPopup>
	);
}
