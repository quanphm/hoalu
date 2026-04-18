import { scanReceiptDialogAtom } from "#app/atoms/dialogs.ts";
import { ReceiptScanner } from "#app/components/receipt/receipt-scanner.tsx";
import { MAX_QUEUE_SIZE } from "#app/helpers/constants.ts";
import { ScanIcon } from "@hoalu/icons/tabler";
import { Button, type ButtonProps } from "@hoalu/ui/button";
import {
	DialogDescription,
	DialogHeader,
	DialogHeaderAction,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { useSetAtom } from "jotai";

export function ScanReceiptDialogTrigger(props: ButtonProps) {
	const setScanDialog = useSetAtom(scanReceiptDialogAtom);

	return (
		<Button size="sm" variant="outline" {...props} onClick={() => setScanDialog({ state: true })}>
			<ScanIcon className="text-yellow-500" />
			Scan receipt
		</Button>
	);
}

export function ScanReceiptDialogContent() {
	return (
		<DialogPopup className="max-h-[92vh] overflow-y-scroll sm:max-w-md">
			<DialogHeader>
				<DialogTitle>Scan Receipts</DialogTitle>
				<DialogDescription>
					Upload photos or PDFs of your receipts to automatically extract expense details. Up to{" "}
					{MAX_QUEUE_SIZE} files can be uploaded at once.
				</DialogDescription>
				<DialogHeaderAction />
			</DialogHeader>
			<ReceiptScanner />
		</DialogPopup>
	);
}
