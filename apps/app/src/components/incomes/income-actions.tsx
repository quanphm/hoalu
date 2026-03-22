import { createIncomeDialogAtom, deleteIncomeDialogAtom } from "#app/atoms/dialogs.ts";
import { selectedIncomeAtom } from "#app/atoms/income-filters.ts";
import { useAppForm } from "#app/components/forms/index.tsx";
import { HotKey } from "#app/components/hotkey.tsx";
import { useLiveQueryWallets } from "#app/components/wallets/use-wallets.ts";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { useAuth } from "#app/hooks/use-auth.ts";
import { IncomeFormSchema } from "#app/lib/schema.ts";
import { useCreateIncome, useDeleteIncome } from "#app/services/mutations.ts";
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
import { getRouteApi } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";

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

	const [lastUsedWalletId, setLastUsedWalletId] = useLocalStorage<string | null>(
		`last_used_income_wallet_${slug}`,
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

	const initialWallet = validLastWallet || defaultWallet.value;

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			date: new Date().toISOString(),
			transaction: {
				value: 0,
				currency: defaultWallet.currency,
			},
			walletId: initialWallet,
			categoryId: "",
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
			setLastUsedWalletId(value.walletId);
			setDialog({ state: false });
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<div className="grid grid-cols-12 gap-4">
					<FieldGroup className="col-span-12 flex flex-col gap-4 md:col-span-7">
						<form.AppField
							name="title"
							children={(field) => <field.InputField label="Title" />}
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
							children={(field) => <field.TiptapField label="Note" />}
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

export function DeleteIncomeDialogContent() {
	const selectedIncome = useAtomValue(selectedIncomeAtom);
	const deleteMutation = useDeleteIncome();
	const setDialog = useSetAtom(deleteIncomeDialogAtom);

	const handleDelete = async () => {
		if (!selectedIncome.id) return;
		await deleteMutation.mutateAsync({ id: selectedIncome.id });
		setDialog({ state: false });
	};

	return (
		<DialogPopup className="sm:max-w-[420px]">
			<DialogHeader>
				<DialogTitle>Delete income</DialogTitle>
				<DialogDescription>Are you sure you want to delete this income?</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<DialogClose render={<Button variant="outline">Cancel</Button>} />
				<Button variant="destructive" onClick={handleDelete}>
					Delete
				</Button>
			</DialogFooter>
		</DialogPopup>
	);
}
