import { createRecurringBillDialogAtom } from "#app/atoms/index.ts";
import { useAppForm } from "#app/components/forms/index.tsx";
import {
	type SyncedRecurringBill,
	useSelectedRecurringBill,
} from "#app/components/recurring-bills/use-recurring-bills.ts";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { AVAILABLE_REPEAT_OPTIONS } from "#app/helpers/constants.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	useArchiveRecurringBill,
	useCreateRecurringBill,
	useEditRecurringBill,
} from "#app/services/mutations.ts";
import { walletsQueryOptions } from "#app/services/query-options.ts";
import { Trash2Icon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { Field, FieldGroup } from "@hoalu/ui/field";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import * as z from "zod";

const BillFormSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	date: z.string().min(1),
	transaction: z.object({
		value: z.number().min(0),
		currency: z.string().min(1),
	}),
	walletId: z.string().min(1),
	categoryId: z.string().optional(),
	repeat: z.string().min(1),
});

type BillFormSchema = z.infer<typeof BillFormSchema>;

interface CreateRecurringBillFormProps {
	defaultDate?: string;
	defaultExpenseId?: string;
	onSuccess?: () => void;
}

export function CreateRecurringBillDialogContent(props: CreateRecurringBillFormProps) {
	return (
		<DialogPopup className="max-h-[92vh] overflow-y-scroll sm:max-w-[600px]">
			<DialogHeader>
				<DialogTitle>Set up recurring bill</DialogTitle>
				<DialogDescription>Track this as a recurring payment going forward.</DialogDescription>
			</DialogHeader>
			<CreateRecurringBillForm {...props} />
		</DialogPopup>
	);
}

function CreateRecurringBillForm({ defaultDate, onSuccess }: CreateRecurringBillFormProps) {
	const workspace = useWorkspace();
	const mutation = useCreateRecurringBill();
	const setDialog = useSetAtom(createRecurringBillDialogAtom);
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(workspace.slug));

	const walletGroups = buildWalletGroups(wallets);
	const defaultWallet = wallets[0];

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			date: defaultDate ?? new Date().toISOString().slice(0, 10),
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
			await mutation.mutateAsync({
				payload: {
					title: value.title,
					description: value.description,
					amount: value.transaction.value,
					currency: value.transaction.currency,
					anchorDate: value.date,
					walletId: value.walletId,
					categoryId: value.categoryId || null,
					repeat: value.repeat,
					workspaceId: workspace.id,
				},
			});
			setDialog({ state: false });
			onSuccess?.();
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<FieldGroup className="grid grid-cols-1 gap-4 px-4">
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
							children={(field) => <field.SelectCategoryField label="Category" />}
						/>
					</div>
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
					<form.AppField
						name="date"
						children={(field) => <field.DatepickerInputField label="Anchor date" />}
					/>
					<form.AppField
						name="description"
						children={(field) => <field.TiptapField label="Note" defaultValue="" />}
					/>
				</FieldGroup>
				<Field
					orientation="horizontal"
					className="bg-card sticky bottom-0 w-full justify-end border-t px-4 py-2"
				>
					<form.SubscribeButton>Create bill</form.SubscribeButton>
				</Field>
			</form.Form>
		</form.AppForm>
	);
}

interface EditRecurringBillFormProps {
	bill: SyncedRecurringBill;
}

export function EditRecurringBillForm({ bill }: EditRecurringBillFormProps) {
	const workspace = useWorkspace();
	const mutation = useEditRecurringBill();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(workspace.slug));
	const walletGroups = buildWalletGroups(wallets);

	const form = useAppForm({
		defaultValues: {
			title: bill.title,
			description: bill.description ?? "",
			date: bill.anchor_date,
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
					anchorDate: value.date,
					walletId: value.walletId,
					categoryId: value.categoryId || null,
					repeat: value.repeat,
				},
			});
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<FieldGroup className="grid grid-cols-1 gap-4 px-4">
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
							children={(field) => <field.SelectCategoryField label="Category" />}
						/>
					</div>
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
					<form.AppField
						name="date"
						children={(field) => <field.DatepickerInputField label="Anchor date" />}
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
					<form.SubscribeButton>Update bill</form.SubscribeButton>
				</Field>
			</form.Form>
		</form.AppForm>
	);
}

export function ArchiveRecurringBillDialogContent({ id }: { id: string }) {
	const { onSelectBill } = useSelectedRecurringBill();
	const mutation = useArchiveRecurringBill();
	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Remove recurring bill?</DialogTitle>
				<WarningMessage>
					This bill will be archived and removed from upcoming payments. Past linked expenses are
					not affected. This action cannot be undone.
				</WarningMessage>
			</DialogHeader>
			<DialogFooter>
				<DialogClose render={<Button type="button" variant="secondary" />}>Cancel</DialogClose>
				<Button
					variant="destructive"
					onClick={async () => {
						await mutation.mutateAsync({ id });
						onSelectBill(null);
					}}
				>
					Archive
				</Button>
			</DialogFooter>
		</DialogPopup>
	);
}

export function ArchiveRecurringBillButton({ id }: { id: string }) {
	const mutation = useArchiveRecurringBill();
	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						size="icon"
						variant="ghost"
						onClick={() => mutation.mutate({ id })}
						disabled={mutation.isPending}
					/>
				}
			>
				<Trash2Icon className="size-4" />
			</TooltipTrigger>
			<TooltipContent side="bottom">Archive</TooltipContent>
		</Tooltip>
	);
}

// Helpers
function buildWalletGroups(wallets: any[]) {
	return wallets.reduce(
		(result: any, current: any) => {
			if (!current.isActive) return result;
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
