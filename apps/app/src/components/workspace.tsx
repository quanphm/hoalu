import { useAppForm } from "@/components/forms";
import { WarningMessage } from "@/components/warning-message";
import { AVAILABLE_CURRENCY_OPTIONS } from "@/helpers/constants";
import { extractLetterFromName } from "@/helpers/extract-letter-from-name";
import { authClient } from "@/lib/auth-client";
import { workspaceFormSchema, workspaceMetadataFormSchema } from "@/lib/schema";
import {
	useCreateWorkspace,
	useDeleteWorkspace,
	useEditWorkspace,
	useEditWorkspaceMetadata,
} from "@/services/mutations";
import { getWorkspaceDetailsOptions } from "@/services/query-options";
import { slugify } from "@hoalu/common/slugify";
import { tryCatch } from "@hoalu/common/try-catch";
import { Avatar, AvatarFallback, AvatarImage } from "@hoalu/ui/avatar";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { type VariantProps, cva } from "class-variance-authority";
import { createContext, use, useMemo, useState } from "react";

const routeApi = getRouteApi("/_dashboard/$slug");

type CreateContext = {
	open: boolean;
	setOpen: (open: boolean) => void;
};
const CreateContext = createContext<CreateContext | null>(null);

function CreateWorkspaceDialog({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const contextValue = useMemo<CreateContext>(() => ({ open, setOpen }), [open]);

	return (
		<CreateContext value={contextValue}>
			<Dialog open={open} onOpenChange={setOpen}>
				{children}
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Create a new workspace</DialogTitle>
						<DialogDescription>
							Create a new workspace to establish a shared environment where members can collaborate
							on and manage content together.
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
			await mutation.mutateAsync({ payload: value });
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

function EditWorkspaceForm({ canEdit }: { canEdit: boolean }) {
	const { slug } = routeApi.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));
	const mutation = useEditWorkspace();

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
							disabled={!canEdit}
						/>
					)}
				</form.AppField>
				<form.AppField name="slug">
					{(field) => (
						<field.InputWithPrefixField
							label="Workspace URL"
							placeholder="acme-inc-42"
							description={
								canEdit ? "Use only lowercase letters (a-z), numbers (0-9) and hyphens (-)" : ""
							}
							pattern="[a-z0-9\-]+$"
							required
							autoComplete="off"
							disabled={!canEdit}
						/>
					)}
				</form.AppField>
				{canEdit && (
					<div className="ml-auto flex gap-2">
						<Button variant="ghost" type="button" onClick={() => form.reset()}>
							Reset
						</Button>
						<form.Subscribe selector={(state) => state.isPristine}>
							{(isPristine) => (
								<Button type="submit" disabled={isPristine}>
									Save
								</Button>
							)}
						</form.Subscribe>
					</div>
				)}
			</form.Form>
		</form.AppForm>
	);
}

function EditWorkspaceMetadataForm({ canEdit }: { canEdit: boolean }) {
	const { slug } = routeApi.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));
	const mutation = useEditWorkspaceMetadata();

	const form = useAppForm({
		defaultValues: {
			currency: workspace.metadata.currency as string,
		},
		validators: {
			onSubmit: workspaceMetadataFormSchema,
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
				<form.AppField name="currency">
					{(field) => (
						<field.SelectWithSearchField
							label="Default currency"
							description="This will determine how monetary values appear in your dashboard."
							options={AVAILABLE_CURRENCY_OPTIONS}
							disabled={!canEdit}
						/>
					)}
				</form.AppField>
				{canEdit && (
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
							<WarningMessage>
								This action cannot be undone. This will permanently delete the whole workspace and
								all of its data.
							</WarningMessage>
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

const workspaceAvatarVariants = cva("rounded-lg", {
	variants: {
		size: {
			default: "size-8",
			lg: "size-14 rounded-xl",
			sm: "size-6 rounded-sm",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

interface Props {
	logo: string | null | undefined;
	name: string | undefined;
	className?: string;
}

function WorkspaceAvatar({
	logo = undefined,
	name = "Hoa Lu",
	size,
	className,
}: Props & VariantProps<typeof workspaceAvatarVariants>) {
	const workspaceShortName = extractLetterFromName(name);
	return (
		<Avatar className={cn(workspaceAvatarVariants({ size, className }))}>
			<AvatarImage
				src={logo || `https://avatar.vercel.sh/${logo}.svg`}
				alt={name}
				className={cn(!logo && "grayscale")}
			/>
			<AvatarFallback className={cn(workspaceAvatarVariants({ size }))}>
				{workspaceShortName}
			</AvatarFallback>
		</Avatar>
	);
}

export {
	CreateWorkspaceDialog,
	CreateWorkspaceDialogTrigger,
	CreateWorkspaceForm,
	EditWorkspaceForm,
	DeleteWorkspaceDialog,
	DeleteWorkspaceTrigger,
	EditWorkspaceMetadataForm,
	WorkspaceAvatar,
};
