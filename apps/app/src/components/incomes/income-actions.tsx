import {
	createIncomeDialogAtom,
	deleteIncomeDialogAtom,
	draftIncomeAtom,
} from "#app/atoms/index.ts";
import { useAppForm } from "#app/components/forms/index.tsx";
import { HotKey } from "#app/components/hotkey.tsx";
import { type SyncedIncome, useSelectedIncome } from "#app/components/incomes/use-incomes.ts";
import { useLiveQueryWallets } from "#app/components/wallets/use-wallets.ts";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { useAuth } from "#app/hooks/use-auth.ts";
import { IncomeFormSchema } from "#app/lib/schema.ts";
import {
	useCreateIncome,
	useDeleteIncome,
	useDuplicateIncome,
	useEditIncome,
} from "#app/services/mutations.ts";
import { CopyPlusIcon, Trash2Icon } from "@hoalu/icons/lucide";
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
import { useLocalStorage } from "@hoalu/ui/hooks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { useEffect } from "react";

const routeApi = getRouteApi("/_dashboard/$slug");

export function CreateIncomeDialogTrigger({
	showKbd = true,
	...props
}: ButtonProps & { showKbd?: boolean }) {
	const setDialog = useSetAtom(createIncomeDialogAtom);

	return (
		<Button variant="outline" {...props} onClick={() => setDialog({ state: true })}>
			Create income
			{showKbd && <HotKey {...KEYBOARD_SHORTCUTS.create_income} />}
		</Button>
	);
}

export function CreateIncomeDialogContent() {
	return (
		<DialogPopup className="max-h-[92vh] overflow-y-scroll sm:max-w-[750px]">
			<DialogHeader>
				<DialogTitle>Create new income</DialogTitle>
				<DialogDescription>Add a new income transaction.</DialogDescription>
				<DialogHeaderAction />
			</DialogHeader>
			<CreateIncomeForm />
		</DialogPopup>
	);
}

function CreateIncomeForm() {
	const { user } = useAuth();
	const { slug } = routeApi.useParams();
	const wallets = useLiveQueryWallets();
	const mutation = useCreateIncome();
	const setDialog = useSetAtom(createIncomeDialogAtom);
	const [draft, setDraft] = useAtom(draftIncomeAtom);

	const [lastUsedWalletId, setLastUsedWalletId] = useLocalStorage<string | null>(
		`last_used_income_wallet_${slug}`,
		null,
	);
	const [lastUsedCategoryId, setLastUsedCategoryId] = useLocalStorage<string | null>(
		`last_used_income_category_${slug}`,
		null,
	);

	if (!wallets.length) return null;

	const fallbackWallet = {
		label: wallets[0].name,
		value: wallets[0].id,
		currency: wallets[0].currency,
	};
	const walletGroups = wallets.reduce(
		(result, current) => {
			const owner = current.owner;
			if (!current.isActive) {
				return result;
			}
			if (!result[owner.id]) {
				result[owner.id] = {
					name: owner.name,
					options: [
						{
							label: current.name,
							value: current.id,
							currency: current.currency,
						},
					],
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
	const userId = user?.id || "";
	const defaultWallet = walletGroups[userId]?.options[0] || fallbackWallet;

	const validLastWallet =
		lastUsedWalletId && wallets.some((w) => w.id === lastUsedWalletId && w.isActive)
			? lastUsedWalletId
			: null;

	const initialWallet = draft.walletId || validLastWallet || defaultWallet.value;
	const initialCategory = draft.categoryId || lastUsedCategoryId;

	const form = useAppForm({
		defaultValues: {
			title: draft.title,
			description: draft.description,
			date: draft.date || new Date().toISOString(),
			transaction: {
				value: draft.transaction.value,
				currency: draft.transaction.currency || defaultWallet.currency,
			},
			walletId: initialWallet,
			categoryId: initialCategory,
		} as IncomeFormSchema,
		validators: {
			onSubmit: IncomeFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				payload: {
					title: value.title,
					description: value.description,
					amount: value.transaction.value,
					currency: value.transaction.currency,
					date: value.date,
					walletId: value.walletId,
					categoryId: value.categoryId,
				},
			});
			setDraft(RESET);
			setDialog({ state: false });
			setLastUsedWalletId(value.walletId);
			if (value.categoryId) {
				setLastUsedCategoryId(value.categoryId);
			}
		},
	});

	useEffect(() => {
		return () => {
			if (!form.state.isSubmitted) {
				setDraft(form.state.values);
			}
		};
	}, [form.state.isSubmitted, setDraft, form.state.values]);

	return (
		<form.AppForm>
			<form.Form>
				<div className="grid grid-cols-12 gap-4">
					<FieldGroup className="col-span-12 flex flex-col gap-4 md:col-span-7">
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
								children={(field) => <field.SelectCategoryField label="Category" type="income" />}
							/>
						</div>
						<form.AppField
							name="description"
							children={(field) => (
								<field.TiptapField label="Note" defaultValue={draft.description} />
							)}
						/>
					</FieldGroup>
					<FieldGroup className="col-span-12 flex flex-col gap-2.5 md:col-span-5">
						<form.AppField
							name="date"
							children={(field) => <field.DatepickerInputField label="Date" />}
						/>
						<div className="hidden md:block">
							<form.AppField name="date" children={(field) => <field.DatepickerField />} />
						</div>
					</FieldGroup>
				</div>
				<DialogFooter>
					<Field orientation="horizontal" className="justify-end">
						<form.SubscribeButton>Create income</form.SubscribeButton>
					</Field>
				</DialogFooter>
			</form.Form>
		</form.AppForm>
	);
}

export function DeleteIncome({ id }: { id: string }) {
	const setDialog = useSetAtom(deleteIncomeDialogAtom);

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						size="icon"
						variant="outline"
						aria-label="Delete this income"
						onClick={() => setDialog({ state: true, data: { id } })}
					/>
				}
			>
				<Trash2Icon className="size-4" />
			</TooltipTrigger>
			<TooltipContent side="bottom">Delete</TooltipContent>
		</Tooltip>
	);
}

export function DeleteIncomeDialogContent() {
	const { onSelectIncome } = useSelectedIncome();
	const mutation = useDeleteIncome();
	const [dialog, setDialog] = useAtom(deleteIncomeDialogAtom);

	const onDelete = async () => {
		if (!dialog?.data?.id) {
			setDialog({ state: false });
			return;
		}
		await mutation.mutateAsync({ id: dialog.data.id });
		onSelectIncome(null);
		setDialog({ state: false });
	};

	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Delete this income?</DialogTitle>
				<DialogHeaderAction />
			</DialogHeader>
			<WarningMessage>
				The income will be deleted and removed from your history. This action cannot be undone.
			</WarningMessage>
			<DialogFooter>
				<DialogClose render={<Button variant="outline">Cancel</Button>} />
				<Button variant="destructive" onClick={onDelete}>
					Delete
				</Button>
			</DialogFooter>
		</DialogPopup>
	);
}

export function DuplicateIncome(props: { data: SyncedIncome }) {
	const mutation = useDuplicateIncome();
	const onDuplicate = () => {
		mutation.mutate({ sourceIncome: props.data });
	};

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						size="icon"
						variant="outline"
						aria-label="Duplicate this income"
						onClick={onDuplicate}
					/>
				}
			>
				<CopyPlusIcon className="size-4" />
			</TooltipTrigger>
			<TooltipContent side="bottom">Duplicate</TooltipContent>
		</Tooltip>
	);
}

export function EditIncomeForm({ data }: { data: SyncedIncome }) {
	const mutation = useEditIncome();
	const wallets = useLiveQueryWallets();

	const walletGroups = wallets.reduce(
		(result, current) => {
			const owner = current.owner;
			if (!result[owner.id]) {
				result[owner.id] = {
					name: owner.name,
					options: [
						{
							label: current.name,
							value: current.id,
							currency: current.currency,
						},
					],
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

	const form = useAppForm({
		defaultValues: {
			title: data.title,
			description: data.description ?? "",
			date: data.date,
			transaction: { value: data.amount, currency: data.currency },
			walletId: data.wallet.id,
			categoryId: data.category?.id ?? "",
		} as IncomeFormSchema,
		validators: {
			onSubmit: IncomeFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				id: data.id,
				payload: {
					title: value.title,
					description: value.description,
					amount: value.transaction.value,
					currency: value.transaction.currency,
					date: value.date,
					walletId: value.walletId,
					categoryId: value.categoryId,
				},
			});
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<FieldGroup className="p-4">
					<form.AppField
						name="date"
						children={(field) => <field.DatepickerInputField label="Date" />}
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
							children={(field) => <field.SelectCategoryField label="Category" type="income" />}
						/>
					</div>

					<form.AppField
						name="description"
						children={(field) => (
							<field.TiptapField label="Note" defaultValue={data.description ?? ""} />
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
