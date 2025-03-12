import { useAppForm } from "@/components/forms";
import { AVAILABLE_CURRENCY_OPTIONS } from "@/helpers/constants";
import { authClient } from "@/lib/auth-client";
import { workspaceFormSchema, workspaceMetadataFormSchema } from "@/lib/schema";
import {
	useCreateWorkspace,
	useDeleteWorkspace,
	useUpdateWorkspace,
	useUpdateWorkspaceMetadata,
} from "@/services/mutations";
import { getWorkspaceDetailsOptions } from "@/services/query-options";
import { slugify } from "@hoalu/common/slugify";
import { tryCatch } from "@hoalu/common/try-catch";
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
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { createContext, use, useMemo, useState } from "react";

const routeApi = getRouteApi("/_dashboard/$slug");

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
				<DialogContent className="sm:max-w-[500px]">
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
	const context = use(CreateContext);
	const mutation = useCreateWorkspace();

	const form = useAppForm({
		defaultValues: {
			name: "",
			slug: "",
			currency: "USD",
		},
		validators: {
			onSubmit: workspaceFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
			context?.setOpen(false);
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
							description="Use only lowercase letters (a-z), numbers (0-9) and hyphens (-)"
							pattern="[a-z0-9\-]+$"
							required
							autoComplete="off"
						/>
					)}
				</form.AppField>
				<form.AppField name="currency">
					{(field) => (
						<field.SelectWithSearchField
							label="Workspace currency"
							description="This will determine how monetary values appear in your dashboard."
							options={AVAILABLE_CURRENCY_OPTIONS}
						/>
					)}
				</form.AppField>
				<Button type="submit" className="ml-auto w-fit">
					Create workspace
				</Button>
			</form.Form>
		</form.AppForm>
	);
}

function UpdateWorkspaceForm({ canUpdateWorkspace }: { canUpdateWorkspace: boolean }) {
	const { slug } = routeApi.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));
	const mutation = useUpdateWorkspace();

	const form = useAppForm({
		defaultValues: {
			name: workspace.name,
			slug: workspace.slug,
		},
		validators: {
			onSubmit: workspaceFormSchema.omit("currency"),
			onSubmitAsync: async ({ value }) => {
				if (value.slug === slug) {
					return undefined;
				}
				const { error } = await authClient.workspace.checkSlug({ slug: value.slug });
				if (error) {
					return {
						fields: { slug: error.message },
					};
				}
				return undefined;
			},
		},
		onSubmit: async ({ value }) => {
			if (!canUpdateWorkspace) return;
			const { error } = await tryCatch.async(mutation.mutateAsync(value));
			if (error) {
				form.setFieldMeta("slug", (state) => {
					return {
						...state,
						errorMap: {
							onSubmit: error.message,
						},
					};
				});
			}
			form.reset();
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
					<div className="ml-auto flex gap-2">
						<Button variant="ghost" type="button" onClick={() => form.reset()}>
							Reset
						</Button>
						<form.Subscribe selector={(state) => state.isPristine}>
							{(isPristine) => (
								<Button type="submit" disabled={isPristine}>
									Update
								</Button>
							)}
						</form.Subscribe>
					</div>
				)}
			</form.Form>
		</form.AppForm>
	);
}

function UpdateWorkspaceMetadataForm({ canUpdateWorkspace }: { canUpdateWorkspace: boolean }) {
	const { slug } = routeApi.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));
	const mutation = useUpdateWorkspaceMetadata();

	const form = useAppForm({
		defaultValues: {
			currency: workspace.metadata.currency as string,
		},
		validators: {
			onSubmit: workspaceMetadataFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (!canUpdateWorkspace) return;
			await tryCatch.async(mutation.mutateAsync(value));
			form.reset();
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField name="currency">
					{(field) => (
						<field.SelectWithSearchField
							label="Default currency"
							description="This will determine how monetary values appear in your dashboard."
							options={AVAILABLE_CURRENCY_OPTIONS}
						/>
					)}
				</form.AppField>
				{canUpdateWorkspace && (
					<div className="ml-auto flex gap-2">
						<Button variant="ghost" type="button" onClick={() => form.reset()}>
							Reset
						</Button>
						<form.Subscribe selector={(state) => state.isPristine}>
							{(isPristine) => (
								<Button type="submit" disabled={isPristine}>
									Update
								</Button>
							)}
						</form.Subscribe>
					</div>
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
							<span className="text-amber-600 text-sm">
								<TriangleAlertIcon
									className="-mt-0.5 mr-2 inline-flex size-4 text-amber-500"
									strokeWidth={2}
									aria-hidden="true"
								/>
								This action cannot be undone.
							</span>
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
	const context = use(DeleteContext);
	const { slug } = routeApi.useParams();
	const mutation = useDeleteWorkspace();

	const form = useAppForm({
		defaultValues: {
			confirm: "",
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
			context?.setOpen(false);
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField
					name="confirm"
					validators={{
						onSubmit: ({ value }) => {
							if (!value) return "Required";
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
	CreateWorkspaceDialog,
	CreateWorkspaceDialogTrigger,
	CreateWorkspaceForm,
	UpdateWorkspaceForm,
	DeleteWorkspaceDialog,
	DeleteWorkspaceTrigger,
	DeleteWorkspaceForm,
	UpdateWorkspaceMetadataForm,
};
