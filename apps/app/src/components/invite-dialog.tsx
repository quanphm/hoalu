import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@hoalu/ui/dialog";
import { InviteForm } from "./invite-form";

export function InviteDialog({ children }: { children: React.ReactNode }) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Invite to your workspace</DialogTitle>
				</DialogHeader>
				<InviteForm />
			</DialogContent>
		</Dialog>
	);
}
