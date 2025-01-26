import { HookForm, HookFormInput, HookFormInputWithPrefix } from "@/components/hook-forms";
import { PageContent } from "@/components/layouts/page-content";
import { WorkspaceCard } from "@/components/workspace-card";
import { authClient } from "@/lib/auth-client";
import { WorkspaceFormSchema, type WorkspaceInputSchema } from "@/lib/schema";
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
		<PageContent
			header={<p className="scroll-m-20 font-semibold text-3xl tracking-tight">Workspaces</p>}
		>
			<div className="grid grid-cols-3 gap-6">
				{workspaces.length === 0 && (
					<div className="col-span-2 flex flex-col">
						<h3 className="mb-4 scroll-m-20 font-semibold text-2xl">Create a new workspace</h3>
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
									label="Workspace slug"
									name="slug"
									required
									autoComplete="off"
									placeholder="acme"
								/>
								<Button type="submit" className="ml-auto w-fit">
									Create
								</Button>
							</div>
						</HookForm>
					</div>
				)}
				{workspaces.length > 0 && workspaces.map((ws) => <WorkspaceCard key={ws.id} {...ws} />)}
			</div>
		</PageContent>
	);
}
