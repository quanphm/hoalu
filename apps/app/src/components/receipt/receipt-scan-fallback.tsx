import { useSetAtom } from "jotai";

import { createExpenseDialogAtom, scanReceiptDialogAtom } from "#app/atoms/dialogs.ts";
import { AlertCircleIcon, ImageIcon } from "@hoalu/icons/lucide";
import { Alert, AlertDescription, AlertTitle } from "@hoalu/ui/alert";
import { Button } from "@hoalu/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@hoalu/ui/dialog";

interface ReceiptScanFallbackProps {
	originalFile: File | null;
	compressedBase64?: string;
	onBack: () => void;
}

export function ReceiptScanFallback({
	originalFile,
	compressedBase64,
	onBack,
}: ReceiptScanFallbackProps) {
	const setScanDialog = useSetAtom(scanReceiptDialogAtom);
	const setCreateDialog = useSetAtom(createExpenseDialogAtom);

	const handleEnterManually = () => {
		setScanDialog({ state: false });
		setCreateDialog({ state: true });
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>Could Not Read Receipt</DialogTitle>
				<DialogDescription>
					We couldn't extract information from this image automatically.
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
						</ul>
					</AlertDescription>
				</Alert>

				{(compressedBase64 || originalFile) && (
					<div className="space-y-2">
						<p className="text-sm font-medium">Your Image</p>
						<div className="border-muted overflow-hidden rounded-md border">
							{compressedBase64 ? (
								<img src={compressedBase64} alt="Receipt" className="h-auto w-full" />
							) : (
								<div className="flex aspect-[3/4] w-full items-center justify-center bg-muted">
									<ImageIcon className="text-muted-foreground size-12" />
								</div>
							)}
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
