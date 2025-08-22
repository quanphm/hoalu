import { useAtom } from "jotai";

import { X } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@hoalu/ui/sheet";
import { closeMobileSheetAtom, type MobileSheetContent, mobileSheetStateAtom } from "@/atoms";

// Placeholder content components - TODO: Implement these
const WorkspaceSwitcherContent = () => <div>Workspace Switcher - TODO</div>;
const ProfileContent = () => <div>Profile Content - TODO</div>;

/**
 * Mobile sheet component for modals, drawers, and contextual content
 * Provides a slide-up interface for forms, details, and settings
 */
export function MobileSheet() {
	const [sheetState] = useAtom(mobileSheetStateAtom);
	const [, closeSheet] = useAtom(closeMobileSheetAtom);

	const renderSheetContent = (content: MobileSheetContent) => {
		switch (content) {
			case "workspace-switcher":
				return <WorkspaceSwitcherContent />;
			case "profile":
				return <ProfileContent />;
			case "filters":
				return <div>Filters content - TODO</div>;
			case "expense-details":
				return <div>Expense details content - TODO</div>;
			case "expense-actions":
				return <div>Expense actions content - TODO</div>;
			default:
				return <div>Unknown content type</div>;
		}
	};

	return (
		<Sheet
			open={sheetState.isOpen}
			onOpenChange={(open) => {
				if (!open) closeSheet();
			}}
		>
			<SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-xl">
				<SheetHeader className="text-left">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<SheetTitle className="font-semibold text-lg">
								{sheetState.title || "Sheet"}
							</SheetTitle>
							<SheetDescription className="sr-only">Mobile sheet content</SheetDescription>
						</div>
						<Button variant="ghost" size="sm" onClick={closeSheet} className="h-8 w-8 p-0">
							<X className="h-4 w-4" />
							<span className="sr-only">Close</span>
						</Button>
					</div>
				</SheetHeader>

				<div className="mt-4">{sheetState.content && renderSheetContent(sheetState.content)}</div>
			</SheetContent>
		</Sheet>
	);
}

/**
 * Mobile action sheet for quick actions and confirmations
 */
export function MobileActionSheet({
	isOpen,
	onClose,
	title,
	actions,
	children,
}: {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	actions?: Array<{
		label: string;
		onClick: () => void;
		variant?: "default" | "destructive" | "outline";
	}>;
	children?: React.ReactNode;
}) {
	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent side="bottom" className="max-h-[50vh] rounded-t-xl">
				{title && (
					<SheetHeader>
						<SheetTitle>{title}</SheetTitle>
					</SheetHeader>
				)}

				<div className="mt-4 space-y-4">
					{children}

					{actions && (
						<div className="flex flex-col gap-2">
							{actions.map((action, index) => (
								<Button
									key={index}
									variant={action.variant || "default"}
									onClick={() => {
										action.onClick();
										onClose();
									}}
									className="justify-center"
								>
									{action.label}
								</Button>
							))}
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
