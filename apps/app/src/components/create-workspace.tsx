import { HookForm, HookFormInput, HookFormInputWithPrefix } from "@/components/hook-forms";
import { authClient } from "@/lib/auth-client";
import { CreateWorkspaceFormSchema, type CreateWorkspaceInputSchema } from "@/lib/schema";
import { slugify } from "@hoalu/common/slugify";
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
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createContext, use, useEffect, useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type Context = {
	open: boolean;
	setOpen: (open: boolean) => void;
};

const Context = createContext<Context | null>(null);

function CreateWorkspaceDialog({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const contextValue = useMemo<Context>(
		() => ({
			open,
			setOpen,
		}),
		[open],
	);

	return (
		<Context value={contextValue}>
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
		</Context>
	);
}

function CreateWorkspaceDialogTrigger({ children }: { children: React.ReactNode }) {
	return <DialogTrigger asChild>{children}</DialogTrigger>;
}

function CreateWorkspaceForm() {
	const id = useId();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const context = use(Context);

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
				toast.success("🎉 Workspace created.");
				queryClient.invalidateQueries({
					queryKey: ["workspaces"],
				});
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
			<div className="grid gap-6">
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
			</div>
		</HookForm>
	);
}

export { CreateWorkspaceDialog, CreateWorkspaceDialogTrigger, CreateWorkspaceForm };
