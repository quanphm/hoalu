import { useReceiptScan, type ReceiptScanResult } from "#app/hooks/use-receipt-scan.ts";
import { FileTextIcon, ScanIcon, UploadIcon, XIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { Dialog, DialogContent } from "@hoalu/ui/dialog";
import { cn } from "@hoalu/ui/utils";
import { useCallback, useRef, useState } from "react";

const MAX_FILES = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
const ACCEPTED_MIME_SET = new Set(ACCEPTED_TYPES);

interface ReceiptScannerProps {
	onScanSuccess: (results: ReceiptScanResult[]) => void;
	onScanFailure: (files: File[]) => void;
}

interface PendingFile {
	file: File;
	/** Object URL for image previews; null for PDFs */
	previewUrl: string | null;
}

function isPdf(file: File) {
	return file.type === "application/pdf";
}

/**
 * Compress an image file to a JPEG base64 string (max 1280px wide, 0.75 quality).
 * For PDFs, returns the raw base64 data URL of the original file bytes so the
 * AI vision model can try to parse it.
 */
async function encodeFileForOcr(file: File): Promise<{
	base64: string;
	previewBase64: string | null;
}> {
	if (isPdf(file)) {
		// Send the raw PDF bytes as base64
		const buffer = await file.arrayBuffer();
		const bytes = new Uint8Array(buffer);
		let binary = "";
		for (const byte of bytes) {
			binary += String.fromCharCode(byte);
		}
		const base64 = `data:application/pdf;base64,${btoa(binary)}`;
		return { base64, previewBase64: null };
	}

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
				resolve({ base64, previewBase64: base64 });
			};
			img.onerror = () => reject(new Error("Failed to load image"));
			img.src = e.target?.result as string;
		};
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsDataURL(file);
	});
}

export function ReceiptScanner({ onScanSuccess, onScanFailure }: ReceiptScannerProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [isScanning, setIsScanning] = useState(false);
	const scanMutation = useReceiptScan();

	const addFiles = useCallback((incoming: File[]) => {
		const valid = incoming.filter((f) => ACCEPTED_MIME_SET.has(f.type));
		if (valid.length === 0) return;

		setPendingFiles((prev) => {
			const combined = [...prev];
			for (const file of valid) {
				if (combined.length >= MAX_FILES) break;
				// Deduplicate by name + size
				const isDupe = combined.some(
					(p) => p.file.name === file.name && p.file.size === file.size,
				);
				if (!isDupe) {
					combined.push({
						file,
						previewUrl: isPdf(file) ? null : URL.createObjectURL(file),
					});
				}
			}
			return combined;
		});
	}, []);

	const removeFile = (index: number) => {
		setPendingFiles((prev) => {
			const next = [...prev];
			const removed = next.splice(index, 1)[0];
			if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
			return next;
		});
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		addFiles(files);
		e.target.value = "";
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		// Only clear when truly leaving the drop zone (not entering a child)
		if (!e.currentTarget.contains(e.relatedTarget as Node)) {
			setIsDragging(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const files = Array.from(e.dataTransfer.files);
		addFiles(files);
	};

	const handleScan = async () => {
		if (pendingFiles.length === 0) return;

		setIsScanning(true);
		try {
			// Encode all files for OCR in parallel
			const encoded = await Promise.all(
				pendingFiles.map(async (p) => {
					const { base64, previewBase64 } = await encodeFileForOcr(p.file);
					return { file: p.file, previewBase64, base64 };
				}),
			);

			const results = await scanMutation.mutateAsync(encoded);

			// Cleanup object URLs
			setPendingFiles((prev) => {
				for (const p of prev) {
					if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
				}
				return [];
			});

			const successes = results.filter((r) => r.data !== null);
			const failures = results.filter((r) => r.data === null).map((r) => r.file);

			if (successes.length > 0) {
				onScanSuccess(results);
			} else {
				onScanFailure(failures);
			}
		} catch (error) {
			console.error("Receipt scan error:", error);
			onScanFailure(pendingFiles.map((p) => p.file));
		} finally {
			setIsScanning(false);
		}
	};

	return (
		<div className="flex w-full flex-col gap-4">
			{/* Drop zone */}
			<div
				className={cn(
					"flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors",
					isDragging
						? "border-primary bg-primary/5"
						: "border-muted-foreground/25 hover:border-muted-foreground/50",
				)}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<div className="bg-muted flex size-12 items-center justify-center rounded-full">
					<UploadIcon className="text-muted-foreground size-5" />
				</div>
				<div className="text-center">
					<p className="text-sm font-medium">Drop files here or browse</p>
					<p className="text-muted-foreground mt-1 text-xs">
						Images (JPEG, PNG, WEBP, HEIC) or PDF — up to {MAX_FILES} files
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							if (fileInputRef.current) {
								fileInputRef.current.removeAttribute("capture");
								fileInputRef.current.click();
							}
						}}
					>
						Browse files
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							if (fileInputRef.current) {
								fileInputRef.current.setAttribute("capture", "environment");
								fileInputRef.current.click();
							}
						}}
					>
						Use camera
					</Button>
				</div>
			</div>

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept={ACCEPTED_TYPES.join(",")}
				multiple
				className="hidden"
				onChange={handleFileInputChange}
			/>

			{/* Preview grid */}
			{pendingFiles.length > 0 && (
				<div className="space-y-3">
					<p className="text-sm font-medium">
						{pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""} selected
					</p>
					<div className="flex flex-wrap gap-2">
						{pendingFiles.map((p, idx) => (
							<div key={`${p.file.name}-${p.file.size}`} className="group relative size-24 flex-shrink-0">
								<div className="border-muted bg-muted/50 size-full overflow-hidden rounded-md border">
									{p.previewUrl ? (
										<img
											src={p.previewUrl}
											alt={p.file.name}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full flex-col items-center justify-center gap-1 p-2">
											<FileTextIcon className="text-muted-foreground size-6" />
											<span className="text-muted-foreground line-clamp-2 text-center text-[10px] leading-tight">
												{p.file.name}
											</span>
										</div>
									)}
								</div>
								<button
									type="button"
									onClick={() => removeFile(idx)}
									className="bg-background border-muted absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
								>
									<XIcon className="size-3" />
								</button>
							</div>
						))}
					</div>

					<Button
						type="button"
						className="w-full"
						onClick={handleScan}
						disabled={isScanning}
					>
						<ScanIcon className="mr-2 size-4" />
						Scan {pendingFiles.length} attachment{pendingFiles.length > 1 ? "s" : ""}
					</Button>
				</div>
			)}

			{/* Scanning overlay dialog */}
			<Dialog open={isScanning} onOpenChange={() => {}}>
				<DialogContent className="sm:max-w-md">
					<div className="flex flex-col items-center justify-center py-8">
						<div className="mb-4 size-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
						<p className="text-sm font-medium">
							Analyzing {pendingFiles.length} attachment
							{pendingFiles.length > 1 ? "s" : ""}…
						</p>
						<p className="text-muted-foreground mt-1 text-xs">This may take a few seconds</p>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
