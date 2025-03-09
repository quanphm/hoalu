import { createExpenseDialogOpenAtom, deleteExpenseDialogOpenAtom } from "@/atoms/expense-dialog";
import { useAppForm } from "@/components/forms";
import { HotKey } from "@/components/hotkey";
import { authClient } from "@/lib/auth-client";
import { type ExpenseFormSchema, expenseFormSchema, workspaceFormSchema } from "@/lib/schema";
import { useCreateExpense } from "@/services/mutations";
import { workspaceKeys } from "@/services/query-key-factory";
import {
	categoriesQueryOptions,
	getWorkspaceDetailsOptions,
	walletsQueryOptions,
} from "@/services/query-options";
import { slugify } from "@hoalu/common/slugify";
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
import { toast } from "@hoalu/ui/sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useAtom, useSetAtom } from "jotai";

const routeApi = getRouteApi("/_dashboard/$slug");

function CreateExpenseDialog({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useAtom(createExpenseDialogOpenAtom);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children}
			<DialogContent
				className="sm:max-w-[720px]"
				onPointerDownOutside={(event) => {
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
	return (
		<Tooltip>
			<DialogTrigger asChild>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
			</DialogTrigger>
			<TooltipContent side="bottom">
				<HotKey>
					<span className="text-sm leading-none">⌘</span>E
				</HotKey>
			</TooltipContent>
		</Tooltip>
	);
}

function CreateExpenseForm() {
	const setOpen = useSetAtom(createExpenseDialogOpenAtom);
	const { slug } = routeApi.useParams();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));

	const mutation = useCreateExpense();
	const defaultWallet = wallets[0];

	const walletOptions = wallets.map((w) => ({ label: w.name, value: w.id }));
	const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			date: new Date(),
			transaction: {
				value: 0,
				currency: defaultWallet.currency,
			},
			walletId: defaultWallet.id,
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
			await mutation.mutateAsync(payload);
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
								{(field) => <field.SelectField label="Wallet" options={walletOptions} />}
							</form.AppField>
							<form.AppField name="categoryId">
								{(field) => <field.SelectField label="Category" options={categoryOptions} />}
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

function UpdateExpenseForm({ canUpdateWorkspace }: { canUpdateWorkspace: boolean }) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { slug } = routeApi.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));

	const form = useAppForm({
		defaultValues: {
			name: workspace.name,
			slug: workspace.slug,
		},
		validators: {
			onSubmit: workspaceFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (!canUpdateWorkspace) return;

			await authClient.workspace.update(
				{
					data: {
						name: value.name,
						slug: value.slug !== slug ? value.slug : undefined,
					},
					idOrSlug: workspace.slug,
				},
				{
					onSuccess: () => {
						toast.success("Workspace updated");
						queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
						if (workspace.slug !== value.slug) {
							navigate({
								to: "/$slug/settings/workspace",
								params: {
									slug: value.slug,
								},
							});
						}
					},
					onError: (ctx) => {
						form.setFieldMeta("slug", (state) => {
							return {
								...state,
								errorMap: {
									onSubmit: ctx.error.message,
								},
							};
						});
					},
				},
			);
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField
					name="name"
					listeners={{
						onChange: ({ value }) => {
							form.setFieldValue("slug", slugify(value));
						},
					}}
				>
					{(field) => (
						<field.InputField
							label="Workspace name"
							required
							autoComplete="off"
							placeholder="Acme Inc."
							disabled={!canUpdateWorkspace}
						/>
					)}
				</form.AppField>
				<form.AppField name="slug">
					{(field) => (
						<field.InputWithPrefixField
							label="Workspace URL"
							placeholder="acme-inc-42"
							description={
								canUpdateWorkspace
									? "Use only lowercase letters (a-z), numbers (0-9) and hyphens (-)"
									: ""
							}
							pattern="[a-z0-9\-]+$"
							required
							autoComplete="off"
							disabled={!canUpdateWorkspace}
						/>
					)}
				</form.AppField>
				{canUpdateWorkspace && (
					<Button type="submit" className="ml-auto w-fit">
						Update profile
					</Button>
				)}
			</form.Form>
		</form.AppForm>
	);
}

function DeleteExpenseDialog({
	children,
	onDelete,
}: { children: React.ReactNode; onDelete(): Promise<void> }) {
	const [open, setOpen] = useAtom(deleteExpenseDialogOpenAtom);
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
						The expense will be deleted and removed from your spending history. This action cannot
						be undone.
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
	CreateExpenseForm,
	UpdateExpenseForm,
	DeleteExpenseDialog,
	DeleteExpenseTrigger,
};
