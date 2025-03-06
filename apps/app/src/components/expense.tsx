import { useAppForm } from "@/components/forms";
import { authClient } from "@/lib/auth-client";
import { deleteWorkspaceSchema, workspaceSchema } from "@/lib/schema";
import { workspaceKeys } from "@/services/query-key-factory";
import {
	categoriesQueryOptions,
	getWorkspaceDetailsOptions,
	walletsQueryOptions,
} from "@/services/query-options";
import { slugify } from "@hoalu/common/slugify";
import { TriangleAlertIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { toast } from "@hoalu/ui/sonner";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate, useParams } from "@tanstack/react-router";
import { createContext, use, useMemo, useState } from "react";

const routeApi = getRouteApi("/_dashboard/$slug");

type CreateContext = {
	open: boolean;
	setOpen: (open: boolean) => void;
};
const CreateContext = createContext<CreateContext | null>(null);

function CreateExpenseDialog({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const contextValue = useMemo<CreateContext>(
		() => ({
			open,
			setOpen,
		}),
		[open],
	);

	return (
		<CreateContext value={contextValue}>
			<Dialog open={open} onOpenChange={setOpen}>
				{children}
				<DialogContent
					className="sm:max-w-[720px]"
					onEscapeKeyDown={(event) => {
						event.preventDefault();
					}}
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
		</CreateContext>
	);
}

function CreateExpenseDialogTrigger({ children }: { children: React.ReactNode }) {
	return <DialogTrigger asChild>{children}</DialogTrigger>;
}

function CreateExpenseForm() {
	const queryClient = useQueryClient();
	const context = use(CreateContext);
	const { slug } = routeApi.useParams();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			date: new Date(),
			transaction: {
				value: 0,
				currency: "VND",
			},
			repeat: "one-time",
			walletId: "",
			categoryId: "",
		},
		onSubmit: async ({ value }) => {
			console.log(value);
			context?.setOpen(false);
		},
	});

	const walletOptions = wallets.map((w) => ({ label: w.name, value: w.id }));
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
	const { slug } = useParams({ from: "/_dashboard/$slug/settings" });
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));

	const form = useAppForm({
		defaultValues: {
			name: workspace.name,
			slug: workspace.slug,
		},
		validators: {
			onSubmit: workspaceSchema,
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

type DeleteContext = {
	open: boolean;
	setOpen: (open: boolean) => void;
};
const DeleteContext = createContext<CreateContext | null>(null);

function DeleteExpenseDialog({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const contextValue = useMemo<DeleteContext>(
		() => ({
			open,
			setOpen,
		}),
		[open],
	);

	return (
		<CreateContext value={contextValue}>
			<Dialog open={open} onOpenChange={setOpen}>
				{children}
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader className="space-y-3">
						<DialogTitle>Confirm delete workspace</DialogTitle>
						<DialogDescription>
							<span className="text-amber-600 text-sm">
								<TriangleAlertIcon
									className="-mt-0.5 mr-2 inline-flex size-4 text-amber-500"
									strokeWidth={2}
									aria-hidden="true"
								/>
								This action can't be undone.
							</span>
						</DialogDescription>
					</DialogHeader>
					<DeleteExpenseForm />
				</DialogContent>
			</Dialog>
		</CreateContext>
	);
}

function DeleteExpenseTrigger({ children }: { children: React.ReactNode }) {
	return <DialogTrigger asChild>{children}</DialogTrigger>;
}

function DeleteExpenseForm() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug/settings" });
	const context = use(DeleteContext);

	const form = useAppForm({
		defaultValues: {
			confirm: "",
		},
		validators: {
			onSubmit: deleteWorkspaceSchema,
		},
		onSubmit: async ({ value }) => {
			await authClient.workspace.delete(
				{ idOrSlug: value.confirm },
				{
					onSuccess: () => {
						toast.success("Workspace deleted");
						queryClient.invalidateQueries({
							queryKey: workspaceKeys.all,
						});
						if (context) {
							context.setOpen(false);
						}
						navigate({ to: "/" });
					},
					onError: (ctx) => {
						toast.error(ctx.error.message);
					},
				},
			);
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField
					name="confirm"
					validators={{
						onSubmit: ({ value }) => {
							return value !== slug ? "Incorrect value" : undefined;
						},
					}}
				>
					{(field) => (
						<field.InputField
							name="confirm"
							label={
								<span className="text-muted-foreground">
									Type in <strong className="text-foreground">{slug}</strong> to confirm.
								</span>
							}
							required
							autoComplete="off"
						/>
					)}
				</form.AppField>
				<Button variant="destructive" type="submit">
					I understand, delete this workspace
				</Button>
			</form.Form>
		</form.AppForm>
	);
}

export {
	CreateExpenseDialog,
	CreateExpenseDialogTrigger,
	CreateExpenseForm,
	UpdateExpenseForm,
	DeleteExpenseDialog,
	DeleteExpenseTrigger,
	DeleteExpenseForm,
};
