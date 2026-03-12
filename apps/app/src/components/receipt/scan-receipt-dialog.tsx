import { scanReceiptDialogAtom } from "#app/atoms/dialogs.ts";
import { ReceiptReview } from "#app/components/receipt/receipt-review.tsx";
import { ReceiptScanFallback } from "#app/components/receipt/receipt-scan-fallback.tsx";
import { ReceiptScanner } from "#app/components/receipt/receipt-scanner.tsx";
import type { ReceiptScanResult } from "#app/hooks/use-receipt-scan.ts";
import { ScanIcon } from "@hoalu/icons/tabler";
import { Button, type ButtonProps } from "@hoalu/ui/button";
import { DialogDescription, DialogHeader, DialogPopup, DialogTitle } from "@hoalu/ui/dialog";
import { useSetAtom } from "jotai";
import { useState } from "react";

export function ScanReceiptDialogTrigger(props: ButtonProps) {
	const setScanDialog = useSetAtom(scanReceiptDialogAtom);

	return (
		<Button variant="outline" {...props} onClick={() => setScanDialog({ state: true })}>
			<ScanIcon className="mr-2 size-4" />
			Scan receipt
		</Button>
	);
}

export function ScanReceiptDialogContent() {
	const [scanResults, setScanResults] = useState<ReceiptScanResult[] | null>(null);
	const [failureFiles, setFailureFiles] = useState<File[] | null>(null);

	const handleScanSuccess = (results: ReceiptScanResult[]) => {
		setScanResults(results);
	};

	const handleScanFailure = (files: File[]) => {
		setFailureFiles(files);
	};

	const handleClose = () => {
		setScanResults(null);
		setFailureFiles(null);
	};

	if (scanResults) {
		return (
			<DialogPopup className="max-h-[92vh] overflow-y-scroll sm:max-w-[750px]">
				<ReceiptReview results={scanResults} onBack={handleClose} />
			</DialogPopup>
		);
	}

	if (failureFiles) {
		return (
			<DialogPopup className="sm:max-w-md">
				<ReceiptScanFallback failureFiles={failureFiles} onBack={handleClose} />
			</DialogPopup>
		);
	}

	return (
		<DialogPopup className="max-h-[92vh] overflow-y-scroll sm:max-w-md">
			<DialogHeader>
				<DialogTitle>Scan Receipts</DialogTitle>
				<DialogDescription>
					Upload photos or PDFs of your receipts to automatically extract expense details. You can
					scan up to 10 attachments at once.
				</DialogDescription>
			</DialogHeader>
			<ReceiptScanner onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} />
		</DialogPopup>
	);
}
