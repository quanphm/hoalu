import { createExpenseDialogOpenAtom } from "@/atoms/dialogs";
import { useAppForm } from "@/components/forms";
import { HotKeyWithTooltip } from "@/components/hotkey";
import { WarningMessage } from "@/components/warning-message";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { useAuth } from "@/hooks/use-auth";
import { type ExpenseFormSchema, expenseFormSchema } from "@/lib/schema";
import { useCreateExpense } from "@/services/mutations";
import { categoriesQueryOptions, walletsQueryOptions } from "@/services/query-options";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom, useSetAtom } from "jotai";
import { useState } from "react";

const routeApi = getRouteApi("/_dashboard/$slug");

function CreateExpenseDialog({ children }: { children?: React.ReactNode }) {
	const [open, setOpen] = useAtom(createExpenseDialogOpenAtom);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children}
			<DialogContent
				className="sm:max-w-[750px]"
				onCloseAutoFocus={(event) => {
					event.preventDefault();
				}}
			>
				<DialogHeader>
					<DialogTitle>Create new expense</DialogTitle>
				</DialogHeader>
				<DialogDescription />
				<CreateExpenseForm />
			</DialogContent>
		</Dialog>
	);
}

function CreateExpenseDialogTrigger({ children }: { children: React.ReactNode }) {
	const setOpen = useSetAtom(createExpenseDialogOpenAtom);

	return (
		<HotKeyWithTooltip
			onClick={() => setOpen(true)}
			shortcut={KEYBOARD_SHORTCUTS.create_expense.label}
		>
			{children}
		</HotKeyWithTooltip>
	);
}

function CreateExpenseForm() {
	const { user } = useAuth();
	const setOpen = useSetAtom(createExpenseDialogOpenAtom);
	const { slug } = routeApi.useParams();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));
	const mutation = useCreateExpense();

	const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));
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
	const defaultWallet = walletGroups[user!.id]?.options[0] || fallbackWallet;

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			date: new Date(),
			transaction: {
				value: 0,
				currency: defaultWallet.currency,
			},
			walletId: defaultWallet.value,
			categoryId: "",
			repeat: "one-time",
		} as ExpenseFormSchema,
		validators: {
			onSubmit: expenseFormSchema,
		},
		onSubmit: async ({ value }) => {
			const payload = {
				title: value.title,
				description: value.description,
				amount: value.transaction.value,
				currency: value.transaction.currency,
				date: value.date.toISOString(),
				walletId: value.walletId,
				categoryId: value.categoryId,
				repeat: value.repeat,
			};
			await mutation.mutateAsync({ payload });
			setOpen(false);
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-7 flex flex-col gap-4">
						<form.AppField name="title">
							{(field) => <field.InputField label="Description" autoFocus required />}
						</form.AppField>
						<form.AppField name="transaction">
							{(field) => <field.TransactionAmountField label="Amount" />}
						</form.AppField>
						<div className="grid grid-cols-2 gap-4">
							<form.AppField name="walletId">
								{(field) => <field.SelectWithGroupsField label="Wallet" groups={walletGroups} />}
							</form.AppField>
							<form.AppField name="categoryId">
								{(field) => (
									<field.SelectWithSearchField label="Category" options={categoryOptions} />
								)}
							</form.AppField>
						</div>
						<form.AppField name="description">
							{(field) => <field.InputField label="Extra note" />}
						</form.AppField>
					</div>
					<div className="col-span-5">
						<form.AppField name="date">
							{(field) => <field.DatepickerField label="Date" />}
						</form.AppField>
					</div>
				</div>
				<Button type="submit" className="ml-auto w-fit">
					Create expense
				</Button>
			</form.Form>
		</form.AppForm>
	);
}

function EditExpenseForm() {
	const { slug } = routeApi.useParams();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));
	const mutation = useCreateExpense();

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			date: new Date(),
			transaction: {
				value: 0,
				currency: "",
			},
			walletId: "",
			categoryId: "",
			repeat: "one-time",
		} as ExpenseFormSchema,
		validators: {
			onSubmit: expenseFormSchema,
		},
		onSubmit: async ({ value }) => {
			const payload = {
				title: value.title,
				description: value.description,
				amount: value.transaction.value,
				currency: value.transaction.currency,
				date: value.date.toISOString(),
				walletId: value.walletId,
				categoryId: value.categoryId,
				repeat: value.repeat,
			};
			await mutation.mutateAsync({ payload });
		},
	});

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
						},
					],
				};
			} else {
				result[owner.id].options.push({
					label: current.name,
					value: current.id,
				});
			}
			return result;
		},
		{} as Record<string, { name: string; options: { label: string; value: string }[] }>,
	);
	const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

	return (
		<form.AppForm>
			<form.Form>
				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-7 flex flex-col gap-4">
						<form.AppField name="title">
							{(field) => <field.InputField label="Description" autoFocus required />}
						</form.AppField>
						<form.AppField name="transaction">
							{(field) => <field.TransactionAmountField label="Amount" />}
						</form.AppField>
						<div className="grid grid-cols-2 gap-4">
							<form.AppField name="walletId">
								{(field) => <field.SelectWithGroupsField label="Wallet" groups={walletGroups} />}
							</form.AppField>
							<form.AppField name="categoryId">
								{(field) => (
									<field.SelectWithSearchField label="Category" options={categoryOptions} />
								)}
							</form.AppField>
						</div>
						<form.AppField name="description">
							{(field) => <field.InputField label="Extra note" />}
						</form.AppField>
					</div>
					<div className="col-span-5">
						<form.AppField name="date">
							{(field) => <field.DatepickerField label="Date" />}
						</form.AppField>
					</div>
				</div>
				<Button type="submit" className="ml-auto w-fit">
					Update
				</Button>
			</form.Form>
		</form.AppForm>
	);
}

function DeleteExpenseDialog({
	children,
	onDelete,
}: { children: React.ReactNode; onDelete(): Promise<void> }) {
	const [open, setOpen] = useState(false);
	const handleDelete = async () => {
		await onDelete();
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children}
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Delete expense?</DialogTitle>
					<DialogDescription>
						<WarningMessage>
							The expense will be deleted and removed from your history. This action cannot be
							undone.
						</WarningMessage>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Cancel
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={() => handleDelete()}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function DeleteExpenseTrigger({ children }: { children: React.ReactNode }) {
	return <DialogTrigger asChild>{children}</DialogTrigger>;
}

export {
	CreateExpenseDialog,
	CreateExpenseDialogTrigger,
	DeleteExpenseDialog,
	DeleteExpenseTrigger,
};
