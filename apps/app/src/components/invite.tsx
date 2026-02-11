import { useAppForm } from "#app/components/forms/index.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { authClient } from "#app/lib/auth-client.ts";
import { workspaceKeys } from "#app/lib/query-key-factory.ts";
import { InviteFormSchema } from "#app/lib/schema.ts";
import { MailPlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { Field, FieldGroup } from "@hoalu/ui/field";
import { toastManager } from "@hoalu/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function InviteDialog() {
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
						toastManager.add({
							title: "Invitation sent.",
							type: "success",
						});
						queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(workspace.slug) });
						form.reset();
						setOpen(false);
					},
					onError: (ctx) => {
						toastManager.add({
							title: "Uh oh! Something went wrong.",
							description: ctx.error.message,
							type: "error",
						});
					},
				},
			);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button variant="outline" />}>
				<MailPlusIcon className="size-4" />
				Invite people
			</DialogTrigger>
			<DialogContent className="sm:max-w-[480px]" aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>Invite people to your workspace</DialogTitle>
				</DialogHeader>
				<form.AppForm>
					<form.Form>
						<FieldGroup>
							<form.AppField
								name="email"
								children={(field) => <field.InputField label="Email" />}
							/>
						</FieldGroup>
						<DialogFooter>
							<Field className="ml-auto w-fit">
								<form.SubscribeButton>Send invite</form.SubscribeButton>
							</Field>
						</DialogFooter>
					</form.Form>
				</form.AppForm>
			</DialogContent>
		</Dialog>
	);
}
