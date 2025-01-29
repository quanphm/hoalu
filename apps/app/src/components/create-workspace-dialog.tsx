import { CreateWorkspaceForm } from "@/components/create-workspace-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";

export function CreateWorkspaceDialog({ children }: { children: React.ReactNode }) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[540px]">
				<DialogHeader>
					<DialogTitle>Create a new workspace</DialogTitle>
					<DialogDescription>
						Workspaces are shared environments where members can interact with content together.
					</DialogDescription>
				</DialogHeader>
				<CreateWorkspaceForm />
			</DialogContent>
		</Dialog>
	);
}
