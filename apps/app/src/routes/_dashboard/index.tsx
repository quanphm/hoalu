import { HookForm, HookFormInput, HookFormInputWithPrefix } from "@/components/hook-forms";
import { PageContent } from "@/components/layouts/page-content";
import { WorkspaceCard } from "@/components/workspace-card";
import { authClient } from "@/lib/auth-client";
import { WorkspaceFormSchema, type WorkspaceInputSchema } from "@/lib/schema";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { toast } from "@hoalu/ui/sonner";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { createFileRoute, useLoaderData, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

export const Route = createFileRoute("/_dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { workspaces } = useLoaderData({ from: "/_dashboard" });

	const form = useForm<WorkspaceInputSchema>({
		resolver: valibotResolver(WorkspaceFormSchema),
		values: {
			name: "",
			slug: "",
		},
	});

	async function onSubmit(values: WorkspaceInputSchema) {
		await authClient.workspace.create(values, {
			onSuccess: (ctx) => {
				toast.success("🎉 Workspace created.");
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

	return (
		<PageContent>
			<div className="flex flex-col gap-4">
				{workspaces.length > 0 && (
					<div className="flex max-w-full justify-between">
						<p className="font-semibold text-xl tracking-tight">Workspaces</p>
						<Button>
							<PlusIcon className="mr-2 size-4" /> Create workspace
						</Button>
					</div>
				)}
				<div className="grid grid-cols-3 gap-6">
					{workspaces.length === 0 && (
						<div className="col-span-2 flex flex-col">
							<h3 className="my-4 font-semibold text-xl">Create a new workspace</h3>
							<span className="mb-6 text-muted-foreground text-sm">
								Workspaces are shared environments where members share, manage and interact with
								content together.
							</span>
							<HookForm form={form} onSubmit={onSubmit}>
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
										required
										autoComplete="off"
										placeholder="acme"
									/>
									<Button type="submit" className="ml-auto w-fit">
										Create workspace
									</Button>
								</div>
							</HookForm>
						</div>
					)}
					{workspaces.length > 0 && workspaces.map((ws) => <WorkspaceCard key={ws.id} {...ws} />)}
				</div>
			</div>
		</PageContent>
	);
}
