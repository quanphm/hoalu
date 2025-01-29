import { HookForm, HookFormInput, HookFormInputWithPrefix } from "@/components/hook-forms";
import { authClient } from "@/lib/auth-client";
import { CreateWorkspaceFormSchema, type WorkspaceInputSchema } from "@/lib/schema";
import { slugify } from "@hoalu/common/slugify";
import { Button } from "@hoalu/ui/button";
import { toast } from "@hoalu/ui/sonner";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";

export function CreateWorkspaceForm() {
	const id = useId();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const form = useForm<WorkspaceInputSchema>({
		resolver: valibotResolver(CreateWorkspaceFormSchema),
		values: {
			name: "",
			slug: "",
		},
	});
	const { watch, setValue } = form;
	const watchName = watch("name");

	async function onSubmit(values: WorkspaceInputSchema) {
		await authClient.workspace.create(values, {
			onSuccess: (ctx) => {
				toast.success("🎉 Workspace created.");
				queryClient.invalidateQueries({
					queryKey: ["workspaces"],
				});
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
