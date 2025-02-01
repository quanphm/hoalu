import { HookForm, HookFormInput } from "@/components/hook-forms";
import { authClient } from "@/lib/auth-client";
import { InviteFormSchema, type InviteInputSchema } from "@/lib/schema";
import { Button } from "@hoalu/ui/button";
import { DialogFooter } from "@hoalu/ui/dialog";
import { toast } from "@hoalu/ui/sonner";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useLoaderData } from "@tanstack/react-router";
import { useId } from "react";
import { useForm } from "react-hook-form";

export function InviteForm() {
	const id = useId();
	const { workspace } = useLoaderData({ from: "/_dashboard/$slug" });

	const form = useForm<InviteInputSchema>({
		resolver: valibotResolver(InviteFormSchema),
		values: {
			email: "",
		},
	});

	async function onSubmit(values: InviteInputSchema) {
		await authClient.workspace.inviteMember(
			{
				email: values.email,
				role: "member",
				workspacePublicId: workspace.publicId,
			},
			{
				onSuccess: () => {
					toast.success("🎉 Invite sent.");
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
			},
		);
	}

	return (
		<>
			<HookForm id={id} form={form} onSubmit={onSubmit}>
				<div className="grid gap-6">
					<HookFormInput label="Email" name="email" autoFocus required autoComplete="off" />
				</div>
			</HookForm>
			<DialogFooter>
				<Button type="submit" form={id} className="ml-auto w-fit">
					Send invite
				</Button>
			</DialogFooter>
		</>
	);
}
