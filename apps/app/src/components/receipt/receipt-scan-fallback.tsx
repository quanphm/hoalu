import { useSetAtom } from "jotai";

import { createExpenseDialogAtom, scanReceiptDialogAtom } from "#app/atoms/dialogs.ts";
import { AlertCircleIcon, ImageIcon } from "@hoalu/icons/lucide";
import { Alert, AlertDescription, AlertTitle } from "@hoalu/ui/alert";
import { Button } from "@hoalu/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@hoalu/ui/dialog";

interface ReceiptScanFallbackProps {
	failureFiles: File[];
	onBack: () => void;
}

export function ReceiptScanFallback({ failureFiles, onBack }: ReceiptScanFallbackProps) {
	const setScanDialog = useSetAtom(scanReceiptDialogAtom);
	const setCreateDialog = useSetAtom(createExpenseDialogAtom);

	const handleEnterManually = () => {
		setScanDialog({ state: false });
		setCreateDialog({ state: true });
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>Could Not Read Receipt{failureFiles.length > 1 ? "s" : ""}</DialogTitle>
				<DialogDescription>
					{failureFiles.length > 1
						? `We couldn't extract information from any of the ${failureFiles.length} attachments automatically.`
						: "We couldn't extract information from this attachment automatically."}
				</DialogDescription>
			</DialogHeader>

			<div className="space-y-4">
				<Alert>
					<AlertCircleIcon className="size-4" />
					<AlertTitle>Tips for better results</AlertTitle>
					<AlertDescription>
						<ul className="mt-2 list-inside list-disc space-y-1 text-sm">
							<li>Ensure the receipt is clear and well-lit</li>
							<li>All text should be readable</li>
							<li>The total amount must be visible</li>
							<li>Avoid crumpled or damaged receipts</li>
							<li>For PDFs, ensure the text layer is present (not scanned images)</li>
						</ul>
					</AlertDescription>
				</Alert>

				{failureFiles.length > 0 && (
					<div className="space-y-2">
						<p className="text-sm font-medium">
							{failureFiles.length} file{failureFiles.length > 1 ? "s" : ""} uploaded
						</p>
						<div className="flex flex-wrap gap-2">
							{failureFiles.map((file, idx) => (
								<div
									key={`${file.name}-${idx}`}
									className="border-muted bg-muted/50 flex items-center gap-1.5 rounded-md border px-2 py-1"
								>
									<ImageIcon className="text-muted-foreground size-3.5 flex-shrink-0" />
									<span className="text-muted-foreground max-w-[120px] truncate text-xs">
										{file.name}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			<DialogFooter>
				<Button variant="ghost" onClick={onBack}>
					Back
				</Button>
				<Button onClick={handleEnterManually}>Enter Manually</Button>
			</DialogFooter>
		</>
	);
}
