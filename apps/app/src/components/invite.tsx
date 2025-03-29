import { useAppForm } from "@/components/forms";
import { useWorkspace } from "@/hooks/use-workspace";
import { authClient } from "@/lib/auth-client";
import { InviteFormSchema } from "@/lib/schema";
import { workspaceKeys } from "@/services/query-key-factory";
import { Button } from "@hoalu/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@hoalu/ui/dialog";
import { DialogFooter } from "@hoalu/ui/dialog";
import { toast } from "@hoalu/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";

export function InviteDialog({ children }: { children: React.ReactNode }) {
	const id = useId();
	const [open, setOpen] = useState(false);
	const workspace = useWorkspace();
	const queryClient = useQueryClient();

	const form = useAppForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onSubmit: InviteFormSchema,
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
						form.reset();
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
					<DialogTitle>Invite people to your workspace</DialogTitle>
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
