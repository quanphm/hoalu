import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { HotKeyWithTooltip } from "./hotkey";

function CreateCategoryDialog({ children }: { children: React.ReactNode }) {
	return (
		<Dialog>
			{children}
			<DialogContent
				className="sm:max-w-[480px]"
				onCloseAutoFocus={(event) => {
					event.preventDefault();
				}}
			>
				<DialogHeader>
					<DialogTitle>Create new category</DialogTitle>
				</DialogHeader>
				<DialogDescription />
				{/* <CreateWalletForm /> */}
			</DialogContent>
		</Dialog>
	);
}

function CreateCategoryDialogTrigger({ children }: { children: React.ReactNode }) {
	return (
		<DialogTrigger asChild>
			<HotKeyWithTooltip shortcut={KEYBOARD_SHORTCUTS.create_category.label}>
				{children}
			</HotKeyWithTooltip>
		</DialogTrigger>
	);
}

export { CreateCategoryDialog, CreateCategoryDialogTrigger };
