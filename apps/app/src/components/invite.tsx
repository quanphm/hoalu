import { HookForm, HookFormInput } from "@/components/hook-forms";
import { authClient } from "@/lib/auth-client";
import { inviteSchema } from "@/lib/schema";
import { workspaceKeys } from "@/services/query-key-factory";
import { Button } from "@hoalu/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@hoalu/ui/dialog";
import { DialogFooter } from "@hoalu/ui/dialog";
import { toast } from "@hoalu/ui/sonner";
import { arktypeResolver } from "@hookform/resolvers/arktype";
import { useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";

const routeApi = getRouteApi("/_dashboard/$slug");

export function InviteDialog({ children }: { children: React.ReactNode }) {
	const id = useId();
	const [open, setOpen] = useState(false);
	const { workspace } = routeApi.useLoaderData();
	const queryClient = useQueryClient();

	const form = useForm<typeof inviteSchema.infer>({
		resolver: arktypeResolver(inviteSchema),
		values: {
			email: "",
		},
	});

	async function onSubmit(values: typeof inviteSchema.infer) {
		await authClient.workspace.inviteMember(
			{
				email: values.email,
				idOrSlug: workspace.publicId,
				role: "member",
			},
			{
				onSuccess: () => {
					toast.success("Invite sent");
					queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(workspace.slug) });
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
			<DialogContent className="sm:max-w-[480px]" aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>Invite to your workspace</DialogTitle>
				</DialogHeader>
				<HookForm id={id} form={form} onSubmit={onSubmit}>
					<HookFormInput label="Email" name="email" autoFocus />
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
