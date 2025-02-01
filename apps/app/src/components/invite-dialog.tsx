import { HookForm, HookFormInput } from "@/components/hook-forms";
import { authClient } from "@/lib/auth-client";
import { InviteFormSchema, type InviteInputSchema } from "@/lib/schema";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { DialogFooter } from "@hoalu/ui/dialog";
import { toast } from "@hoalu/ui/sonner";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useLoaderData } from "@tanstack/react-router";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";

export function InviteDialog({ children }: { children: React.ReactNode }) {
	const id = useId();
	const [open, setOpen] = useState(false);
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
				idOrSlug: workspace.publicId,
			},
			{
				onSuccess: () => {
					toast.success("🎉 Invite sent.");
					setOpen(false);
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Invite to your workspace</DialogTitle>
				</DialogHeader>
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
			</DialogContent>
		</Dialog>
	);
}
