import { HookForm, HookFormInput } from "@/components/hook-forms";
import { authClient } from "@/lib/auth-client";
import { DeleteWorkspaceFormSchema, type DeleteWorkspaceInputSchema } from "@/lib/schema";
import { workspaceKeys } from "@/services/query-key-factory";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { toast } from "@hoalu/ui/sonner";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { createContext, use, useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type Context = {
	open: boolean;
	setOpen: (open: boolean) => void;
};

const Context = createContext<Context | null>(null);

function DeleteWorkspaceDialog({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const contextValue = useMemo<Context>(
		() => ({
			open,
			setOpen,
		}),
		[open],
	);

	return (
		<Context value={contextValue}>
			<Dialog open={open} onOpenChange={setOpen}>
				{children}
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle>Confirm delete workspace</DialogTitle>
						<DialogDescription>This action cannot be undone.</DialogDescription>
					</DialogHeader>
					<DeleteWorkspaceForm />
				</DialogContent>
			</Dialog>
		</Context>
	);
}

function DeleteWorkspaceTrigger({ children }: { children: React.ReactNode }) {
	return <DialogTrigger asChild>{children}</DialogTrigger>;
}

function DeleteWorkspaceForm() {
	const id = useId();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug/settings" });
	const context = use(Context);

	const form = useForm<DeleteWorkspaceInputSchema>({
		resolver: valibotResolver(DeleteWorkspaceFormSchema),
		values: { confirm: "" },
		reValidateMode: "onSubmit",
	});

	async function onSubmit(values: DeleteWorkspaceInputSchema) {
		if (values.confirm !== slug) {
			form.setError("confirm", { type: "required", message: "Incorrect value" });
			return;
		}

		await authClient.workspace.delete(
			{ idOrSlug: values.confirm },
			{
				onSuccess: () => {
					toast.success("Workspace deleted.");
					queryClient.invalidateQueries({
						queryKey: workspaceKeys.all,
					});
					if (context) {
						context.setOpen(false);
					}
					navigate({ to: "/" });
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
			},
		);
	}

	return (
		<HookForm id={id} form={form} onSubmit={onSubmit}>
			<div className="grid gap-6 pt-2">
				<HookFormInput
					label={
						<span className="text-muted-foreground">
							Type in <strong className="text-foreground">{slug}</strong> to confirm.
						</span>
					}
					name="confirm"
					required
					autoComplete="off"
				/>
				<Button variant="destructive" type="submit" form={id}>
					I understand, delete this workspace
				</Button>
			</div>
		</HookForm>
	);
}

export { DeleteWorkspaceDialog, DeleteWorkspaceTrigger, DeleteWorkspaceForm };
