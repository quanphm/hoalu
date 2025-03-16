import { createExpenseDialogOpenAtom } from "@/atoms/dialogs";
import { draftExpenseAtom } from "@/atoms/draft-expense";
import { useAppForm } from "@/components/forms";
import { HotKeyWithTooltip } from "@/components/hotkey";
import { WarningMessage } from "@/components/warning-message";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import { type ExpenseFormSchema, expenseFormSchema } from "@/lib/schema";
import { useCreateExpense, useDeleteExpense, useEditExpense } from "@/services/mutations";
import {
	categoriesQueryOptions,
	expenseWithIdQueryOptions,
	walletsQueryOptions,
} from "@/services/query-options";
import { MoreHorizontalIcon } from "@hoalu/icons/lucide";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { useEffect, useState } from "react";

const routeApi = getRouteApi("/_dashboard/$slug");

function CreateExpenseDialog({ children }: { children?: React.ReactNode }) {
	const [open, setOpen] = useAtom(createExpenseDialogOpenAtom);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children}
			<DialogContent className="sm:max-w-[750px]">
				<DialogHeader>
					<DialogTitle>Create new expense</DialogTitle>
				</DialogHeader>
				<DialogDescription>Add a new transaction to track your spending.</DialogDescription>
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
	const { slug } = routeApi.useParams();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));
	const mutation = useCreateExpense();

	const setOpen = useSetAtom(createExpenseDialogOpenAtom);
	const [draft, setDraft] = useAtom(draftExpenseAtom);

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
			title: draft.title,
			description: draft.description,
			date: draft.date,
			transaction: {
				value: draft.transaction.value,
				currency: draft.transaction.currency || defaultWallet.currency,
			},
			walletId: draft.walletId || defaultWallet.value,
			categoryId: draft.categoryId,
			repeat: draft.repeat,
		} as ExpenseFormSchema,
		validators: {
			onSubmit: expenseFormSchema,
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
					repeat: value.repeat,
				},
			});
			setOpen(false);
			setDraft(RESET);
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: shut up
	useEffect(() => {
		return () => {
			if (!form.state.isSubmitted) {
				setDraft(form.state.values);
			}
		};
	}, [form.state.isSubmitted]);

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
							{(field) => <field.TiptapField label="Extra note" />}
						</form.AppField>
					</div>
					<div className="col-span-5">
						<form.AppField name="date">
							{(field) => <field.DatepickerField label="Date" />}
						</form.AppField>
					</div>
				</div>
				<div className="ml-auto flex gap-2">
					<Button
						variant="ghost"
						type="button"
						onClick={() => {
							setDraft(RESET);
							form.reset();
						}}
					>
						Reset
					</Button>
					<Button type="submit">Create expense</Button>
				</div>
			</form.Form>
		</form.AppForm>
	);
}

function ExpenseDropdownMenuWithModal({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const [content, setContent] = useState<"none" | "edit" | "delete">("none");
	const handleOpenChange = (state: boolean) => {
		setOpen(state);
		if (state === false) {
			setContent("none");
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontalIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DialogTrigger asChild onClick={() => setContent("edit")}>
						<DropdownMenuItem>Edit</DropdownMenuItem>
					</DialogTrigger>
					<DialogTrigger asChild onClick={() => setContent("delete")}>
						<DropdownMenuItem>
							<span className="text-destructive">Delete</span>
						</DropdownMenuItem>
					</DialogTrigger>
				</DropdownMenuContent>
			</DropdownMenu>
			{content === "edit" && (
				<EditExpenseDialogContent id={id} onEditCallback={() => handleOpenChange(false)} />
			)}
			{content === "delete" && (
				<DeleteExpenseDialogContent id={id} onDeleteCallback={() => handleOpenChange(false)} />
			)}
		</Dialog>
	);
}

function EditExpenseForm(props: { id: string; onEditCallback?(): void }) {
	const workspace = useWorkspace();
	const { slug } = routeApi.useParams();
	const mutation = useEditExpense();

	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));
	const { data: expense, status } = useQuery(expenseWithIdQueryOptions(workspace.slug, props.id));

	const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));
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

	const form = useAppForm({
		defaultValues: {
			title: expense?.title ?? "",
			description: expense?.description ?? "",
			date: expense?.date ?? "",
			transaction: {
				value: expense?.amount ?? 0,
				currency: expense?.currency ?? workspace.metadata.currency,
			},
			walletId: expense?.wallet.id ?? "",
			categoryId: expense?.category?.id ?? "",
			repeat: expense?.repeat ?? "one-time",
		} as ExpenseFormSchema,
		validators: {
			onSubmit: expenseFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				id: props.id,
				payload: {
					title: value.title,
					description: value.description,
					amount: value.transaction.value,
					currency: value.transaction.currency,
					date: value.date,
					walletId: value.walletId,
					categoryId: value.categoryId,
					repeat: value.repeat,
				},
			});
			if (props.onEditCallback) props.onEditCallback();
		},
	});

	useEffect(() => {
		if (status === "success") {
			form.reset();
		}
	}, [status, form.reset]);

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
							{(field) => <field.TiptapField label="Extra note" />}
						</form.AppField>
					</div>
					<div className="col-span-5">
						<form.AppField name="date">
							{(field) => <field.DatepickerField label="Date" />}
						</form.AppField>
					</div>
				</div>
				<div className="ml-auto flex gap-2">
					<Button variant="ghost" type="button" onClick={() => form.reset()}>
						Reset
					</Button>
					<Button type="submit">Update</Button>
				</div>
			</form.Form>
		</form.AppForm>
	);
}

function EditExpenseDialogContent(props: { id: string; onEditCallback?(): void }) {
	return (
		<DialogContent className="sm:max-w-[750px]">
			<DialogHeader>
				<DialogTitle>Edit expense</DialogTitle>
				<DialogDescription>Update your expense details.</DialogDescription>
			</DialogHeader>
			<EditExpenseForm id={props.id} onEditCallback={props.onEditCallback} />
		</DialogContent>
	);
}

function DeleteExpenseDialogContent(props: { id: string; onDeleteCallback?(): void }) {
	const mutation = useDeleteExpense();
	const onDelete = async () => {
		await mutation.mutateAsync({ id: props.id });
		if (props.onDeleteCallback) props.onDeleteCallback();
	};

	return (
		<DialogContent className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Delete expense?</DialogTitle>
				<DialogDescription>
					<WarningMessage>
						The expense will be deleted and removed from your history. This action cannot be undone.
					</WarningMessage>
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<DialogClose asChild>
					<Button type="button" variant="secondary">
						Cancel
					</Button>
				</DialogClose>
				<Button variant="destructive" onClick={() => onDelete()}>
					Delete
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

export { CreateExpenseDialog, CreateExpenseDialogTrigger, ExpenseDropdownMenuWithModal };
