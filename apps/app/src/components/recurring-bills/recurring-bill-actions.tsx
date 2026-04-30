import {
	archiveRecurringBillDialogAtom,
	createRecurringBillDialogAtom,
	deleteRecurringBillDialogAtom,
	unarchiveRecurringBillDialogAtom,
} from "#app/atoms/index.ts";
import { useAppForm } from "#app/components/forms/index.tsx";
import { type SyncedRecurringBill } from "#app/components/recurring-bills/use-recurring-bills.ts";
import { useLiveQueryWallets } from "#app/components/wallets/use-wallets.ts";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { AVAILABLE_REPEAT_OPTIONS, KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	useArchiveRecurringBill,
	useCreateRecurringBill,
	useDeleteRecurringBill,
	useEditRecurringBill,
	useUnarchiveRecurringBill,
} from "#app/services/mutations.ts";
import { Button, type ButtonProps } from "@hoalu/ui/button";
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogHeaderAction,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { Field, FieldGroup } from "@hoalu/ui/field";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useAtom, useSetAtom } from "jotai";
import * as z from "zod";

import { HotKey } from "../hotkey";

const BillFormSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	// dueDay stored as string because SelectField emits strings; parsed to number at submit
	dueDay: z.string().optional(),
	// anchorDate: full date, only used when repeat=yearly
	anchorDate: z.string().optional(),
	transaction: z.object({
		value: z.number().min(0),
		currency: z.string().min(1),
	}),
	walletId: z.string().min(1),
	categoryId: z.string().optional(),
	eventId: z.string().optional(),
	repeat: z.string().min(1),
});

type BillFormSchema = z.infer<typeof BillFormSchema>;

export function CreateRecurringBillDialogTrigger({
	showKbd = true,
	...props
}: ButtonProps & { showKbd?: boolean }) {
	const setDialog = useSetAtom(createRecurringBillDialogAtom);
	return (
		<Button size="sm" {...props} onClick={() => setDialog({ state: true })}>
			New recurring bill
			{showKbd && (
				<HotKey
					{...KEYBOARD_SHORTCUTS.create_recurring_bill}
					className="text-background ml-0.5 bg-black/25 font-bold"
				/>
			)}
		</Button>
	);
}

interface CreateRecurringBillFormProps {
	defaultDate?: string;
	defaultExpenseId?: string;
	onSuccess?: (newBillId?: string) => void;
}

export function CreateRecurringBillDialogContent(props: CreateRecurringBillFormProps) {
	return (
		<DialogPopup className="max-h-[92vh] overflow-y-scroll sm:max-w-[600px]">
			<DialogHeader>
				<DialogTitle>Set up recurring bill</DialogTitle>
				<DialogDescription>Track this as a recurring payment going forward.</DialogDescription>
				<DialogHeaderAction />
			</DialogHeader>
			<CreateRecurringBillForm {...props} />
		</DialogPopup>
	);
}

const DOW_OPTIONS = [
	{ value: "1", label: "Monday" },
	{ value: "2", label: "Tuesday" },
	{ value: "3", label: "Wednesday" },
	{ value: "4", label: "Thursday" },
	{ value: "5", label: "Friday" },
	{ value: "6", label: "Saturday" },
	{ value: "0", label: "Sunday" },
];

const DOM_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
	value: String(i + 1),
	label: String(i + 1),
}));

export function CreateRecurringBillForm({ defaultDate, onSuccess }: CreateRecurringBillFormProps) {
	const workspace = useWorkspace();
	const mutation = useCreateRecurringBill();
	const setDialog = useSetAtom(createRecurringBillDialogAtom);
	const wallets = useLiveQueryWallets();

	if (!wallets.length) return null;

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
				payload: {
					title: value.title,
					description: value.description,
					amount: value.transaction.value,
					currency: value.transaction.currency,
					repeat: value.repeat,
					walletId: value.walletId,
					categoryId: value.categoryId || null,
					workspaceId: workspace.id,
					...(value.repeat === "yearly"
						? { anchorDate: value.anchorDate }
						: { dueDay: value.dueDay ? Number(value.dueDay) : undefined }),
				},
			});
			setDialog({ state: false });
			onSuccess?.(bill?.id);
		},
	});

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
										<field.SelectField
											label="Repeat"
											options={AVAILABLE_REPEAT_OPTIONS.filter(
												(o) => o.value !== "one-time" && o.value !== "custom",
											)}
										/>
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
								<field.SelectWithGroupsField label="Wallet" groups={walletGroups} />
							)}
						/>
						<form.AppField
							name="categoryId"
							children={(field) => <field.SelectCategoryField type="expense" label="Category" />}
						/>
					</div>

					<form.AppField
						name="eventId"
						children={(field) => <field.SelectEventField label="Event" />}
					/>

					<form.AppField
						name="description"
						children={(field) => <field.TiptapField label="Note" defaultValue="" />}
					/>
				</FieldGroup>

				<DialogFooter>
					<Field orientation="horizontal" className="justify-end">
						<form.SubscribeButton>Create bill</form.SubscribeButton>
					</Field>
				</DialogFooter>
			</form.Form>
		</form.AppForm>
	);
}

interface EditRecurringBillFormProps {
	bill: SyncedRecurringBill;
}

export function EditRecurringBillForm({ bill }: EditRecurringBillFormProps) {
	const mutation = useEditRecurringBill();
	const wallets = useLiveQueryWallets();
	const walletGroups = buildWalletGroups(wallets);

	const form = useAppForm({
		defaultValues: {
			title: bill.title,
			description: bill.description ?? "",
			dueDay: String(bill.due_day ?? new Date().getDate()),
			anchorDate: bill.anchor_date,
			transaction: {
				value: bill.amount,
				currency: bill.currency,
			},
			walletId: bill.wallet_id,
			categoryId: bill.category_id ?? "",
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
					categoryId: value.categoryId || null,
					repeat: value.repeat,
					...(value.repeat === "yearly"
						? {
								dueDay: new Date(`${value.anchorDate}T00:00:00`).getDate(),
								dueMonth: new Date(`${value.anchorDate}T00:00:00`).getMonth() + 1,
							}
						: { dueDay: value.dueDay ? Number(value.dueDay) : undefined }),
				},
			});
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<FieldGroup className="grid grid-cols-1 gap-4 px-4">
					<form.Subscribe
						selector={(s) => s.values.repeat}
						children={(repeat) => (
							<div
								className={repeat === "daily" || repeat === "none" ? "" : "grid grid-cols-2 gap-4"}
							>
								<form.AppField
									name="repeat"
									children={(field) => (
										<field.SelectField
											label="Repeat"
											options={AVAILABLE_REPEAT_OPTIONS.filter(
												(o) => o.value !== "one-time" && o.value !== "custom",
											)}
										/>
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
						children={(field) => <field.InputField label="Title" required />}
					/>
					<form.AppField
						name="transaction"
						children={(field) => <field.TransactionAmountField label="Amount" />}
					/>
					<div className="grid grid-cols-2 gap-4">
						<form.AppField
							name="walletId"
							children={(field) => (
								<field.SelectWithGroupsField label="Wallet" groups={walletGroups} />
							)}
						/>
						<form.AppField
							name="categoryId"
							children={(field) => <field.SelectCategoryField type="expense" label="Category" />}
						/>
					</div>

					<form.AppField
						name="eventId"
						children={(field) => <field.SelectEventField label="Event" />}
					/>

					<form.AppField
						name="description"
						children={(field) => (
							<field.TiptapField label="Note" defaultValue={bill.description ?? ""} />
						)}
					/>
				</FieldGroup>
				<Field
					orientation="horizontal"
					className="bg-card sticky bottom-0 w-full justify-end border-t px-4 py-2"
				>
					<form.SubscribeButton>Update</form.SubscribeButton>
				</Field>
			</form.Form>
		</form.AppForm>
	);
}

export function ArchiveRecurringBillDialogContent() {
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const mutation = useArchiveRecurringBill();
	const [dialog, setDialog] = useAtom(archiveRecurringBillDialogAtom);

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
	const [dialog, setDialog] = useAtom(unarchiveRecurringBillDialogAtom);

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
	const [dialog, setDialog] = useAtom(deleteRecurringBillDialogAtom);

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

function buildWalletGroups(wallets: any[]) {
	return wallets.reduce(
		(result: any, current: any) => {
			// if (!current.isActive) return result;
			const owner = current.owner;
			if (!result[owner.id]) {
				result[owner.id] = {
					name: owner.name,
					options: [{ label: current.name, value: current.id, currency: current.currency }],
				};
			} else {
				result[owner.id].options.push({
					label: current.name,
					value: current.id,
					currency: current.currency,
				});
			}
			return result;
		},
		{} as Record<
			string,
			{ name: string; options: { label: string; value: string; currency: string }[] }
		>,
	);
}
