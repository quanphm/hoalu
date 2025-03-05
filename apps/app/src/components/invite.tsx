import { useAppForm } from "@/components/forms";
import { authClient } from "@/lib/auth-client";
import { inviteSchema } from "@/lib/schema";
import { workspaceKeys } from "@/services/query-key-factory";
import { getWorkspaceDetailsOptions } from "@/services/query-options";
import { Button } from "@hoalu/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@hoalu/ui/dialog";
import { DialogFooter } from "@hoalu/ui/dialog";
import { toast } from "@hoalu/ui/sonner";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useId, useState } from "react";

const routeApi = getRouteApi("/_dashboard/$slug");

export function InviteDialog({ children }: { children: React.ReactNode }) {
	const id = useId();
	const [open, setOpen] = useState(false);
	const { slug } = routeApi.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));
	const queryClient = useQueryClient();

	const form = useAppForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onSubmit: inviteSchema,
		},
		onSubmit: async ({ value }) => {
			await authClient.workspace.inviteMember(
				{
					email: value.email,
					idOrSlug: workspace.slug,
					role: "member",
				},
				{
					onSuccess: () => {
						toast.success("Invitation sent");
						queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(workspace.slug) });
						setOpen(false);
					},
					onError: (ctx) => {
						toast.error(ctx.error.message);
					},
				},
			);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[480px]" aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>Invite to your workspace</DialogTitle>
				</DialogHeader>

				<form.AppForm>
					<form.Form id={id}>
						<form.AppField name="email">
							{(field) => <field.InputField label="Email" autoFocus />}
						</form.AppField>
					</form.Form>
				</form.AppForm>
				<DialogFooter>
					<Button type="submit" form={id} className="ml-auto w-fit">
						Send invite
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
