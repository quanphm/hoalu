import { HookForm, HookFormInput, HookFormInputWithPrefix } from "@/components/hook-forms";
import { authClient } from "@/lib/auth-client";
import { WorkspaceFormSchema, type WorkspaceInputSchema } from "@/lib/schema";
import { HTTPStatus } from "@hoalu/common/http-status";
import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import { toast } from "@hoalu/ui/sonner";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

export const Route = createFileRoute("/_dashboard/")({
	beforeLoad: async ({ context: { session } }) => {
		const { data: workspaces } = await authClient.workspace.list();

		if (workspaces && workspaces.length > 0) {
			const workspaceFromSession = workspaces.find((ws) => ws.id === session?.activeWorkspaceId);
			const selectedWorkspace = workspaceFromSession || workspaces[0];
			await authClient.workspace.setActive({ workspaceId: selectedWorkspace.id });

			redirect({
				statusCode: HTTPStatus.codes.TEMPORARY_REDIRECT,
				to: "/$slug",
				params: {
					slug: selectedWorkspace.slug,
				},
				throw: true,
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
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
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Create a new workspace</CardTitle>
				</CardHeader>
				<CardContent>
					<HookForm form={form} onSubmit={onSubmit}>
						<div className="grid gap-6">
							<div className="grid gap-6">
								<HookFormInput
									label="Workspace Name"
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
								<Button type="submit" className="w-full">
									Create workspace
								</Button>
							</div>
						</div>
					</HookForm>
				</CardContent>
			</Card>
		</div>
	);
}
