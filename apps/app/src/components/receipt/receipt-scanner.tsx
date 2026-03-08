import { useReceiptScan, type ReceiptData } from "#app/hooks/use-receipt-scan.ts";
import { CameraIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { Dialog, DialogContent } from "@hoalu/ui/dialog";
import { useRef, useState } from "react";

interface ReceiptScannerProps {
	onScanSuccess: (data: ReceiptData, originalFile: File, compressedBase64: string) => void;
	onScanFailure: (originalFile: File | null) => void;
}

export function ReceiptScanner({ onScanSuccess, onScanFailure }: ReceiptScannerProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isScanning, setIsScanning] = useState(false);
	const scanMutation = useReceiptScan();

	const compressImage = async (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const img = new Image();
				img.onload = () => {
					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");
					if (!ctx) {
						reject(new Error("Failed to get canvas context"));
						return;
					}

					const maxWidth = 1280;
					let width = img.width;
					let height = img.height;

					if (width > maxWidth) {
						height = (height * maxWidth) / width;
						width = maxWidth;
					}

					canvas.width = width;
					canvas.height = height;
					ctx.drawImage(img, 0, 0, width, height);

					const base64 = canvas.toDataURL("image/jpeg", 0.75);
					resolve(base64);
				};
				img.onerror = () => reject(new Error("Failed to load image"));
				img.src = e.target?.result as string;
			};
			reader.onerror = () => reject(new Error("Failed to read file"));
			reader.readAsDataURL(file);
		});
	};

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		event.target.value = "";
		setIsScanning(true);

		try {
			const compressedBase64 = await compressImage(file);
			const result = await scanMutation.mutateAsync(compressedBase64);

			if (result) {
				onScanSuccess(result, file, compressedBase64);
			} else {
				onScanFailure(file);
			}
		} catch (error) {
			console.error("Receipt scan error:", error);
			onScanFailure(file);
		} finally {
			setIsScanning(false);
		}
	};

	const handleCameraClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.setAttribute("capture", "environment");
			fileInputRef.current.click();
		}
	};

	return (
		<>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={handleFileChange}
			/>

			<Button type="button" variant="outline" onClick={handleCameraClick}>
				<CameraIcon className="mr-2 size-4" />
				Scan Receipt
			</Button>

			<Dialog open={isScanning} onOpenChange={() => {}}>
				<DialogContent className="sm:max-w-md">
					<div className="flex flex-col items-center justify-center py-8">
						<div className="mb-4 size-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
						<p className="text-muted-foreground text-sm">Analyzing receipt...</p>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
