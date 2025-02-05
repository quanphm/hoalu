import { HookForm, HookFormInput, HookFormInputWithPrefix } from "@/components/hook-forms";
import { authClient } from "@/lib/auth-client";
import { DeleteWorkspaceFormSchema, type DeleteWorkspaceInputSchema } from "@/lib/schema";
import { CreateWorkspaceFormSchema, type CreateWorkspaceInputSchema } from "@/lib/schema";
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
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { createContext, use, useEffect, useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

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
	const id = useId();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const context = use(CreateContext);

	const form = useForm<CreateWorkspaceInputSchema>({
		resolver: valibotResolver(CreateWorkspaceFormSchema),
		values: {
			name: "",
			slug: "",
		},
	});
	const { watch, setValue } = form;
	const watchName = watch("name");

	async function onSubmit(values: CreateWorkspaceInputSchema) {
		await authClient.workspace.create(values, {
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
	}

	useEffect(() => {
		setValue("slug", slugify(watchName));
	}, [watchName, setValue]);

	return (
		<HookForm id={id} form={form} onSubmit={onSubmit}>
			<HookFormInput
				label="Workspace name"
				name="name"
				autoFocus
				required
				autoComplete="off"
				placeholder="Acme Inc."
			/>
			<HookFormInputWithPrefix
				label="Workspace URL"
				name="slug"
				pattern="[a-z0-9\-]+$"
				required
				autoComplete="off"
				placeholder="acme-inc-42"
				description="Use only lowercase letters (a-z), numbers (0-9) and hyphens (-)."
			/>
			<Button type="submit" form={id} className="ml-auto w-fit">
				Create workspace
			</Button>
		</HookForm>
	);
}

function UpdateWorkspaceForm() {
	const id = useId();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug/settings" });
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));

	const form = useForm<CreateWorkspaceInputSchema>({
		resolver: valibotResolver(CreateWorkspaceFormSchema),
		values: {
			name: workspace.name,
			slug: workspace.slug,
		},
	});

	async function onSubmit(values: CreateWorkspaceInputSchema) {
		await authClient.workspace.update(
			{
				data: {
					name: values.name,
					slug: values.slug,
				},
				idOrSlug: workspace.slug,
			},
			{
				onSuccess: () => {
					toast.success("Workspace updated");
					queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
					if (workspace.slug !== values.slug) {
						navigate({
							to: "/$slug",
							params: {
								slug: values.slug,
							},
						});
					}
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
			},
		);
	}

	return (
		<HookForm id={id} form={form} onSubmit={onSubmit}>
			<HookFormInput
				label="Workspace name"
				name="name"
				required
				autoComplete="off"
				placeholder="Acme Inc."
			/>
			<HookFormInputWithPrefix
				label="Workspace URL"
				name="slug"
				pattern="[a-z0-9\-]+$"
				required
				autoComplete="off"
				placeholder="acme-inc-42"
				description="Use only lowercase letters (a-z), numbers (0-9) and hyphens (-)."
			/>
			<Button type="submit" form={id} className="ml-auto w-fit">
				Update profile
			</Button>
		</HookForm>
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
								This action cannot be undone.
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
	const id = useId();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug/settings" });
	const context = use(DeleteContext);

	const form = useForm<DeleteWorkspaceInputSchema>({
		resolver: valibotResolver(DeleteWorkspaceFormSchema),
		values: { confirm: "" },
		reValidateMode: "onSubmit",
	});

	async function onSubmit(values: DeleteWorkspaceInputSchema) {
		if (values.confirm !== slug) {
			form.setError("confirm", { type: "required", message: "Incorrect value" });
			return;
		}

		await authClient.workspace.delete(
			{ idOrSlug: values.confirm },
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
	}

	return (
		<HookForm id={id} form={form} onSubmit={onSubmit}>
			<HookFormInput
				label={
					<span className="text-muted-foreground">
						Type in <strong className="text-foreground">{slug}</strong> to confirm.
					</span>
				}
				name="confirm"
				required
				autoComplete="off"
			/>
			<Button variant="destructive" type="submit" form={id}>
				I understand, delete this workspace
			</Button>
		</HookForm>
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
