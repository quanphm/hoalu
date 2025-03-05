import { useAppForm } from "@/components/forms";
import { authClient } from "@/lib/auth-client";
import { deleteWorkspaceSchema, workspaceSchema } from "@/lib/schema";
import { workspaceKeys } from "@/services/query-key-factory";
import { getWorkspaceDetailsOptions } from "@/services/query-options";
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
import { useNavigate, useParams } from "@tanstack/react-router";
import { createContext, use, useMemo, useState } from "react";

type CreateContext = {
	open: boolean;
	setOpen: (open: boolean) => void;
};
const CreateContext = createContext<CreateContext | null>(null);

function CreateWorkspaceDialog({ children }: { children: React.ReactNode }) {
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
				<DialogContent className="sm:max-w-[540px]">
					<DialogHeader>
						<DialogTitle>Create a new workspace</DialogTitle>
						<DialogDescription>
							Workspaces are shared environments where members can interact with content together.
						</DialogDescription>
					</DialogHeader>
					<CreateWorkspaceForm />
				</DialogContent>
			</Dialog>
		</CreateContext>
	);
}

function CreateWorkspaceDialogTrigger({ children }: { children: React.ReactNode }) {
	return <DialogTrigger asChild>{children}</DialogTrigger>;
}

function CreateWorkspaceForm() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const context = use(CreateContext);

	const form = useAppForm({
		defaultValues: {
			name: "",
			slug: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.workspace.create(value, {
				onSuccess: (ctx) => {
					toast.success("Workspace created");
					queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
					if (context) {
						context.setOpen(false);
					}
					navigate({
						to: "/$slug",
						params: {
							slug: ctx.data.slug,
						},
					});
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
			});
		},
	});

	return (
		<form.AppForm>
			<form.FieldSet>
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
							autoFocus
							required
							autoComplete="off"
							placeholder="Acme Inc."
						/>
					)}
				</form.AppField>
				<form.AppField name="slug">
					{(field) => (
						<field.InputWithPrefixField
							label="Workspace URL"
							placeholder="acme-inc-42"
							description="Use only lowercase letters (a-z), numbers (0-9) and hyphens (-)."
							pattern="[a-z0-9\-]+$"
							required
							autoComplete="off"
						/>
					)}
				</form.AppField>
				<Button type="submit" className="ml-auto w-fit">
					Create workspace
				</Button>
			</form.FieldSet>
		</form.AppForm>
	);
}

function UpdateWorkspaceForm({ canUpdateWorkspace }: { canUpdateWorkspace: boolean }) {
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
						// slug: value.slug !== slug ? value.slug : undefined,
						slug: value.slug,
					},
					idOrSlug: workspace.slug,
				},
				{
					onSuccess: () => {
						toast.success("Workspace updated");
						queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
						if (workspace.slug !== value.slug) {
							navigate({
								to: "/$slug/settings",
								params: {
									slug: value.slug,
								},
							});
						}
					},
					onError: (ctx) => {
						// form.setError("slug", { type: "custom", message: ctx.error.message });
					},
				},
			);
		},
	});

	return (
		<form.AppForm>
			<form.FieldSet>
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
									? "Use only lowercase letters (a-z), numbers (0-9) and hyphens (-)."
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
			</form.FieldSet>
		</form.AppForm>
	);
}

type DeleteContext = {
	open: boolean;
	setOpen: (open: boolean) => void;
};
const DeleteContext = createContext<CreateContext | null>(null);

function DeleteWorkspaceDialog({ children }: { children: React.ReactNode }) {
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
							<p className="text-amber-600 text-sm">
								<TriangleAlertIcon
									className="-mt-0.5 mr-2 inline-flex size-4 text-amber-500"
									strokeWidth={2}
									aria-hidden="true"
								/>
								This action can't be undone.
							</p>
						</DialogDescription>
					</DialogHeader>
					<DeleteWorkspaceForm />
				</DialogContent>
			</Dialog>
		</CreateContext>
	);
}

function DeleteWorkspaceTrigger({ children }: { children: React.ReactNode }) {
	return <DialogTrigger asChild>{children}</DialogTrigger>;
}

function DeleteWorkspaceForm() {
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
			<form.FieldSet>
				<form.AppField
					name="confirm"
					validators={{
						onBlur: ({ value }) => {
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
			</form.FieldSet>
		</form.AppForm>
	);
}

export {
	CreateWorkspaceDialog,
	CreateWorkspaceDialogTrigger,
	CreateWorkspaceForm,
	UpdateWorkspaceForm,
	DeleteWorkspaceDialog,
	DeleteWorkspaceTrigger,
	DeleteWorkspaceForm,
};
