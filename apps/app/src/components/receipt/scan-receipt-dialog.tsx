import { scanReceiptDialogAtom } from "#app/atoms/dialogs.ts";
import { ReceiptReview } from "#app/components/receipt/receipt-review.tsx";
import { ReceiptScanFallback } from "#app/components/receipt/receipt-scan-fallback.tsx";
import { ReceiptScanner } from "#app/components/receipt/receipt-scanner.tsx";
import type { ReceiptData } from "#app/hooks/use-receipt-scan.ts";
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
	const [receiptData, setReceiptData] = useState<{
		data: ReceiptData;
		originalFile: File;
		compressedBase64: string;
	} | null>(null);
	const [failureFile, setFailureFile] = useState<File | null>(null);

	const handleScanSuccess = (data: ReceiptData, originalFile: File, compressedBase64: string) => {
		setReceiptData({ data, originalFile, compressedBase64 });
	};

	const handleScanFailure = (originalFile: File | null) => {
		setFailureFile(originalFile);
	};

	const handleClose = () => {
		setReceiptData(null);
		setFailureFile(null);
	};

	if (receiptData) {
		return (
			<DialogPopup className="max-h-[92vh] overflow-y-scroll sm:max-w-[750px]">
				<ReceiptReview
					receiptData={receiptData.data}
					originalFile={receiptData.originalFile}
					compressedBase64={receiptData.compressedBase64}
					onBack={handleClose}
				/>
			</DialogPopup>
		);
	}

	if (failureFile) {
		return (
			<DialogPopup className="sm:max-w-md">
				<ReceiptScanFallback originalFile={failureFile} onBack={handleClose} />
			</DialogPopup>
		);
	}

	return (
		<DialogPopup className="max-h-[92vh] overflow-y-scroll sm:max-w-[750px]">
			<DialogHeader>
				<DialogTitle>Scan Receipt</DialogTitle>
				<DialogDescription>
					Take a photo of your receipt to automatically extract expense details.
				</DialogDescription>
			</DialogHeader>
			<div className="flex flex-col items-center justify-center py-8">
				<ReceiptScanner onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} />
			</div>
		</DialogPopup>
	);
}
