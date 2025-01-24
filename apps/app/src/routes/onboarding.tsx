import { HookForm, HookFormInput, HookFormInputWithPrefix } from "@/components/hook-forms";
import { SuperCenteredLayout } from "@/components/layouts/super-centered-layout";
import { authClient } from "@/lib/auth-client";
import { WorkspaceFormSchema, type WorkspaceInputSchema } from "@/lib/schema";
import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import { toast } from "@hoalu/ui/sonner";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

export const Route = createFileRoute("/onboarding")({
	beforeLoad: async ({ context: { user } }) => {
		if (!user) {
			throw redirect({ to: "/login" });
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
		<SuperCenteredLayout className="max-w-md">
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
		</SuperCenteredLayout>
	);
}
