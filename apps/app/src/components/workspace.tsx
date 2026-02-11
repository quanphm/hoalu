import { createWorkspaceDialogAtom, deleteWorkspaceDialogAtom } from "#app/atoms/index.ts";
import { useAppForm } from "#app/components/forms/index.tsx";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { AVAILABLE_CURRENCY_OPTIONS } from "#app/helpers/constants.ts";
import { extractLetterFromName } from "#app/helpers/extract-letter-from-name.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { authClient } from "#app/lib/auth-client.ts";
import { WorkspaceFormSchema, WorkspaceMetadataFormSchema } from "#app/lib/schema.ts";
import {
	useCreateWorkspace,
	useDeleteWorkspace,
	useEditWorkspace,
	useEditWorkspaceMetadata,
} from "#app/services/mutations.ts";
import { workspaceLogoOptions } from "#app/services/query-options.ts";
import { slugify } from "@hoalu/common/slugify";
import { tryCatch } from "@hoalu/common/try-catch";
import { Avatar, AvatarFallback, AvatarImage } from "@hoalu/ui/avatar";
import { Button } from "@hoalu/ui/button";
import { DialogHeader, DialogPopup, DialogTitle } from "@hoalu/ui/dialog";
import { Field, FieldGroup } from "@hoalu/ui/field";
import { cn } from "@hoalu/ui/utils";
import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";
import { useSetAtom } from "jotai";

const routeApi = getRouteApi("/_dashboard/$slug");

export function CreateWorkspaceDialogContent() {
	return (
		<DialogPopup className="sm:max-w-[500px]">
			<DialogHeader>
				<DialogTitle>Create a new workspace</DialogTitle>
			</DialogHeader>
			<CreateWorkspaceForm />
		</DialogPopup>
	);
}

export function CreateWorkspaceForm() {
	const mutation = useCreateWorkspace();
	const setDialog = useSetAtom(createWorkspaceDialogAtom);

	const form = useAppForm({
		defaultValues: {
			name: "",
			slug: "",
			currency: "USD",
		},
		validators: {
			onSubmit: WorkspaceFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({ payload: value });
			setDialog({ state: false });
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
					children={(field) => (
						<field.InputField
							label="Workspace name"
							required
							autoComplete="off"
							placeholder="Acme Inc."
						/>
					)}
				/>
				<form.AppField
					name="slug"
					children={(field) => (
						<field.InputWithPrefixField
							label="Workspace URL"
							placeholder="acme-inc-42"
							description="lowercase letters (a-z), numbers (0-9) and hyphens (-)"
							pattern="[a-z0-9\-]+$"
							required
							autoComplete="off"
						/>
					)}
				/>
				<form.AppField
					name="currency"
					children={(field) => (
						<field.SelectWithSearchField
							label="Workspace currency"
							description="This will determine how monetary values appear in your dashboard"
							options={AVAILABLE_CURRENCY_OPTIONS}
						/>
					)}
				/>
				<form.SubscribeButton className="ml-auto w-fit">Create workspace</form.SubscribeButton>
			</form.Form>
		</form.AppForm>
	);
}

export function EditWorkspaceForm({ canEdit }: { canEdit: boolean }) {
	const workspace = useWorkspace();
	const mutation = useEditWorkspace();

	const form = useAppForm({
		defaultValues: {
			name: workspace.name,
			slug: workspace.slug,
		},
		validators: {
			onSubmit: WorkspaceFormSchema.omit({ currency: true }),
			onSubmitAsync: async ({ value }) => {
				if (value.slug === workspace.slug) {
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
			if (!canEdit) return;
			const { error } = await tryCatch.async(mutation.mutateAsync({ payload: value }));
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
				<FieldGroup>
					<form.AppField
						name="name"
						listeners={{
							onChange: ({ value }) => {
								form.setFieldValue("slug", slugify(value));
							},
						}}
						children={(field) => (
							<field.InputField
								label="Workspace name"
								autoComplete="off"
								placeholder="Acme Inc."
								disabled={!canEdit}
							/>
						)}
					/>
					<form.AppField
						name="slug"
						children={(field) => (
							<field.InputWithPrefixField
								label="Workspace URL"
								placeholder="acme-inc-42"
								description={
									canEdit ? "lowercase letters (a-z), numbers (0-9) and hyphens (-)" : ""
								}
								pattern="[a-z0-9\-]+$"
								required
								autoComplete="off"
								disabled={!canEdit}
							/>
						)}
					/>
				</FieldGroup>
				{canEdit && (
					<Field orientation="horizontal" className="justify-end">
						<Button variant="ghost" type="button" onClick={() => form.reset()}>
							Reset
						</Button>
						<form.SubscribeButton>Update</form.SubscribeButton>
					</Field>
				)}
			</form.Form>
		</form.AppForm>
	);
}

export function EditWorkspaceMetadataForm({ canEdit }: { canEdit: boolean }) {
	const workspace = useWorkspace();
	const mutation = useEditWorkspaceMetadata();

	const form = useAppForm({
		defaultValues: {
			currency: workspace.metadata.currency as string,
		},
		validators: {
			onSubmit: WorkspaceMetadataFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (!canEdit) return;
			await tryCatch.async(mutation.mutateAsync({ payload: value }));
			form.reset();
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<FieldGroup>
					<form.AppField
						name="currency"
						children={(field) => (
							<field.SelectWithSearchField
								label="Default currency"
								description="This will determine how monetary values appear in your dashboard"
								options={AVAILABLE_CURRENCY_OPTIONS}
								disabled={!canEdit}
							/>
						)}
					/>
				</FieldGroup>
				{canEdit && (
					<Field orientation="horizontal" className="justify-end">
						<Button variant="ghost" type="button" onClick={() => form.reset()}>
							Reset
						</Button>
						<form.SubscribeButton>Update</form.SubscribeButton>
					</Field>
				)}
			</form.Form>
		</form.AppForm>
	);
}

export function DeleteWorkspaceDialogContent() {
	return (
		<DialogPopup className="sm:max-w-[400px]">
			<DialogHeader className="space-y-3">
				<DialogTitle>Confirm delete workspace</DialogTitle>
				<WarningMessage>
					This action cannot be undone. This will permanently delete the whole workspace and all of
					its data.
				</WarningMessage>
			</DialogHeader>
			<DeleteWorkspaceForm />
		</DialogPopup>
	);
}

function DeleteWorkspaceForm() {
	const { slug } = routeApi.useParams();
	const mutation = useDeleteWorkspace();
	const setDialog = useSetAtom(deleteWorkspaceDialogAtom);

	const form = useAppForm({
		defaultValues: {
			confirm: "",
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
			setDialog({ state: false });
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<FieldGroup>
					<form.AppField
						name="confirm"
						validators={{
							onSubmit: ({ value }) => {
								if (!value) return "Required";
								return value !== slug ? "Incorrect value" : undefined;
							},
						}}
						children={(field) => (
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
					/>
				</FieldGroup>
				<Field>
					<form.SubscribeButton variant="destructive">
						I understand, delete this workspace
					</form.SubscribeButton>
				</Field>
			</form.Form>
		</form.AppForm>
	);
}

const workspaceAvatarVariants = cva("outline-border outline", {
	variants: {
		size: {
			default: "size-8",
			lg: "size-14 text-xl",
			sm: "size-6 text-[9px]",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

interface Props {
	logo?: string | null | undefined;
	name: string;
	className?: string;
}

export function WorkspaceLogo({
	logo,
	name,
	size,
	className,
}: Props & VariantProps<typeof workspaceAvatarVariants>) {
	const workspaceShortName = extractLetterFromName(name);
	return (
		<Avatar className={cn(workspaceAvatarVariants({ size, className }))}>
			{logo && <AvatarImage src={logo} alt={name} />}
			<AvatarFallback className={cn(workspaceAvatarVariants({ size }))}>
				{workspaceShortName}
			</AvatarFallback>
		</Avatar>
	);
}

export function S3WorkspaceLogo({
	slug,
	logo = undefined,
	...props
}: Props & VariantProps<typeof workspaceAvatarVariants> & { slug: string }) {
	const { data } = useQuery(workspaceLogoOptions(slug, logo));
	return <WorkspaceLogo {...props} logo={data} />;
}
