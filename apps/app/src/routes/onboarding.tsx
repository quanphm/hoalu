import { SingleColumn } from "@/components/layouts/single-column";
import { authClient } from "@/lib/auth-client";
import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import { Input } from "@hoalu/ui/input";
import { Label } from "@hoalu/ui/label";
import { toast } from "@hoalu/ui/sonner";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

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

	async function formAction(formData: FormData) {
		const name = formData.get("name");
		const slug = formData.get("slug");

		if (!name || !slug) throw new Error("Workspace name or slug can not be empty");

		await authClient.workspace.create(
			{
				name: name.toString(),
				slug: slug.toString(),
			},
			{
				onSuccess: (ctx) => {
					toast.success("Workspace created.");
					navigate({
						to: "/ws/$slug",
						params: {
							slug: ctx.data.slug,
						},
					});
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
			},
		);
	}

	return (
		<SingleColumn>
			<div className="flex flex-col gap-6">
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Create a new workspace</CardTitle>
					</CardHeader>
					<CardContent>
						<form action={formAction}>
							<div className="grid gap-6">
								<div className="grid gap-6">
									<div className="grid gap-2">
										<Label htmlFor="name">Workspace Name</Label>
										<Input id="name" name="name" required autoComplete="off" />
									</div>
									<div className="grid gap-2">
										<Label htmlFor="slug">Workspace URL</Label>
										<Input id="slug" name="slug" required autoComplete="off" />
									</div>
									<Button type="submit" className="w-full">
										Create workspace
									</Button>
								</div>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</SingleColumn>
	);
}
